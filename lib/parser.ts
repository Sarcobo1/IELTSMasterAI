// 📂 lib/parser.ts - TO'LIQ VERSIYA

import { PassagePart } from './models/Test';

// ============================================================================
// 1. SNIPPET TOPISH - Savolga mos keladigan matn parchani topadi
// ============================================================================
export const findBestSnippet = (questionText: string, passageText: string): string => {
    const stopWords: string[] = [
        'a', 'an', 'the', 'and', 'or', 'is', 'are', 'was', 'were', 
        'to', 'of', 'in', 'on', 'at', 'what', 'where', 'when', 
        'which', 'who', 'why', 'how', 'its', 'their', 'our', 'my'
    ];
    
    const questionWords = questionText
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") 
        .split(/\s+/) 
        .filter(word => word.length > 3 && !stopWords.includes(word));

    if (questionWords.length === 0) {
        return "Savoldan aniq kalit so'zlar ajratilmadi.";
    }

    const paragraphs = passageText.split(/\n\s*\n/g).filter(p => p.trim() !== '');
    let bestSnippet = "";
    let maxMatchCount = 0;

    for (const paragraph of paragraphs) {
        let matchCount = 0;
        const lowerParagraph = paragraph.toLowerCase();
        
        questionWords.forEach(qWord => {
            if (lowerParagraph.includes(qWord)) matchCount++;
        });

        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestSnippet = paragraph;
        }
    }
    
    return bestSnippet.trim() || "Matnda savolga mos keladigan paragraf topilmadi.";
};

// ============================================================================
// 2. PARAGRAF AJRATISH - Matnni paragraflarga bo'ladi
// ============================================================================
export const splitPassageIntoParagraphs = (text: string): PassagePart[] => {
    const paragraphs: string[] = text.split(/\n\s*\n/g).filter(p => p.trim() !== '');
    return paragraphs.map((p, index) => ({
        id: `p${index + 1}`,
        text: p.trim()
    }));
};

// ============================================================================
// 3. INTERFACES
// ============================================================================
export interface ParsedPart {
    partNumber: number;
    passage: string;
    questions: string;
}

export interface ParseResult {
    parts: ParsedPart[];
    fullPassageText: string;
    // Global savol raqami -> to'g'ri javob (PDF oxiridagi ANSWERS bo'limidan)
    answersMap?: Record<number, string>;
}

// ============================================================================
// 4. ASOSIY PARSER FUNKSIYASI
// ============================================================================
/**
 * PDF matnini tahlil qiladi va Part'larga ajratadi
 * 
 * Qo'llab-quvvatlanadigan formatlar:
 * - Format 1: PART 1 Passage... QUESTIONS PART 1... ANSWERS...
 * - Format 2: PART 1 Passage + Questions birga
 * - Format 3: Oddiy bitta passage
 */
export function parseIeltsPdfText(rawText: string): ParseResult {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 PARSING PDF TEXT');
    console.log('='.repeat(70));
    console.log('📝 Total length:', rawText.length, 'characters');
    
    // STRATEGIYA 1: QUESTIONS bo'limi bor (PART format)
    if (rawText.includes('QUESTIONS')) {
        console.log('✅ Detected format with QUESTIONS section');
        return parseWithQuestionsSection(rawText);
    }
    
    // STRATEGIYA 2: "READING PASSAGE 1, 2, 3" format
    const readingPassagePattern = /READING\s+PASSAGE\s+(\d+)/gi;
    const readingPassageMatches = Array.from(rawText.matchAll(readingPassagePattern));
    
    if (readingPassageMatches.length >= 2) {
        console.log(`✅ Found ${readingPassageMatches.length} READING PASSAGE markers`);
        return parseReadingPassageFormat(rawText);
    }
    
    // STRATEGIYA 3: "PART 1, 2, 3" format
    const partPattern = /PART\s+(\d+)/gi;
    const partMatches = Array.from(rawText.matchAll(partPattern));
    
    if (partMatches.length >= 3) {
        console.log(`✅ Found ${partMatches.length} PART markers`);
        return parseIntegratedFormat(rawText);
    }
    
    // STRATEGIYA 4: Fallback - bitta passage
    console.log('⚠️ Using fallback: single passage mode');
    return parseSinglePassage(rawText);
}

// ============================================================================
// 5. FORMAT 1: QUESTIONS BO'LIMI BOR (Sizning PDF format)
// ============================================================================
function parseWithQuestionsSection(rawText: string): ParseResult {
    console.log('\n📋 Parsing format with QUESTIONS section');
    
    // 1. QUESTIONS indexini topish
    const questionsIndex = rawText.search(/QUESTIONS/i);
    if (questionsIndex === -1) {
        throw new Error('PDF da "QUESTIONS" bo\'limi topilmadi');
    }
    
    // 2. PASSAGES bloki (boshidan QUESTIONS gacha)
    const passagesBlock = rawText.substring(0, questionsIndex);
    console.log('📖 Passages block:', passagesBlock.length, 'chars');
    
    // 3. QUESTIONS bloki (QUESTIONS dan ANSWERS gacha) va ANSWERS bloki
    const answersIndex = rawText.search(/ANSWERS/i);
    const questionsBlock = answersIndex > 0 
        ? rawText.substring(questionsIndex, answersIndex)
        : rawText.substring(questionsIndex);
    const answersBlock = answersIndex > 0
        ? rawText.substring(answersIndex)
        : '';
    
    console.log('❓ Questions block:', questionsBlock.length, 'chars');
    
    // 4. Har bir PART'ni ajratish
    
    // Passages'dan Part'larni topish
    const passagePattern = /PART\s+(\d+)\s+Passage\s+\d+:\s*([^\n]+)([\s\S]*?)(?=PART\s+\d+|$)/gi;
    const passageMatches = Array.from(passagesBlock.matchAll(passagePattern));
    
    console.log(`📚 Found ${passageMatches.length} passage parts`);
    
    // Questions'dan Part'larni topish
    const questionPattern = /PART\s+(\d+)([\s\S]*?)(?=PART\s+\d+|ANSWERS|$)/gi;
    const questionMatches = Array.from(questionsBlock.matchAll(questionPattern));
    
    console.log(`📝 Found ${questionMatches.length} question parts`);
    
    // 5. Part'larni birlashtirish
    const parts: ParsedPart[] = [];
    
    for (let i = 0; i < Math.min(passageMatches.length, 3); i++) {
        const passageMatch = passageMatches[i];
        const partNumber = parseInt(passageMatch[1]);
        const passageTitle = passageMatch[2].trim();
        const passageText = passageMatch[3].trim();
        
        // Mos questions'ni topish
        const questionMatch = questionMatches.find(q => parseInt(q[1]) === partNumber);
        
        if (!questionMatch) {
            console.warn(`⚠️ Part ${partNumber}: Questions topilmadi, skipping`);
            continue;
        }
        
        const questionsText = questionMatch[2].trim();
        
        // Validation
        if (passageText.length < 50) {
            console.warn(`⚠️ Part ${partNumber}: Passage too short (${passageText.length}), skipping`);
            continue;
        }
        
        if (questionsText.length < 50) {
            console.warn(`⚠️ Part ${partNumber}: Questions too short (${questionsText.length}), skipping`);
            continue;
        }
        
        console.log(`\n✅ Part ${partNumber} extracted:`);
        console.log(`   📖 Title: "${passageTitle}"`);
        console.log(`   📖 Passage: ${passageText.length} chars`);
        console.log(`   ❓ Questions: ${questionsText.length} chars`);
        console.log(`   📝 Preview: ${passageText.substring(0, 80).replace(/\n/g, ' ')}...`);
        
        parts.push({
            partNumber,
            passage: passageText,
            questions: questionsText
        });
    }
    
    if (parts.length === 0) {
        throw new Error('PDF dan hech qanday Part ajratib bo\'lmadi. Fayl strukturasini tekshiring.');
    }
    
    const fullPassageText = parts.map(p => p.passage).join('\n\n--- NEXT PASSAGE ---\n\n');

    // 6. ANSWERS bo'limidan javoblarni ajratib olish
    const answersMap = parseAnswersBlock(answersBlock);
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`✅ PARSING COMPLETE: ${parts.length} parts extracted, answers: ${Object.keys(answersMap).length}`);
    console.log(`${'═'.repeat(70)}\n`);
    
    return { parts, fullPassageText, answersMap };
}

// ============================================================================
// 6. FORMAT 2: HAR BIR PART ICHIDA PASSAGE + QUESTIONS BIRGA
// ============================================================================
function parseIntegratedFormat(rawText: string): ParseResult {
    console.log('\n📋 Parsing integrated format');
    
    const partPattern = /PART\s+(\d+)/gi;
    const partMatches = Array.from(rawText.matchAll(partPattern));
    
    const parts: ParsedPart[] = [];
    
    for (let i = 0; i < partMatches.length && i < 3; i++) {
        const currentMatch = partMatches[i];
        const partNumber = parseInt(currentMatch[1]);
        const partStart = currentMatch.index!;
        const partEnd = partMatches[i + 1]?.index ?? rawText.length;
        
        const partText = rawText.substring(partStart, partEnd);
        
        // Questions'ni topish
        const questionPatterns = [
            /Questions?\s+\d+[-–]\d+/i,
            /\d+\.\s+[A-Z]/m,
        ];
        
        let questionStartIndex = -1;
        
        for (const pattern of questionPatterns) {
            const match = partText.match(pattern);
            if (match && match.index! > 50) {
                questionStartIndex = match.index!;
                break;
            }
        }
        
        if (questionStartIndex === -1) {
            console.warn(`⚠️ Part ${partNumber}: Questions not found, skipping`);
            continue;
        }
        
        let passage = partText.substring(0, questionStartIndex).trim();
        const questions = partText.substring(questionStartIndex).trim();
        
        // Tozalash
        passage = passage
            .replace(/PART\s+\d+/gi, '')
            .replace(/Passage\s+\d+:.*$/m, '')
            .trim();
        
        if (passage.length > 100 && questions.length > 50) {
            console.log(`✅ Part ${partNumber}: ${passage.length} chars passage, ${questions.length} chars questions`);
            
            parts.push({
                partNumber,
                passage,
                questions
            });
        } else {
            console.warn(`⚠️ Part ${partNumber}: Too short, skipping`);
        }
    }
    
    if (parts.length === 0) {
        throw new Error('PDF dan Part\'lar ajratib bo\'lmadi.');
    }
    
    const fullPassageText = parts.map(p => p.passage).join('\n\n--- NEXT PASSAGE ---\n\n');
    
    console.log(`✅ Parsed ${parts.length} parts successfully\n`);
    
    return { parts, fullPassageText };
}

// ============================================================================
// 7. FORMAT 3: FALLBACK - BITTA PASSAGE
// ============================================================================
function parseSinglePassage(rawText: string): ParseResult {
    console.log('\n📋 Fallback: Single passage mode');
    
    const questionPatterns = [
        /Questions?\s+\d+[-–]\d+/i,
        /\d+\.\s+[A-Z]/m,
    ];
    
    let questionStartIndex = -1;
    
    for (const pattern of questionPatterns) {
        const match = rawText.match(pattern);
        if (match && match.index! > 200) {
            questionStartIndex = match.index!;
            console.log(`✅ Questions found at position ${questionStartIndex}`);
            break;
        }
    }
    
    if (questionStartIndex === -1) {
        throw new Error('PDF dan Passage va Questions ajratib bo\'lmadi. Fayl formatini tekshiring.');
    }
    
    const passage = rawText.substring(0, questionStartIndex).trim();
    const questions = rawText.substring(questionStartIndex).trim();
    
    console.log(`📖 Passage: ${passage.length} chars`);
    console.log(`❓ Questions: ${questions.length} chars`);
    
    if (passage.length < 100) {
        throw new Error('Passage juda qisqa. PDF fayl to\'g\'ri formatda emasligini tekshiring.');
    }
    
    console.log('✅ Single passage parsed successfully\n');
    
    return {
        parts: [{
            partNumber: 1,
            passage,
            questions
        }],
        fullPassageText: passage,
        answersMap: {}, // Single-passage fallbackda ANSWERS alohida ko'rilmaydi
    };
}

// ============================================================================
// 8. READING PASSAGE FORMAT (IELTS Academic standard format)
// ============================================================================
function parseReadingPassageFormat(rawText: string): ParseResult {
    console.log('\n📋 Parsing READING PASSAGE format (IELTS Academic)');
    
    // Pattern: "READING PASSAGE 1" yoki "Reading Passage 1"
    const passagePattern = /READING\s+PASSAGE\s+(\d+)/gi;
    const passageMatches = Array.from(rawText.matchAll(passagePattern));
    
    console.log(`📚 Found ${passageMatches.length} reading passages`);
    
    const parts: ParsedPart[] = [];
    
    for (let i = 0; i < passageMatches.length; i++) {
        const currentMatch = passageMatches[i];
        const partNumber = parseInt(currentMatch[1]);
        const sectionStart = currentMatch.index!;
        const sectionEnd = passageMatches[i + 1]?.index ?? rawText.length;
        
        const sectionText = rawText.substring(sectionStart, sectionEnd);
        
        console.log(`\n📖 Processing Reading Passage ${partNumber}`);
        console.log(`   Section length: ${sectionText.length} chars`);
        
        // Questions'ni topish
        const questionPatterns = [
            /Questions?\s+\d+[-–]\d+/i,
            /Questions?\s+\d+\s*$/m,
            /^\d+\.\s+/m,
        ];
        
        let questionStartIndex = -1;
        let usedPattern = '';
        
        for (const pattern of questionPatterns) {
            const match = sectionText.match(pattern);
            if (match && match.index! > 100) {
                questionStartIndex = match.index!;
                usedPattern = pattern.source;
                console.log(`   ✅ Questions found at ${questionStartIndex} using pattern: ${usedPattern}`);
                break;
            }
        }
        
        if (questionStartIndex === -1) {
            console.warn(`   ⚠️ Questions not found for Passage ${partNumber}, skipping`);
            continue;
        }
        
        // Passage va Questions'ni ajratish
        let passage = sectionText.substring(0, questionStartIndex).trim();
        const questions = sectionText.substring(questionStartIndex).trim();
        
        // Tozalash - "READING PASSAGE N" va boshqa headerlarni olib tashlash
        passage = passage
            .replace(/READING\s+PASSAGE\s+\d+/gi, '')
            .replace(/You should spend.*?below\./gi, '')
            .trim();
        
        // Passage title'ni topish (birinchi qator odatda title)
        const lines = passage.split('\n').filter(l => l.trim());
        const passageTitle = lines.length > 0 ? lines[0].trim() : `Passage ${partNumber}`;
        
        // Agar title topilsa, uni passage'dan olib tashlash
        if (lines.length > 1) {
            passage = lines.slice(1).join('\n').trim();
        }
        
        // Validation
        if (passage.length < 100) {
            console.warn(`   ⚠️ Passage ${partNumber}: Too short (${passage.length} chars), skipping`);
            continue;
        }
        
        if (questions.length < 50) {
            console.warn(`   ⚠️ Passage ${partNumber}: Questions too short (${questions.length} chars), skipping`);
            continue;
        }
        
        console.log(`   ✅ Successfully extracted:`);
        console.log(`      📖 Title: "${passageTitle}"`);
        console.log(`      📖 Passage: ${passage.length} chars`);
        console.log(`      ❓ Questions: ${questions.length} chars`);
        console.log(`      📝 Preview: ${passage.substring(0, 80).replace(/\n/g, ' ')}...`);
        
        parts.push({
            partNumber,
            passage,
            questions
        });
    }
    
    if (parts.length === 0) {
        throw new Error('PDF dan Reading Passage\'lar ajratib bo\'lmadi. Fayl strukturasini tekshiring.');
    }
    
    const fullPassageText = parts.map(p => p.passage).join('\n\n--- NEXT PASSAGE ---\n\n');

    // READING PASSAGE formatida ham umumiy ANSWERS bo'limi bo'lishi mumkin
    const answersIndex = rawText.search(/ANSWERS/i);
    const answersBlock = answersIndex > 0 ? rawText.substring(answersIndex) : '';
    const answersMap = parseAnswersBlock(answersBlock);
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`✅ PARSING COMPLETE: ${parts.length} reading passages extracted, answers: ${Object.keys(answersMap).length}`);
    console.log(`${'═'.repeat(70)}\n`);
    
    return { parts, fullPassageText, answersMap };
}

// ============================================================================
// 9. ANSWERS BLOKINI PARSING QILISH
// ============================================================================
/**
 * PDF oxiridagi ANSWERS bo'limidan
 * 1. A
 * 2. TRUE
 * 3. NOT GIVEN
 * ko'rinishidagi satrlarni o'qib, {1: 'A', 2: 'TRUE', ...} ko'rinishida qaytaradi
 */
function parseAnswersBlock(answersBlock: string): Record<number, string> {
    const map: Record<number, string> = {};
    if (!answersBlock || answersBlock.trim().length === 0) return map;

    console.log('🔎 Parsing ANSWERS block...');

    // Faqat ANSWERS dan keyingi qismini olamiz
    const cleaned = answersBlock.replace(/^[^\n]*ANSWERS[^\n]*\n?/i, '');
    const lines = cleaned.split('\n');

    const answerLineRegex = /^(\d+)\s*[\).\:-]?\s*(.+)$/i;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const match = line.match(answerLineRegex);
        if (!match) continue;

        const num = parseInt(match[1], 10);
        if (isNaN(num)) continue;

        let value = match[2].trim();

        // Birinchi tokenni olish (masalan "A. Paris" -> "A", "TRUE something" -> "TRUE")
        const firstToken = value.split(/\s+/)[0].replace(/[().]/g, '').toUpperCase();

        // TFNG yoki variant kodi sifatida normalizatsiya
        if (['TRUE', 'T'].includes(firstToken)) {
            map[num] = 'TRUE';
        } else if (['FALSE', 'F'].includes(firstToken)) {
            map[num] = 'FALSE';
        } else if (['NG', 'NOT', 'N'].includes(firstToken) || value.toUpperCase().startsWith('NOT GIVEN')) {
            map[num] = 'NOT GIVEN';
        } else if (/^[A-D]$/.test(firstToken)) {
            map[num] = firstToken; // Multiple choice: A/B/C/D
        } else {
            // Aks holda butun satrni javob matni sifatida saqlab qo'yamiz
            map[num] = value;
        }
    }

    console.log('✅ ANSWERS parsed:', map);
    return map;
}