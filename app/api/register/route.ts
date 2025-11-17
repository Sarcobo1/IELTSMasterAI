import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { hashPassword } from '../../../lib/utils'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Register request:', { email, password: '***' }) // DEBUG

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const hashedPassword = hashPassword(password)
    const normalizedEmail = email.toLowerCase()
    console.log('Register hashed password length:', hashedPassword.length) // DEBUG

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', normalizedEmail)
      .single()

    console.log('Existing user check:', { exists: !!existingUser, error: checkError?.message }) // DEBUG

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: normalizedEmail, password: hashedPassword }])

    console.log('Insert result:', { data, error: error?.message }) // DEBUG

    if (error) {
      console.error('Register insert error:', error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.log(`New user registered: ${normalizedEmail}`)
    return NextResponse.json({ message: 'Registration successful' }, { status: 200 })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ message: 'Server error occurred' }, { status: 500 })
  }
}