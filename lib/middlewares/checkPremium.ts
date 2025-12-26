import { NextApiRequest, NextApiResponse } from 'next';
// Eslatma: Bu yerda sizning mongodb.ts faylingizdagi ulanish funksiyasi ishlatiladi.
// Agar u Next.js da Mongoose ulanishini boshqarsa, uni chaqiring.
import  connectToMongo  from '../mongodb'; // mongodb.ts dan to'g'ri import qiling
import User from '../models/User';

// Middleware funksiyasi (Next.js API Route uchun)
export const checkPremium = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => 
    async (req: NextApiRequest, res: NextApiResponse) => {
        
        // ⚠️ Autentifikatsiya/Session/Token dan userId ni olish (Sizning tizimingizdagi usul)
        // Misol uchun, bu joyda JWT'dan foydalanuvchi IDsi olinadi.
        const userId = req.user?.id; 
        
        if (!userId) {
            // Tizimga kirmagan
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Tizimga kirish talab qilinadi.' });
        }

        try {
            // MongoDB ulanishini o'rnatish
            await connectToMongo(); 
            
            // Foydalanuvchining isPremium holatini tekshirish
            const user = await User.findById(userId).select('isPremium');

            if (!user) {
                 return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
            }

            if (user.isPremium) {
                // ✅ Premium bo'lsa: Asosiy funksiyaga o'tish
                return handler(req, res);
            } else {
                // ❌ Premium bo'lmasa: Kirishni taqiqlash
                return res.status(403).json({ 
                    error: 'PREMIUM_REQUIRED', 
                    message: "Bu funksiya faqat Premium a'zolar uchun." 
                });
            }

        } catch (error) {
            console.error('Premium tekshiruvida xato:', error);
            return res.status(500).json({ message: 'Serverda ichki xato.' });
        }
    };