import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const groqApiKey = process.env.GROQ_API_KEY;

// For image analysis, use Gemini 2.0 Flash (multimodal, stable, supports vision/OCR)
const GEMINI_VISION_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const geminiApiKey = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

function getMimeType(fileName: string, type: string): string {
  if (type.startsWith('image/')) return type;
  if (type.startsWith('audio/')) return type;

  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg',
    flac: 'audio/flac', webm: 'audio/webm',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  };
  return map[ext || ''] || type || 'application/octet-stream';
}

async function callGroqApi(messages: any[], stream: boolean = false): Promise<any> {
  if (!groqApiKey) throw new Error("GROQ_API_KEY not found");

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: stream,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API Error (${response.status}):`, errorText);
    throw new Error(`Groq API xatosi: ${errorText.substring(0, 200)}`);
  }

  return response;
}

async function transcribeAudioWithGroq(audioFile: File): Promise<string> {
  if (!groqApiKey) throw new Error("GROQ_API_KEY not found");

  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');
  formData.append('language', 'en');

  const response = await fetch(GROQ_AUDIO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq Whisper Error (${response.status}):`, errorText);
    throw new Error(`Audio transcription xatosi: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.text || '';
}

async function analyzeImageWithGemini(imageBase64: string, mimeType: string, userPrompt: string): Promise<any> {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY yo'q. Image tahlili uchun Gemini API key kerak. https://aistudio.google.com/app/apikey dan oling.");
  }

  const prompt = `You are analyzing an image. Extract any text from the image and if it contains an English question, exercise, or problem, provide a detailed solution. Explain in simple English, with Uzbek translations where helpful.

User's question/context: ${userPrompt || 'Please analyze this image'}

Respond with ONLY a valid JSON object in this format:
{
  "type": "image",
  "extracted_text": "any text you see in the image",
  "solution": "your answer, explanation, or solution to any questions in the image"
}`;

  console.log('Calling Gemini Vision API...');
  console.log('Model URL:', GEMINI_VISION_URL);
  console.log('API Key exists:', !!geminiApiKey);
  console.log('API Key starts with:', geminiApiKey.substring(0, 10));

  const response = await fetch(`${GEMINI_VISION_URL}?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: { 
              mime_type: mimeType, 
              data: imageBase64 
            } 
          }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  console.log('Gemini response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini Vision Error (${response.status}):`, errorText);
    
    if (response.status === 404) {
      throw new Error("Model topilmadi. GEMINI_VISION_URL ni 'gemini-2.5-flash' ga o'zgartiring (1.5 eskirgan).");
    }
    if (response.status === 429) {
      throw new Error("Gemini image limit oshib ketdi. Iltimos, keyinroq urinib ko'ring yoki yangi API key oling.");
    }
    if (response.status === 400) {
      throw new Error("Rasm formati noto'g'ri. PNG, JPEG, yoki WebP formatida yuklang.");
    }
    if (response.status === 403) {
      throw new Error("Gemini API kaliti noto'g'ri. .env.local faylini tekshiring.");
    }
    
    throw new Error(`Image tahlili xatosi (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const result = await response.json();
  console.log('Gemini result:', JSON.stringify(result).substring(0, 500));

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('Empty response from Gemini:', result);
    throw new Error("Gemini javob bermadi. Rasm juda katta bo'lishi mumkin.");
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.type = "image";
      return parsed;
    }
    const parsed = JSON.parse(text);
    parsed.type = "image";
    return parsed;
  } catch (e) {
    console.error("JSON parse error:", e, "Response:", text);
    return {
      type: "image",
      extracted_text: "Could not extract structured data",
      solution: text
    };
  }
}

export async function POST(req: Request) {
  console.log("POST /api/grammar so'rovi keldi");

  if (!groqApiKey) {
    return NextResponse.json({ 
      error: 'GROQ_API_KEY yo\'q. https://console.groq.com/ dan API key oling.'
    }, { status: 401 });
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Juda ko\'p so\'rovlar. Iltimos, 1 daqiqadan keyin urinib ko\'ring.' },
      { status: 429 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    let mode: 'chat' | 'grammar' | 'audio' | 'image' = 'chat';
    let userText = '';
    let file: File | null = null;

    if (isMultipart) {
      const formData = await req.formData();
      const rawMode = formData.get('mode') as string | null;
      userText = (formData.get('userText') as string | null) || '';
      file = formData.get('file') as File | null;

      if (!rawMode || !file) {
        return NextResponse.json({ error: 'mode va file talab qilinadi' }, { status: 400 });
      }
      if (!['audio', 'image'].includes(rawMode)) {
        return NextResponse.json({ error: 'mode: audio yoki image' }, { status: 400 });
      }
      mode = rawMode as 'audio' | 'image';
    } else {
      const body = await req.json();
      userText = body.userText || '';
      const rawMode = body.mode || 'chat';

      if (!userText) {
        return NextResponse.json({ error: 'userText talab qilinadi' }, { status: 400 });
      }
      
      // Both 'chat' and 'grammar' mode will use chat
      mode = 'chat';
    }

    console.log(`Mode: ${mode}, UserText: ${userText.substring(0, 50)}, HasFile: ${!!file}`);

    // === CHAT MODE (Streaming) - Also handles grammar checking ===
    if (mode === 'chat') {
      const systemPrompt = `You are an expert English tutor and assistant. You can:
1. Answer questions about English grammar, vocabulary, and usage
2. Check and correct grammar in texts that users provide
3. Explain grammar rules clearly in both English and Uzbek
4. Have general conversations and help with learning English

When a user provides text that needs grammar checking, automatically analyze it and provide corrections with explanations. If the user asks a question, answer it clearly. Be helpful, educational, and friendly.`;

      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userText
        }
      ];

      const response = await callGroqApi(messages, true);

      if (!response.body) {
        throw new Error("Streaming body yo'q");
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine.startsWith('data: ')) {
                  const jsonStr = trimmedLine.slice(6);
                  
                  if (jsonStr === '[DONE]') continue;
                  
                  try {
                    const data = JSON.parse(jsonStr);
                    const content = data.choices?.[0]?.delta?.content;
                    
                    if (content) {
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch (parseErr) {
                    console.error("JSON Parse xatosi:", parseErr);
                  }
                }
              }
            }

            controller.close();
          } catch (e) {
            console.error("Stream reading error:", e);
            controller.error(e);
          } finally {
            reader.releaseLock();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // === AUDIO MODE ===
    if (mode === 'audio' && file) {
      console.log('Transcribing audio with Groq Whisper...');
      console.log('File name:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Transcribe audio
      const transcription = await transcribeAudioWithGroq(file);
      
      if (!transcription) {
        throw new Error("Audio transcription failed");
      }

      console.log('Transcription successful:', transcription.substring(0, 100));

      // Check grammar of transcription
      const messages = [
        {
          role: "system",
          content: `Analyze this transcribed audio text for grammar errors. Return ONLY valid JSON:

{
  "type": "audio",
  "transcription": "original transcription text",
  "corrections": [
    {
      "original": "incorrect phrase",
      "corrected": "correct phrase",
      "explanation": "brief explanation"
    }
  ],
  "final_corrected_text": "corrected version of the transcription"
}

If there are no grammar errors, return an empty corrections array but still include the final_corrected_text (same as transcription).`
        },
        {
          role: "user",
          content: `Transcription: "${transcription}"\n\nUser notes: ${userText || 'None'}\n\nAnalyze the transcription for grammar errors.`
        }
      ];

      const response = await callGroqApi(messages, false);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      let finalResponse;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          finalResponse = JSON.parse(jsonMatch[0]);
        } else {
          finalResponse = JSON.parse(content);
        }
        
        finalResponse.type = "audio";
        finalResponse.transcription = transcription;
      } catch (e) {
        console.error("JSON parse error:", e);
        finalResponse = {
          type: "audio",
          transcription: transcription,
          corrections: [],
          final_corrected_text: transcription
        };
      }

      return NextResponse.json(finalResponse, { status: 200 });
    }

    // === IMAGE MODE ===
    if (mode === 'image' && file) {
      console.log('Analyzing image with Gemini Vision...');
      console.log('File name:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      if (!geminiApiKey) {
        return NextResponse.json({
          error: "GEMINI_API_KEY yo'q. Image tahlili uchun Gemini API key kerak.\n\n1. https://aistudio.google.com/app/apikey ga o'ting\n2. Yangi API key yarating\n3. .env.local fayliga qo'shing: GEMINI_API_KEY=your_key"
        }, { status: 401 });
      }

      const buffer = await file.arrayBuffer();
      
      // Add size check to prevent API errors
      if (buffer.byteLength > 20 * 1024 * 1024) {  // ~20MB limit
        return NextResponse.json({
          error: "Rasm hajmi juda katta (20MB dan oshmasin). Kichikroq rasm yuklang."
        }, { status: 400 });
      }
   
      const base64 = bufferToBase64(buffer);
      const mime = getMimeType(file.name, file.type);

      console.log('Image base64 length:', base64.length);
      console.log('MIME type:', mime);

      const finalResponse = await analyzeImageWithGemini(base64, mime, userText);

      return NextResponse.json(finalResponse, { status: 200 });
    }
//config
    return NextResponse.json({ error: 'Invalid mode or missing file' }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server xatosi';
    console.error("BACKEND XATOSI:", errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}