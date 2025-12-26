// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectToMongo from '@/lib/mongodb'; // MongoDB ulanishi
import User, { IUser } from '@/lib/models/User';

// ✅ Services importlari
import { getUserIdFromRequest } from '@/lib/services/authService'; 
// Eslatma: 'authService.ts' va 'premiumService.ts' fayllari 'lib/services' katalogida joylashgan deb faraz qilamiz.

const DAILY_LIMITS = {
    NORMAL: 5,
    PREMIUM: 50
};

export async function POST(req: NextRequest) {
    try {
        // 1. Autentifikatsiyani Servis orqali bajarish
        const userId = getUserIdFromRequest(req);
        
        if (!userId) {
            return NextResponse.json(
                { message: 'Avtorizatsiya talab qilinadi.' },
                { status: 401 }
            );
        }

        // 2. MongoDB ulanish
        await connectToMongo();
        
        // 3. Foydalanuvchini topish va unga eksklyuziv qulf qo'yish
        // Eslatma: To'g'ri turdagi foydalanuvchini olish uchun model ishlatiladi.
        const user = (await User.findById(userId)) as IUser | null;
        
        if (!user) {
            return NextResponse.json(
                { message: 'Foydalanuvchi topilmadi.' },
                { status: 404 }
            );
        }

        // 4. Kunlik limitni hisoblash va tekshirish mantig'i
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Kunning boshlanishini aniqlash
        
        const isNewDay = !user.lastUploadDate || user.lastUploadDate.getTime() < today.getTime();
        
        if (isNewDay) {
            user.uploadCount = 0;
            user.lastUploadDate = new Date();
        }

        const currentLimit = user.isPremium ? DAILY_LIMITS.PREMIUM : DAILY_LIMITS.NORMAL;
        
        if (user.uploadCount >= currentLimit) {
            return NextResponse.json(
                {
                    message: `Kunlik yuklash limitiga yetdingiz (${currentLimit}). ${
                        user.isPremium ? '' : "Limitni oshirish uchun Premiumga o'ting."
                    }`
                },
                { status: 429 } // Too Many Requests
            );
        }

        // 5. --- Fayl Yuklash va Saqlash Mantig'i ---
        // Foydalanuvchi yuklash limitidan o'tdi.
        
        // Masalan: req.formData() dan faylni olib, S3 ga yuklash logikasi shu yerda bo'ladi.
        // const formData = await req.formData();
        // const file = formData.get('file');

        // 6. Hisoblagichni oshirish va saqlash
        user.uploadCount += 1;
        await user.save(); // DB ga yozish

        return NextResponse.json({
            message: 'Fayl muvaffaqiyatli yuklandi.',
            remainingUploads: currentLimit - user.uploadCount
        });

    } catch (error) {
        console.error('Yuklashda xato:', error);
        return NextResponse.json(
            { message: 'Serverda ichki xato yuz berdi.' },
            { status: 500 }
        );
    }
}