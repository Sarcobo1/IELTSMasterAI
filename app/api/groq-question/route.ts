// app/api/groq-question/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const part = url.searchParams.get('part')
    const count = parseInt(url.searchParams.get('count') || '10')

    if (!part) {
      return NextResponse.json({ error: 'Part is required' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    let promptType = ''
    if (part.startsWith('part-')) {
      const partNum = part.split('-')[1]
      if (partNum === '1') {
        promptType = 'IELTS Speaking Part 1 questions (introduction and interview, simple questions about yourself)'
      } else if (partNum === '2') {
        promptType = 'IELTS Speaking Part 2 cues (long turn, describe something with bullet points)'
      } else if (partNum === '3') {
        promptType = 'IELTS Speaking Part 3 questions (discussion, abstract ideas)'
      }
    } else if (part.startsWith('task-')) {
      const taskNum = part.split('-')[1]
      if (taskNum === '1') {
        promptType = 'IELTS Writing Task 1 prompts (describing charts, graphs, processes, maps)'
      } else if (taskNum === '2') {
        promptType = 'IELTS Writing Task 2 opinion essay prompts'
      } else if (taskNum === '3') {
        promptType = 'Advanced IELTS-style discussion essay prompts'
      }
    } else {
      return NextResponse.json({ error: 'Invalid part' }, { status: 400 })
    }

    const prompt = `Generate ${count} random common ${promptType}. Respond in JSON format: {"questions": ["question1", "question2", ...]}`

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
            content: 'You are a helpful assistant. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate questions from Groq AI' }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No response from Groq AI' }, { status: 500 })
    }

    const result = JSON.parse(content)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in groq-question API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}