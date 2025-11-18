// app/api/login/route.ts   (App Router uchun)
// yoki pages/api/login.ts   (Pages Router uchun – farqi yo‘q, kod bir xil ishlaydi)

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'   // yangi versiya bilan
import { hashPassword } from '@/lib/server-utils'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const hashedPassword = hashPassword(password)

    // === YANGI QISM – bu joyga yozasiz ===
    const client = supabase.client

    // Agar env variable’lar yo‘q bo‘lsa build o‘tadi, lekin runtime’da xato beradi
    if (!client) {
      console.error('Supabase client not initialized – missing env variables')
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }
    // ======================================

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    // Bu yerda data ni user deb o'zgartiramiz va tip beramiz
    const user = data as { password: string } | null

    if (error || !user || (user.password as string) !== hashedPassword) {
      console.log('Login failed for:', normalizedEmail)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Oddiy token (keyinchalik JWT bilan almashtirishingiz mumkin)
    const token = `auth-token-${Date.now()}-${Math.random().toString(36).substring(2)}`

    console.log(`Successful login: ${normalizedEmail}`)
    return NextResponse.json(
      { token, message: 'Login successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'Server error occurred' },
      { status: 500 }
    )
  }
}