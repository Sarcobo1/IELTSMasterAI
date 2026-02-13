// 📁 app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToMongo from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        console.log('🔐 Login urinishi:', email);
        
        // 1. Validatsiya
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email va parol talab qilinadi.' },
                { status: 400 }
            );
        }
        
        // 2. Database'ga ulanish
        await connectToMongo();
        
        // 3. Foydalanuvchini topish
        const user = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (!user) {
            console.log('❌ Foydalanuvchi topilmadi');
            return NextResponse.json(
                { message: 'Email yoki parol noto\'g\'ri.' },
                { status: 401 }
            );
        }
        
        // 4. Parolni tekshirish
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Parol noto\'g\'ri');
            return NextResponse.json(
                { message: 'Email yoki parol noto\'g\'ri.' },
                { status: 401 }
            );
        }
        
        // 5. ✅ JWT Token yaratish (MUHIM!)
        const token = createToken(user._id.toString());
        
        console.log('✅ Login muvaffaqiyatli:', {
            userId: user._id,
            email: user.email,
            tokenCreated: !!token,
            tokenLength: token.length,
            tokenPreview: token.substring(0, 20) + '...'
        });

        // 6. 🔐 auth_token cookie o'rnatish (backend uchun)
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 kun
        });

        // 7. Response qaytarish (frontend uchun token ham qoladi)
        const response = NextResponse.json({
            message: 'Login muvaffaqiyatli',
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                isPremium: user.isPremium,
                planId: user.planId,
                role: user.role
            }
        }, { status: 200 });

        return response;
        
    } catch (error) {
        console.error('❌ Login xatosi:', error);
        return NextResponse.json(
            { message: 'Serverda xato yuz berdi.' },
            { status: 500 }
        );
    }
}