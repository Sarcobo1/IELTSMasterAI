import { NextResponse } from 'next/server';
// Servislar orqali xavfsizlikni ta'minlash
import { getUserIdFromRequest } from '@/lib/services/authService'; 
import { checkUserPremiumStatus } from '@/lib/services/premiumService'; 
// Kontentni MongoDB'dan olish
import  connectToMongo  from '@/lib/mongodb';
import PremiumReport from '@/lib/models/PremiumReport'; 

export async function GET(request: Request) {
    
    // 1. Autentifikatsiya (Tokenni tekshirish)
    const userId = getUserIdFromRequest(request);

    if (!userId) {
        return NextResponse.json({ message: 'Tizimga kirish talab qilinadi.' }, { status: 401 });
    }

    // 2. Premium Statusni Tekshirish
    const { isPremium, exists } = await checkUserPremiumStatus(userId);

    if (!exists) {
        return NextResponse.json({ message: 'Foydalanuvchi topilmadi.' }, { status: 404 });
    }
    
    if (!isPremium) {
        // ⛔️ PREMIUM CHEKLOV
        return NextResponse.json({ 
            message: "Bu kontent faqat Premium a'zolar uchun. Obuna bo'ling." 
        }, { status: 403 }); 
    }

    // 3. ✅ DB dan ma'lumotni olish (faqat premium bo'lsa)
    try {
        await connectToMongo();
        
        // Eng so'nggi Premium hisobotni olish
        const latestReport = await PremiumReport.findOne({ accessLevel: 'PREMIUM' })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!latestReport) {
            return NextResponse.json({ message: 'Maxfiy hisobot topilmadi.' }, { status: 404 });
        }

        // 4. Ma'lumotni qaytarish
        return NextResponse.json({
            title: latestReport.title,
            content: latestReport.contentBody,
            accessLevel: latestReport.accessLevel
        }, { status: 200 });

    } catch (error) {
        console.error('Premium kontentni olishda xato:', error);
        return NextResponse.json({ message: 'Serverda ichki xato yuz berdi.' }, { status: 500 });
    }
}