import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { hashPassword } from '../../../lib/utils'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()
    const hashedPassword = hashPassword(password)

    // Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (error || !user || user.password !== hashedPassword) {
      console.log('Login failed for:', normalizedEmail)
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Generate token (realda JWT ishlatish mumkin)
    const token = `auth-token-${Date.now()}-${normalizedEmail.split('@')[0]}`

    console.log(`Successful login: ${normalizedEmail}`)
    return NextResponse.json({ token, message: 'Login successful' }, { status: 200 })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ message: 'Server error occurred' }, { status: 500 })
  }
}