// 📁 lib/services/authService.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * ✅ Request'dan userId ni olish (JWT token orqali)
 */
export function getUserIdFromRequest(request: NextRequest | Request): string | null {
    try {
        // 1. Authorization header'dan token olish
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader) {
            console.log('❌ Authorization header topilmadi');
            return null;
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Bearer token formati noto\'g\'ri');
            return null;
        }
        
        const token = authHeader.substring(7); // "Bearer " ni olib tashlash
        
        if (!token) {
            console.log('❌ Token bo\'sh');
            return null;
        }
        
        // 2. Token'ni verify qilish
        const decoded = jwt.verify(token, JWT_SECRET) as { 
            userId?: string;
            id?: string;
            _id?: string;
        };
        
        // Token ichida userId, id yoki _id bo'lishi mumkin
        const userId = decoded.userId || decoded.id || decoded._id;
        
        if (!userId) {
            console.log('❌ Token ichida userId topilmadi');
            return null;
        }
        
        console.log('✅ UserId topildi:', userId);
        return userId;
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('❌ Token yaroqsiz:', error.message);
        } else if (error instanceof jwt.TokenExpiredError) {
            console.error('❌ Token muddati o\'tgan');
        } else {
            console.error('❌ Token verify xatosi:', error);
        }
        return null;
    }
}

/**
 * ✅ JWT Token yaratish
 */
export function createToken(userId: string): string {
    return jwt.sign(
        { userId }, // yoki { id: userId }
        JWT_SECRET,
        { expiresIn: '30d' } // 30 kun amal qiladi
    );
}

/**
 * ✅ Token'ni tekshirish (boolean qaytaradi)
 */
export function verifyToken(token: string): boolean {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}