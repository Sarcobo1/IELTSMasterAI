// 📁 app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToMongo from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ✅ Token'dan userId ni olish
function getUserIdFromToken(request: NextRequest): string | null {
    try {
        // 1. Authorization header'dan token olish
        const authHeader = request.headers.get('Authorization');
        
        console.log('🔍 Authorization header:', authHeader ? 'Mavjud' : 'Yo\'q');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Authorization header yo\'q yoki noto\'g\'ri format');
            return null;
        }
        
        const token = authHeader.substring(7).trim(); // "Bearer " ni olib tashlash va trim
        
        console.log('🎫 Token:', {
            length: token.length,
            parts: token.split('.').length,
            preview: token.substring(0, 30) + '...'
        });
        
        // Token formatini tekshirish
        if (token.split('.').length !== 3) {
            console.log('❌ Token JWT formati emas. Qismlar:', token.split('.').length);
            return null;
        }
        
        // 2. Token'ni verify qilish
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        console.log('✅ Token decoded:', decoded);
        return decoded.userId || null;
        
    } catch (error) {
        console.error('❌ Token verify xatosi:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 /api/auth/me chaqirildi');
        
        // 1. Token'dan userId olish
        const userId = getUserIdFromToken(request);
        
        if (!userId) {
            console.log('❌ UserId topilmadi');
            return NextResponse.json({ 
                message: 'Tizimga kirish talab qilinadi.',
                error: 'UNAUTHORIZED'
            }, { status: 401 });
        }
        
        console.log('👤 UserId topildi:', userId);
        
        // 2. Database'dan foydalanuvchi ma'lumotlarini olish
        await connectToMongo();
        
        const user = await User.findById(userId).select(
            'email isPremium premiumExpiresAt planId role createdAt'
        );
        
        if (!user) {
            console.log('❌ Foydalanuvchi DB da topilmadi');
            return NextResponse.json({ 
                message: 'Foydalanuvchi topilmadi.',
                error: 'USER_NOT_FOUND'
            }, { status: 404 });
        }
        
        console.log('✅ User topildi:', {
            email: user.email,
            isPremium: user.isPremium,
            planId: user.planId
        });
        
        // 3. Premium muddatini tekshirish
        const now = new Date();
        const isPremiumActive = user.isPremium && 
                                user.premiumExpiresAt && 
                                new Date(user.premiumExpiresAt) > now;
        
        // 4. Ma'lumotlarni qaytarish
        const response = {
            id: user._id.toString(),
            email: user.email,
            isPremium: isPremiumActive,
            planId: isPremiumActive ? (user.planId || 'premium_pro_monthly') : 'free',
            premiumExpiresAt: isPremiumActive ? user.premiumExpiresAt?.toISOString() : null,
            role: user.role,
            createdAt: user.createdAt?.toISOString()
        };
        
        console.log('📤 Response:', response);
        
        return NextResponse.json(response, { status: 200 });
        
    } catch (error) {
        console.error('❌ /api/auth/me xatosi:', error);
        return NextResponse.json({ 
            message: 'Serverda ichki xato yuz berdi.',
            error: error instanceof Error ? error.message : 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}