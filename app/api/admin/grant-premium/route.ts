import { NextRequest, NextResponse } from 'next/server';
import connectToMongo from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/services/authService';

/**
 * ✅ ADMIN TEKSHIRISH FUNKSIYASI
 */
async function isAdminTokenValid(request: NextRequest): Promise<boolean> {
    try {
        const userId = getUserIdFromRequest(request);
        
        // Debug: Console'ga chiqaramiz
        console.log('🔍 Admin tekshiruv - userId:', userId);
        
        if (!userId) {
            console.log('❌ UserId topilmadi - token noto\'g\'ri yoki yo\'q');
            return false;
        }
       
        await connectToMongo();
       
        const user = await User.findById(userId).select('role email');
        
        // Debug: Topilgan foydalanuvchi ma'lumotlari
        console.log('👤 Topilgan user:', { 
            id: user?._id, 
            email: user?.email, 
            role: user?.role 
        });
       
        const isAdmin = user?.role === 'admin';
        console.log('🔐 Admin statusі:', isAdmin);
        
        return isAdmin;
    } catch (error) {
        console.error('❌ Admin tekshiruvida xato:', error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. 🛑 Admin Autentifikatsiya
        const isAdmin = await isAdminTokenValid(request);
        
        if (!isAdmin) {
            return NextResponse.json({ 
                message: 'Kirish taqiqlangan. Faqat adminlar uchun ruxsat.',
                debug: 'Token noto\'g\'ri yoki foydalanuvchi admin emas' 
            }, { status: 403 });
        }
       
        // 2. Request body'dan ma'lumotlarni olish
        const body = await request.json();
        const { targetEmail } = body;
        
        console.log('📧 Target email:', targetEmail);
        
        if (!targetEmail) {
            return NextResponse.json({ 
                message: 'targetEmail maydoni majburiy.' 
            }, { status: 400 });
        }
       
        await connectToMongo();
        
        // 3. Foydalanuvchini topish
        const targetUser = await User.findOne({ 
            email: targetEmail.toLowerCase().trim() 
        });
        
        if (!targetUser) {
            console.log('❌ Foydalanuvchi topilmadi:', targetEmail);
            return NextResponse.json({ 
                message: 'Foydalanuvchi topilmadi.' 
            }, { status: 404 });
        }
        
        console.log('✅ Foydalanuvchi topildi:', targetUser.email);
        
        // 4. Premium statusini berish
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        targetUser.isPremium = true;
        targetUser.premiumExpiresAt = oneYearFromNow;
        targetUser.planId = 'premium_pro_annual'; // Reja ID sini ham qo'shamiz
        
        await targetUser.save();
        
        console.log('🎉 Premium muvaffaqiyatli berildi:', {
            email: targetUser.email,
            isPremium: targetUser.isPremium,
            expiresAt: targetUser.premiumExpiresAt
        });
        
        // 5. Muvaffaqiyatli javob
        return NextResponse.json({
            success: true,
            message: `${targetUser.email} ga muvaffaqiyatli Premium berildi.`,
            user: {
                email: targetUser.email,
                isPremium: targetUser.isPremium,
                planId: targetUser.planId,
                expiresAt: targetUser.premiumExpiresAt,
            }
        }, { status: 200 });
        
    } catch (error) {
        console.error('❌ Premium berishda xato:', error);
        return NextResponse.json(
            { 
                message: 'Serverda ichki xato yuz berdi.',
                error: error instanceof Error ? error.message : 'Noma\'lum xato'
            },
            { status: 500 }
        );
    }
}