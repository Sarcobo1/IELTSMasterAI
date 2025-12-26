// lib/mongodb.ts
import mongoose from 'mongoose';

// MongoDB URL manzilini .env faylidan o'qish
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ TUZATISH: Type definition
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// ✅ TUZATISH: Global namespace uchun type declaration
declare global {
    var mongoose: MongooseCache;
}

// Ulanish holatini saqlash uchun global o'zgaruvchi
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

// MongoDB ga ulanish funksiyasi
async function connectDB() {
    if (cached.conn) {
        // Ulanish hali ham faol ekanligini tekshirish
        if (mongoose.connection.readyState === 1) {
            return cached.conn;
        }
        // Agar ulanish uzilgan bo'lsa, cache ni tozalash
        cached.conn = null;
    }

    if (!cached.promise) {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI .env faylida aniqlanmagan.');
        }

        // MongoDB connection options - SSL/TLS muammolarini hal qilish
        const opts: mongoose.ConnectOptions = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // SSL/TLS konfiguratsiyasi
            ...(MONGODB_URI.includes('mongodb+srv://') && {
                tls: true,
                tlsAllowInvalidCertificates: false,
                tlsAllowInvalidHostnames: false,
            }),
        };

        // ✅ TUZATISH: mongoose.connect() ni to'g'ri type bilan
        cached.promise = mongoose.connect(MONGODB_URI, opts) as Promise<typeof mongoose>;
    }

    try {
        cached.conn = await cached.promise;
        console.log('🔗 MongoDB ga muvaffaqiyatli ulandi.');
        return cached.conn;
    } catch (e: any) {
        cached.promise = null;
        cached.conn = null;
        
        // SSL xatosi bo'lsa, aniq xabar
        if (e?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' || e?.message?.includes('SSL')) {
            console.error('❌ MongoDB SSL ulanish xatosi:', e.message);
            throw new Error(
                'MongoDB ga SSL orqali ulanib bo\'lmadi. ' +
                'Iltimos, MONGODB_URI ni tekshiring yoki MongoDB Atlas\'da Network Access sozlamalarini ko\'rib chiqing.'
            );
        }
        
        throw e;
    }
}

export default connectDB;