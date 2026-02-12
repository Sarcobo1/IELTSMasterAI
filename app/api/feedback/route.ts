// app/api/feedback/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { eye, posture, gesture, volume } = await req.json();

    // Model nomini 'gemini-1.5-flash' o'rniga 'gemini-pro' qilib ko'ring
    // Yoki aniq 'gemini-1.5-flash-latest' deb yozing.
    // Hozircha eng stabili 'gemini-pro'.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
<<<<<<< HEAD
      Sen professional notiqlik bo'yicha murabbiysan. Foydalanuvchi nutq so'zladi va quyidagi natijalarni qayd etdi (0 dan 100 gacha ball):
      
      - Ko'z aloqasi: ${eye}/100
      - Gavda holati (Pozitsiya): ${posture}/100
      - Qo'l harakatlari (Jestlar): ${gesture}/100
      - Ovoz balandligi: ${volume}/100

      Iltimos, ushbu ma'lumotlarga asoslanib, foydalanuvchiga qisqa, do'stona va foydali maslahat ber. 
      Qaysi jihatni yaxshilash kerakligini aniq ayt va qanday qilib yaxshilash mumkinligini tushuntir.
      Javobni o'zbek tilida ber. Formatlash uchun Markdown dan foydalan.
=======
Sen professional notiqlik bo'yicha murabbiysan. Foydalanuvchi nutq so'zladi va quyidagi natijalarni qayd etdi (0 dan 100 gacha ball):

- Ko'z aloqasi: ${eye}/100
- Gavda holati (Pozitsiya): ${posture}/100
- Qo'l harakatlari (Jestlar): ${gesture}/100
- Ovoz balandligi: ${volume}/100

Faqat bitta juda qisqa, aniq va amaliy feedback ber:
- maksimal 4–5 jumla bo'lsin;
- eng ko'p 2 ta kuchli tomon va 2 ta asosiy kamchilikni ayt;
- har bir kamchilik uchun bitta aniq mashq yoki maslahat ber.

Javobni o'zbek tilida yoz va keraksiz kirish so'zlar, xulosa va uzun paragraf qilma. Juda ixcham bo'l.
>>>>>>> 711de7a (Home page optimizatsiya qilindi va Linux orqali yuklandi)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: error.message || "AI generatsiyasida xatolik yuz berdi" },
      { status: 500 }
    );
  }
}