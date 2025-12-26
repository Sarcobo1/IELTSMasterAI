// lib/actions/usage-actions.ts
"use server";

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

/**
 * Kunlik foydalanish limitini tekshiradi (MongoDB orqali)
 * @param userId - MongoDB User ID (AuthContext dan olingan)
 * @returns Object with canUse boolean and optional message
 */
export async function checkUsageLimit(userId: string) {
    try {
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return { canUse: false, message: "Foydalanuvchi topilmadi." };
        }

        const today = new Date().toISOString().split("T")[0];
        // lastUploadDate ni stringga aylantirib, faqat sanani olamiz (YYYY-MM-DD)
        const lastUsageDate = user.lastUploadDate?.toISOString().split("T")[0];

        // Agar lastUploadDate mavjud bo'lsa va bugungi kunga teng bo'lsa
        if (lastUsageDate === today) {
            return {
                canUse: false,
                message: "Bugungi limit tugadi. Ertaga yana urinib ko'ring.",
            };
        }

        return { canUse: true };
    } catch (error) {
        console.error("Limitni tekshirishda xato:", error);
        return {
            canUse: false,
            message: "Limitni tekshirishda server xatosi yuz berdi.",
        };
    }
}

/**
 * Foydalanuvchining oxirgi foydalanish sanasini bugungi sana bilan yangilaydi.
 * @param userId - MongoDB User ID
 * @returns Object with success status
 */
export async function updateLastUsage(userId: string) {
    try {
        await connectDB();
        const today = new Date();
        
        // lastUploadDate maydonini bugungi sana bilan yangilash
        await User.findByIdAndUpdate(userId, { lastUploadDate: today });

        return { success: true };
    } catch (error) {
        console.error("lastUploadDate ni yangilashda xato:", error);
        return { success: false, error: "lastUploadDate ni yangilashda xato." };
    }
}