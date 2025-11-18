// app/api/login/route.ts

import { NextResponse } from 'next/server';

/**
 * Bu POST funksiyasi foydalanuvchini tizimga kiritish (login) uchun ishlatiladi.
 * Hozircha bu faqat muvaffaqiyatli javob qaytaradi.
 */
export async function POST(request: Request) {
  // Hozircha faqat muvaffaqiyatli javob qaytaramiz (status 200)
  return NextResponse.json(
    { message: 'Login endpoynti ishlayapti, keyin logikani qoʻshing' },
    { status: 200 }
  );
}

// QAYD: Next.js Route Handler'larida 'GET', 'POST', 'PUT' kabi funksiyalar 'export' qilinishi shart.