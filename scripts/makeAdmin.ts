// 📁 scripts/makeAdmin.ts
// Ishga tushirish: npx ts-node scripts/makeAdmin.ts

import mongoose from 'mongoose';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function makeAdmin(email: string) {
    try {
        console.log('🔗 MongoDB ga ulanilmoqda...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Ulandi');

        console.log(`🔍 Foydalanuvchi qidirilmoqda: ${email}`);
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error('❌ Foydalanuvchi topilmadi!');
            process.exit(1);
        }

        console.log('👤 Topildi:', {
            email: user.email,
            currentRole: user.role
        });

        // Admin rolini berish
        user.role = 'admin';
        await user.save();

        console.log('✅ MUVAFFAQIYATLI! Yangi role:', user.role);
        console.log('🎉 Endi bu foydalanuvchi admin huquqlariga ega');

        process.exit(0);
    } catch (error) {
        console.error('❌ Xato:', error);
        process.exit(1);
    }
}

// Email'ni command line argument sifatida olish
const email = process.argv[2];

if (!email) {
    console.error('❌ Email kiritilmagan!');
    console.log('Foydalanish: npx ts-node scripts/makeAdmin.ts akkn72038@gmail.com');
    process.exit(1);
}

makeAdmin(email);