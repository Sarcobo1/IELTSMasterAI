// lib/auth/server-utils.ts (MUQOBIL USUL)

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!; 

export async function getUserIdFromToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies(); 
        const token = (await cookieStore).get('auth_token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, iat: number, exp: number };
        return decoded.userId;
    } catch (error) {
        console.error("JWT tasdiqlashda xato:", error);
        return null;
    }
}