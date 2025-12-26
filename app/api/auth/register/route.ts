// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        // 1. Ma'lumotlarni tekshirish
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email va parol talab qilinadi." },
                { status: 400 }
            );
        }

        // Email formatini tekshirish
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Noto'g'ri email formati." },
                { status: 400 }
            );
        }

        // Parol uzunligini tekshirish
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." },
                { status: 400 }
            );
        }

        // 2. Foydalanuvchi allaqachon mavjudligini tekshirish
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "Bu email allaqachon ro'yxatdan o'tgan." },
                { status: 409 } // Conflict
            );
        }

        // 3. Parolni hash qilish
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Yangi foydalanuvchini yaratish
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // 5. Muvaffaqiyatli javob
        return NextResponse.json(
            { 
                success: true,
                message: "Ro'yxatdan muvaffaqiyatli o'tdingiz. Iltimos, tizimga kiring.",
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Ro'yxatdan o'tishda xato:", error);
        return NextResponse.json(
            { error: "Serverda ichki xato yuz berdi." },
            { status: 500 }
        );
    }
}