import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = body?.text
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

    const system = `You are an IELTS examiner. Grade the following essay according to IELTS Writing Task 2 band descriptors (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy). Provide a band score for each category and an overall band. Give a short explanation (2-3 sentences) for each category and a short summary suggestion.`

    const payload = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
      max_tokens: 700,
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status })
    }

    const content = data.choices?.[0]?.message?.content || JSON.stringify(data)
    return NextResponse.json({ content })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
