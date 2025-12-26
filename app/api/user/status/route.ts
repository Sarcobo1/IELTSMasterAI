import { NextResponse } from 'next/server';
import  connectToMongo  from '@/lib/mongodb'; // @/lib/ mongodb.ts deb faraz qilamiz
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Oddiy va Premium foydalanuvchilar uchun kunlik limitlar
const DAILY_LIMITS = {
    NORMAL: 5,  
    PREMIUM: 50 
};

// Tokenni dekodlash uchun maxfiy kalit (Secret Key)
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECURE_DEFAULT_SECRET'; 

export async function GET(request: Request) {
    // 1. Autentifikatsiya/Tokenni tekshirish
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Tizimga kirish talab qilinadi.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string | null = null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
        userId = decoded.userId;
    } catch (error) {
        // Token noto'g'ri yoki muddati o'tgan
        return NextResponse.json({ message: 'Noto\'g\'ri avtorizatsiya tokeni.' }, { status: 401 });
    }

    if (!userId) {
        return NextResponse.json({ message: 'Foydalanuvchi ma\'lumotlari topilmadi.' }, { status: 401 });
    }

    // 2. MongoDB'ga ulanish va statusni olish
    try {
        await connectToMongo();

        // Faqat kerakli maydonlarni so'rash
        const user = await User.findById(userId).select('isPremium uploadCount lastUploadDate email');
        
        if (!user) {
            return NextResponse.json({ message: 'Foydalanuvchi topilmadi.' }, { status: 404 });
        }

        // 3. Kunlik limitni hisoblash
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const isNewDay = user.lastUploadDate === null || user.lastUploadDate.getTime() < today.getTime();
        
        let currentUploadCount = user.uploadCount;
        let limitType = DAILY_LIMITS.NORMAL;

        if (isNewDay) {
            currentUploadCount = 0; 
        }
        
        if (user.isPremium) {
            limitType = DAILY_LIMITS.PREMIUM;
        }

        // 4. Muvaffaqiyatli javobni qaytarish
        return NextResponse.json({
            isPremium: user.isPremium,
            remainingUploads: limitType - currentUploadCount,
            totalLimit: limitType,
            email: user.email 
        }, { status: 200 });

    } catch (error) {
        console.error('Foydalanuvchi statusini olishda xato:', error);
        return NextResponse.json({ message: 'Serverda ichki xato.' }, { status: 500 });
    }
}