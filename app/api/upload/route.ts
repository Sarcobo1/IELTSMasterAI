import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import { parseIeltsPdfText, findBestSnippet, splitPassageIntoParagraphs } from '@/lib/parser'; 
import connectDB from '@/lib/mongodb'; 
import TestModel, { ITest } from '@/lib/models/Test'; 
import User from '@/lib/models/User';
import { extractTextFromPdf } from '@/lib/pdfExtractor';
import { QuestionGroup, Question } from '@/lib/models/Test'; 

// GET USER FROM COOKIE
async function getUserIdFromCookie(): Promise<string | null> {
    try {
        const cookieStore = await cookies(); 
        const token = cookieStore.get('auth_token')?.value;
        
        if (!token) return null;
        
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) return null;
        
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        console.error('❌ Cookie verification error:', error);
        return null;
    }
}

// ✅ HELPER: Retry with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 2000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`   📍 Attempt ${attempt}/${maxAttempts}...`);
            return await fn();
        } catch (error: any) {
            lastError = error;
            console.warn(`   ⚠️ Attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxAttempts) {
                const delay = baseDelay * Math.pow(2, attempt - 1); // 2s, 4s, 8s
                console.log(`   ⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// POST ROUTE
export async function POST(request: NextRequest) {
    console.log('📤 POST /api/upload - Started');
    
    try {
        await connectDB();
        console.log('✅ MongoDB connected');
        
        // 1. Authentication
        const userId = await getUserIdFromCookie();
        if (!userId) {
            return NextResponse.json({ error: "Avtorizatsiya talab qilinadi." }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "Foydalanuvchi topilmadi." }, { status: 404 });
        }
        
        console.log('✅ User authenticated:', user.email);
        
        // 2. Premium & Daily Limit Check
        const isPremium = user.isPremium;
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const lastUploadDateStr = user.lastUploadDate?.toISOString().split("T")[0];

        if (!isPremium && lastUploadDateStr === todayStr && user.uploadCount >= 1) {
            return NextResponse.json({ 
                error: "Bugungi limit tugadi. Premium rejaga o'ting yoki ertaga yana urinib ko'ring.",
            }, { status: 429 });
        }
        
        // 3. Check Gemini API Key
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY2;
        if (!GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY2 not found');
            return NextResponse.json({ error: "Konfiguratsiya xatosi: AI kaliti topilmadi." }, { status: 500 });
        }
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        // 4. Get File
        console.log('📄 Reading file...');
        const formData = await request.formData();
        const file = formData.get('file') as File | null; 

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: "Faqat PDF fayllar qabul qilinadi." }, { status: 400 });
        }

        console.log('✅ File received:', file.name, file.size, 'bytes');
        
        const testTitle = file.name.replace(/\.pdf$/i, '').trim() || "Yuklangan test";
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 5. Extract Text from PDF
        console.log('📖 Extracting text from PDF...');
        let rawText = '';
        try {
            rawText = await extractTextFromPdf(buffer);
            console.log('✅ Text extracted:', rawText.length, 'characters');
        } catch (err) {
            console.error("❌ PDF extraction error:", err);
            const errorMessage = err instanceof Error ? err.message : "PDF o'qishda xato";
            return NextResponse.json({ 
                error: "PDF faylni o'qishda xatolik yuz berdi.",
                details: errorMessage
            }, { status: 500 });
        }
        
        if (rawText.trim().length < 100) {
            return NextResponse.json({ error: "PDF fayldan matn ajratib bo'lmadi yoki matn juda qisqa." }, { status: 400 });
        }

        // 6. Parse PDF - Part'larni ajratish
        let parseResult;
        try {
            parseResult = parseIeltsPdfText(rawText);
        } catch (e: any) {
            console.error("❌ Parsing error:", e);
            return NextResponse.json({
                error: e.message || "Matnni tahlil qilishda xato. Fayl strukturasi noto'g'ri.",
            }, { status: 400 });
        }
        
        const { parts: extractedParts, fullPassageText, answersMap = {} } = parseResult;
        
        console.log(`✅ Extracted ${extractedParts.length} parts from PDF`);

        // 7. AI System Instruction
        const systemInstruction = `
        Sizga IELTS Reading testining Savollar qismi matni berilgan. Sizning vazifangiz: 
        matndan savollarni ajratib, JSON formatida qaytarish.

        IELTS Reading testida 3 xil savol turi bor:
        1. GAP-FILL (Bo'sh joy to'ldirish): "pre" va "post" qismlari bor
        2. MULTIPLE CHOICE (Ko'p tanlov): "question" va "options" bor
        3. TRUE/FALSE/NOT GIVEN (TFNG): "statement" bor

        JSON struktura:
        [
          {
            "group_title": "Questions 1-5",
            "type": "gap_fill" | "multiple_choice" | "tfng",
            "instruction": "Complete the sentences. Choose ONE WORD ONLY.",
            "questions": [
              {
                "type": "gap_fill",
                "pre": "The writer mentions",
                "post": "as an example of...",
                "answer": "technology",
                "words": 1
              }
            ]
          }
        ]

        MUHIM: 
        - Faqat JSON formatida javob bering, boshqa matn qo'shmang!
        - Har bir savolga "answer" field qo'shing (to'g'ri javob)
        - Gap-fill uchun: pre, post, words, answer
        - Multiple choice uchun: question, options, answer
        - TFNG uchun: statement, answer (TRUE/FALSE/NOT GIVEN)
        `;

        // 8. Har bir Part uchun AI tahlil (WITH RETRY)
        const finalParts: any[] = [];
        let globalQuestionId = 1;

        for (const extractedPart of extractedParts) {
            console.log(`\n🤖 Analyzing PART ${extractedPart.partNumber} with AI...`);
            
            const userPrompt = `Iltimos, ushbu savollar matnini tahlil qilib, JSON formatida qaytaring:

---
${extractedPart.questions}
---
`;

            let parsedQuestions: QuestionGroup[] = [];

            try {
                // ✅ RETRY MECHANISM
                const analyzeWithRetry = async () => {
                    const model = genAI.getGenerativeModel({ 
                        model: "gemini-2.5-flash", // ✅ Yangi model
                        systemInstruction: systemInstruction,
                    });

                    const result = await model.generateContent({
                        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                        generationConfig: { 
                            responseMimeType: "application/json",
                            temperature: 0.7,
                        }
                    });
                    
                    const jsonString = result.response.text().replace(/```json|```/g, '').trim();
                    return JSON.parse(jsonString);
                };

                parsedQuestions = await retryWithBackoff(analyzeWithRetry, 3, 2000);
                
                console.log(`✅ AI returned ${parsedQuestions.length} question groups for PART ${extractedPart.partNumber}`);
                
                // Validation va fix
                parsedQuestions = parsedQuestions.filter(g => g.questions && g.questions.length > 0).map((group: any) => {
                    
                    // Group type fix
                    if (!group.type) {
                        const firstQ = group.questions?.[0];
                        if (firstQ?.options) {
                            group.type = 'multiple_choice';
                        } else if (firstQ?.statement) {
                            group.type = 'tfng';
                        } else {
                            group.type = 'gap_fill';
                        }
                    }
                    
                    // Instruction fix
                    if (!group.instruction) {
                        if (group.type === 'gap_fill') {
                            group.instruction = 'Complete the sentences.';
                        } else if (group.type === 'multiple_choice') {
                            group.instruction = 'Choose the correct answer.';
                        } else if (group.type === 'tfng') {
                            group.instruction = 'Do the statements agree with the passage?';
                        }
                    }
                    
                    // Questions validation
                    group.questions = group.questions.map((q: any) => {
                        delete q.id; // Remove AI's ID
                        if (!q.type) q.type = group.type;
                        
                        if (q.type === 'gap_fill') {
                            if (!q.pre) q.pre = ' ';
                            if (!q.post) q.post = ' ';
                            if (!q.words) q.words = 1;
                        }
                        
                        if (q.type === 'multiple_choice') {
                            if (!q.question) q.question = 'Question text missing';
                            if (!q.options || !Array.isArray(q.options)) {
                                q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
                            }
                            q.pre = ' ';
                            q.post = ' ';
                            q.words = 1;
                        }
                        
                        if (q.type === 'tfng') {
                            if (!q.statement) q.statement = 'Statement text missing';
                            // Javobni hozircha bo'sh qoldiramiz, keyin ANSWERS blokidan to'ldiramiz
                            q.pre = ' ';
                            q.post = ' ';
                            q.words = 1;
                        }
                        
                        if (!q.answer) q.answer = '';
                        
                        return q;
                    }) as Question[];
                    
                    return group;
                });
                
                console.log(`✅ Validated ${parsedQuestions.length} question groups`);
                
            } catch (e) {
                console.error(`❌ AI tahlili xatosi (PART ${extractedPart.partNumber}):`, e);
                return NextResponse.json({
                    error: `PART ${extractedPart.partNumber} ni tahlil qilishda xatolik. ${e instanceof Error && e.message.includes('overloaded') ? 'AI server band. Iltimos, bir oz kutib qayta urinib ko\'ring.' : ''}`,
                    details: e instanceof Error ? e.message : "Noma'lum xato"
                }, { status: 500 });
            }
            
            // Passage'ni paragraflarga ajratish
            const passageParagraphs = splitPassageIntoParagraphs(extractedPart.passage);
            
            console.log(`✅ Passage split into ${passageParagraphs.length} paragraphs`);
            
            // Question ID'larni qo'shish va PDF ANSWERS bo'limidan javoblarni ulash
            const partGroups = parsedQuestions.map(group => ({
                ...group,
                questions: group.questions.map(q => {
                    const assignedId = globalQuestionId++;
                    let finalAnswer = q.answer || '';

                    // Agar ANSWERS blokida shu savol uchun javob bo'lsa, AI javobini emas, o'shani ishlatamiz
                    if (answersMap[assignedId]) {
                        let ans = answersMap[assignedId].toUpperCase();

                        if (group.type === 'tfng') {
                            // Agar ANSWERS bo'limida A/B/C shaklida berilgan bo'lsa, variantlar orqali TFNG ga map qilamiz
                            if (/^[A-C]$/.test(ans) && q.options && q.options.length >= 3) {
                                const idx = ans.charCodeAt(0) - 65; // A->0, B->1, C->2
                                const rawOpt = q.options[idx] || '';
                                const optText = rawOpt.replace(/^[A-Z]\.\s*/, '').trim().toUpperCase();
                                
                                if (optText.startsWith('TRUE')) ans = 'TRUE';
                                else if (optText.startsWith('FALSE')) ans = 'FALSE';
                                else ans = 'NOT GIVEN';
                            } else {
                                // TRUE/FALSE/NOT GIVEN ni normalizatsiya qilish
                                if (['T', 'TRUE'].includes(ans)) ans = 'TRUE';
                                else if (['F', 'FALSE'].includes(ans)) ans = 'FALSE';
                                else ans = 'NOT GIVEN';
                            }
                        }

                        finalAnswer = ans;
                    } else if (group.type === 'tfng') {
                        // ANSWERS bo'lmasa, xavfsiz default
                        if (!finalAnswer || !['TRUE', 'FALSE', 'NOT GIVEN'].includes(finalAnswer.toUpperCase())) {
                            finalAnswer = 'NOT GIVEN';
                        }
                    }

                    return {
                        ...q,
                        id: assignedId,
                        answer: finalAnswer,
                    } as Question;
                }) as Question[]
            }));
            
            // Part'ni qo'shish
            finalParts.push({
                part_id: extractedPart.partNumber,
                passage_title: `Reading Passage ${extractedPart.partNumber}`,
                passage: passageParagraphs,
                question_groups: partGroups,
            });
            
            console.log(`✅ PART ${extractedPart.partNumber} processed successfully`);
        }
        
        // 9. Save to Database
        console.log('💾 Saving to database...');
        
        const totalQuestionsCount = finalParts.reduce((sum, part) => 
            sum + part.question_groups.reduce((gSum: number, group: QuestionGroup) => 
                gSum + group.questions.length, 0), 0);
            
        const newTest: ITest = {
            test_id: `custom_${Date.now()}`,
            test_title: testTitle, 
            level: "User Upload",
            total_questions: totalQuestionsCount,
            full_passage_text: fullPassageText, 
            parts: finalParts,
        } as ITest;

        await TestModel.create(newTest);
        console.log('✅ Test saved:', newTest.test_id);
        
        // 10. Update Upload Count
        if (lastUploadDateStr !== todayStr) {
            await User.findByIdAndUpdate(userId, {
                lastUploadDate: today,
                uploadCount: 1
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $inc: { uploadCount: 1 }
            });
        }
        
        console.log('✅ POST /api/upload - Success');
        
        return NextResponse.json({
            success: true,
            message: "Test muvaffaqiyatli tahlil qilindi.",
            test_id: newTest.test_id,
            test_title: testTitle, 
            total_questions: totalQuestionsCount,
            parts_count: finalParts.length,
            parts: newTest.parts
        }, { status: 200 });
            
    } catch (error) {
        console.error("❌ POST server error:", error);
        return NextResponse.json({ 
            error: "Kutilmagan server xatosi.",
            details: error instanceof Error ? error.message : "Noma'lum xato"
        }, { status: 500 });
    }
}

// GET ROUTE - Answer Check
export async function GET(request: NextRequest) {
    console.log('📥 GET /api/upload - Answer Check Started');
    
    try {
        await connectDB();
        
        const userId = await getUserIdFromCookie();
        if (!userId) {
            return NextResponse.json({ error: "Avtorizatsiya talab qilinadi." }, { status: 401 });
        }
        
        const { searchParams } = request.nextUrl;
        
        const questionText = searchParams.get('question_text');
        const userAnswer = searchParams.get('user_answer');
        const fullPassage = searchParams.get('full_passage'); 
        const correctAnswer = searchParams.get('correct_answer');

        if (!questionText || !userAnswer || !fullPassage || !correctAnswer) {
            return NextResponse.json({ 
                error: "Kerakli ma'lumotlar yetishmayapti." 
            }, { status: 400 });
        }

        const snippet = findBestSnippet(questionText, fullPassage); 
        
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY2;
        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Kaliti topilmadi." }, { status: 500 });
        }
        
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const checkAnswerSystemPrompt = `
        Siz IELTS Reading testida javoblarni tekshiruvchi ekspertsiz.
        Sizning vazifangiz:
        1. Berilgan savol, foydalanuvchi javobi va to'g'ri javobni matndagi kontekstga asoslanib tahlil qilish.
        2. Quyidagi JSON formatida natijani qaytarish:
           {
               "status": "correct" | "incorrect" | "partial",
               "explanation": "Nega bu javob to'g'ri/noto'g'ri ekanligini tushuntirib bering. Xatolikni ko'rsating va to'g'ri javob nima uchun o'rinli ekanligini izohlang. Izohni o'zbek tilida yozing."
           }
        3. Faqat JSON formatida javob bering, boshqa matn qo'shmang.
        `;

        const checkAnswerUserPrompt = `
        Savol: ${questionText}
        Matndan olingan kontekst: ${snippet}
        Talaba Javobi: ${userAnswer}
        To'g'ri Javob: ${correctAnswer}
        `;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: checkAnswerSystemPrompt,
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: checkAnswerUserPrompt }] }],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.5,
            }
        });
        
        const jsonText = result.response.text().replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(jsonText);
        
        console.log('✅ GET /api/upload - Answer Check Success');
        
        return NextResponse.json({
            success: true,
            status: jsonResult.status,
            explanation: jsonResult.explanation,
            snippet_used: snippet,
        }, { status: 200 });
        
    } catch (error) {
        console.error("❌ GET server error:", error);
        return NextResponse.json({ 
            error: "Javobni tekshirishda xatolik.",
            details: error instanceof Error ? error.message : "Noma'lum xato"
        }, { status: 500 });
    }
}