// app/api/register/route.ts

import { NextResponse } from 'next/server';

/**
 * Bu POST funksiyasi yangi foydalanuvchini ro'yxatdan o'tkazish (register) uchun ishlatiladi.
 */
export async function POST(request: Request) {
  // Bu yerda siz kelajakda Prisma yordamida yangi foydalanuvchini bazaga qo'shishingiz mumkin.
  
  // Hozircha faqat muvaffaqiyatli javob qaytaramiz (status 200)
  return NextResponse.json(
    { message: 'Register endpoynti ishlayapti, logikani qoʻshing' },
    { status: 200 }
  );
}

// Eslatma: 'export async function POST' bu faylning modul bo'lishi uchun shart.