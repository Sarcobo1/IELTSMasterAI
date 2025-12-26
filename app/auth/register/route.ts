import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User'; // 1-qadamdagi User modeli
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await connectDB();
    
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email va parol talab qilinadi." }, 
                { status: 400 }
            );
        }

        // 1. Foydalanuvchi mavjudligini tekshirish
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "Bu email allaqachon ro'yxatdan o'tgan." }, 
                { status: 409 }
            );
        }

        // 2. Parolni heshlash (Xavfsizlik uchun!) 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Yangi foydalanuvchini yaratish
        const newUser = await User.create({
            email,
            password: hashedPassword,
            // lastUploadDate maydoni User modelida 'default: null' qilib qo'yilgan.
        });

        // Xavfsizlik sababli parolni javobdan olib tashlaymiz
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return NextResponse.json(
            { message: "Muvaffaqiyatli ro'yxatdan o'tdingiz.", user: userResponse }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Ro'yxatdan o'tish xatosi:", error);
        return NextResponse.json(
            { message: "Serverda ichki xato yuz berdi." }, 
            { status: 500 }
        );
    }
}