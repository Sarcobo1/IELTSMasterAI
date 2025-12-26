import { NextResponse } from 'next/server'; // ✅ TO'G'RI
import { cookies } from 'next/headers'; // Next.js App Router cookie boshqaruvi
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Muhim: JWT secretni .env faylida saqlang!
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY'; 

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

        // 1. Foydalanuvchini topish
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "Noto'g'ri email yoki parol." }, 
                { status: 401 }
            );
        }

        // 2. Parolni tekshirish
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { message: "Noto'g'ri email yoki parol." }, 
                { status: 401 }
            );
        }

        // 3. JWT (JSON Web Token) yaratish
        const token = jwt.sign(
            { userId: user._id }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // Tokenning yashash muddati 1 kun
        );

        // ✅ TUZATISH: cookies() ni await qilish
        const cookieStore = await cookies();
        
        // 4. JWT ni xavfsiz HTTP-only cookie qilib o'rnatish
        cookieStore.set('auth_token', token, {
            httpOnly: true, // Frontend JavaScript orqali o'qish mumkin emas (Xavfsizlik!)
            secure: process.env.NODE_ENV === 'production', // Faqat HTTPS da yuborish
            maxAge: 60 * 60 * 24, // 1 kun
            path: '/',
            sameSite: 'strict',
        });

        // Xavfsizlik sababli parolni javobdan olib tashlaymiz
        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json(
            { message: "Tizimga muvaffaqiyatli kirdingiz.", user: userResponse }, 
            { status: 200 }
        );

    } catch (error) {
        console.error("Tizimga kirish xatosi:", error);
        return NextResponse.json(
            { message: "Serverda ichki xato yuz berdi." }, 
            { status: 500 }
        );
    }
}