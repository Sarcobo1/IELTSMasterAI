import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Servislarni import qilish (Sizning loyihangizga qarab yo'lni o'zgartiring)
import { getUserIdFromRequest } from '@/lib/services/authService';
import { checkUserPremiumStatus } from '@/lib/services/premiumService';
// JSON faylning joylashuvini aniqlash
const JSON_FILE_PATH = path.join(process.cwd(), 'reading_data', 'all_reading_data.json');
export async function GET(request: Request) {
    // 1. Autentifikatsiya (Tokenni tekshirish)
    const userId = getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ message: 'Tizimga kirish talab qilinadi.' }, { status: 401 });
    }
    // 2. Premium Statusni Tekshirish (Muddati o'tmaganligini tekshiradi)
    // checkUserPremiumStatus funksiyasi ishlashi uchun DB ga ulanishi kerak (bu servis ichida bo'lishi kerak).
    const { isPremium, exists, expiresAt } = await checkUserPremiumStatus(userId); // To'liq destrukturlash
    if (!exists) {
        return NextResponse.json({ message: 'Foydalanuvchi topilmadi.' }, { status: 404 });
    }
    if (!isPremium) {
        // ⛔️ PREMIUM CHEKLOV: Agar muddati o'tgan yoki premium bo'lmasa.
        return NextResponse.json({
            message: "Bu o'qish testlari faqat Premium a'zolar uchun mavjud."
        }, { status: 403 });
    }
    // 3. ✅ PREMIUM TEKSHIRUVDAN O'TDI: JSON ma'lumotlarini yuklash
    try {
        const fileContents = await fs.readFile(JSON_FILE_PATH, 'utf8');
        const readingTests = JSON.parse(fileContents);
        // 4. Ma'lumotni qaytarish
        return NextResponse.json({
            message: "Premium o'qish testlari muvaffaqiyatli yuklandi.",
            tests: readingTests
        }, { status: 200 });
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.error(`JSON fayli topilmadi: ${JSON_FILE_PATH}`);
            return NextResponse.json({ message: 'Server kontenti topilmadi.' }, { status: 500 });
        }
        console.error("Reading test yuklashda xato:", error);
        return NextResponse.json({ message: 'Kontentni yuklashda server xatosi.' }, { status: 500 });
    }
}