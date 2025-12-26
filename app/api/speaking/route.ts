// app/api/groq-score/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { transcript, question, recordingTime } = await request.json()

    console.log('📝 Received transcript:', {
      length: transcript?.length,
      preview: transcript?.substring(0, 100),
      recordingTime
    })

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // ✅ TRANSCRIPT TOZALASH VA YAXSHILASH
    const cleanedTranscript = cleanTranscript(transcript)
    
    console.log('🧹 Cleaned transcript:', {
      original: transcript.length,
      cleaned: cleanedTranscript.length,
      preview: cleanedTranscript.substring(0, 100)
    })

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      )
    }

    // ✅ YAXSHILANGAN PROMPT - incomplete transcript'ni hisobga oladi
    const prompt = `You are an experienced IELTS speaking examiner. Analyze the following speaking response and provide detailed scoring based on IELTS Speaking Band Descriptors (1-9 scale).

⚠️ IMPORTANT: This transcript may be incomplete or have gaps due to technical issues. Please be lenient in your assessment and focus on what was successfully transcribed.

Question: "${question}"

Candidate's Response: "${cleanedTranscript}"

Recording Duration: ${recordingTime} seconds
Transcript Length: ${cleanedTranscript.split(' ').length} words

Please analyze and provide scores (1-9 band) for:

1. **Fluency and Coherence**: Flow of speech, hesitations, self-correction, logical sequencing
   - Note: Some pauses may be due to transcription gaps, not actual speech hesitation
   
2. **Lexical Resource**: Vocabulary range, precision, appropriateness, and flexibility
   - Evaluate based on words that were successfully captured
   
3. **Grammatical Range and Accuracy**: Variety of structures, accuracy, complexity
   - Consider that some grammatical errors might be transcription errors

Important Guidelines:
- If the transcript seems very short or incomplete, mention this in your feedback
- Focus on the quality of content that IS present
- Be constructive and encouraging
- If gaps are obvious, suggest the student try recording again

Respond in JSON format:
{
  "transcriptQuality": "<good/fair/poor - assess if transcript seems complete>",
  "scores": {
    "fluency": <number 1-9>,
    "vocabulary": <number 1-9>,
    "grammar": <number 1-9>
  },
  "feedback": {
    "fluency": "<specific feedback>",
    "vocabulary": "<specific feedback>",
    "grammar": "<specific feedback>",
    "overall": "<overall assessment, mention if transcript seems incomplete>"
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<improvement 1>", "<improvement 2>", ...],
  "grammarErrors": [
    {
      "error": "<the error text>",
      "correction": "<suggested correction>",
      "explanation": "<why it's wrong>"
    }
  ],
  "technicalNote": "<mention if transcript appears incomplete or has gaps>"
}`

    console.log('🤖 Sending request to Groq...')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert IELTS speaking examiner. Provide accurate, fair, and constructive feedback following official IELTS band descriptors. Be understanding of transcription limitations and technical issues. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Groq API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get scores from Groq AI' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from Groq AI' },
        { status: 500 }
      )
    }

    const result = JSON.parse(content)
    
    console.log('✅ Groq response received:', {
      transcriptQuality: result.transcriptQuality,
      scores: result.scores
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Error in groq-score API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Transcript'ni tozalash va yaxshilash
 */
function cleanTranscript(transcript: string): string {
  let cleaned = transcript
  
  // 1. Ortiqcha bo'sh joylarni olib tashlash
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  // 2. Boshida va oxirida bo'sh joylar
  cleaned = cleaned.trim()
  
  // 3. Bir xil so'zlar takrorlanganda (transcription error)
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1')
  
  // 4. Ortiqcha tinish belgilarini tozalash
  cleaned = cleaned.replace(/[.]{2,}/g, '.')
  cleaned = cleaned.replace(/[,]{2,}/g, ',')
  
  // 5. Gap boshlarini katta harf bilan boshlash
  cleaned = cleaned.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase())
  
  return cleaned
}