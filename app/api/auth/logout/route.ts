// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    // ✅ TUZATISH: cookies() ni await qilish kerak
    const cookieStore = await cookies();
    
    // 1. Cookie ni bekor qilish
    cookieStore.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // Zudlik bilan bekor qilish
        path: '/',
    });

    return NextResponse.json({ success: true, message: "Tizimdan muvaffaqiyatli chiqildi" }, { status: 200 });
}