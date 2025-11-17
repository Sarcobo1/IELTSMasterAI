import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    const file = path.join(dataDir, 'support-messages.json')

    let messages = []
    try {
      const existing = await fs.readFile(file, 'utf8')
      messages = JSON.parse(existing || '[]')
    } catch (e) {
      messages = []
    }

    messages.push({ name, email, message, createdAt: new Date().toISOString() })
    await fs.writeFile(file, JSON.stringify(messages, null, 2), 'utf8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('API /api/support error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
