// app/api/groq-writing-score/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { essay, question } = await request.json()

    if (!essay || essay.trim().length === 0) {
      return NextResponse.json(
        { error: 'Essay is required' },
        { status: 400 }
      )
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      )
    }

    const prompt = `You are an experienced IELTS writing examiner. Analyze the following writing response and provide detailed scoring based on IELTS Writing Band Descriptors (1-9 scale).

Prompt: "${question}"

Candidate's Response: "${essay}"

Please analyze and provide scores (1-9 band) for:

1. **Task Response/Achievement**: How well the response addresses the task, presents a clear position, and supports ideas.
2. **Coherence and Cohesion**: Logical organization, use of linking words, paragraphing.
3. **Lexical Resource**: Vocabulary range, precision, appropriateness, and accuracy.
4. **Grammatical Range and Accuracy**: Variety of structures, accuracy, complexity.

Respond in JSON format:
{
  "scores": {
    "task_response": <number 1-9>,
    "coherence": <number 1-9>,
    "vocabulary": <number 1-9>,
    "grammar": <number 1-9>
  },
  "feedback": {
    "task_response": "<specific feedback>",
    "coherence": "<specific feedback>",
    "vocabulary": "<specific feedback>",
    "grammar": "<specific feedback>",
    "overall": "<overall assessment>"
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<improvement 1>", "<improvement 2>", ...],
  "grammarErrors": [
    {
      "error": "<the error text>",
      "correction": "<suggested correction>",
      "explanation": "<why it's wrong>"
    }
  ]
}`

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
            content: 'You are an expert IELTS writing examiner. Provide accurate, fair, and constructive feedback following official IELTS band descriptors. Always respond with valid JSON.'
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
      console.error('Groq API error:', errorText)
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

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in groq-writing-score API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}