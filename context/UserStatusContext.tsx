// context/UserStatusContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext'; // ✅ AuthContext dan isAuthenticated olish

// User status type
interface UserStatus {
    isPremium: boolean;
    usageCount: number;
    dailyLimit: number;
    lastUsageDate?: string;
    remainingUploads: number;    // ✅ Qo'shildi
    totalLimit: number;           // ✅ Qo'shildi
}

// Context type
interface UserContextType extends UserStatus {
    isAuthenticated: boolean;     // ✅ Qo'shildi
    isLoading: boolean;           // ✅ Qo'shildi
    updateStatus: (newStatus: Partial<UserStatus>) => void;
    updateRemainingUploads: (remaining: number) => void; // ✅ Qo'shildi
}

// Default qiymatlar
const defaultStatus: UserStatus = {
    isPremium: false,
    usageCount: 0,
    dailyLimit: 3,
    remainingUploads: 5,
    totalLimit: 5,
};

const UserStatusContext = createContext<UserContextType | undefined>(undefined);

// ✅ To'g'ri - children prop type bilan
interface UserStatusProviderProps {
    children: ReactNode;
}

export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth(); // ✅ AuthContext dan
    const [status, setStatus] = useState<UserStatus>(defaultStatus);

    // ✅ User ma'lumotlari o'zgarganda status yangilanadi
    useEffect(() => {
        if (user) {
            setStatus((prev) => ({
                ...prev,
                isPremium: user.isPremium || false,
                totalLimit: user.isPremium ? 50 : 5,
                // remainingUploads backenddan kelishi kerak
            }));
        }
    }, [user]);

    // Yangilash funksiyasi
    const updateStatus = (newStatus: Partial<UserStatus>) => {
        setStatus((prevStatus) => ({
            ...prevStatus,
            ...newStatus,
        }));
    };

    // ✅ Qolgan yuklashlarni yangilash funksiyasi
    const updateRemainingUploads = (remaining: number) => {
        setStatus((prevStatus) => ({
            ...prevStatus,
            remainingUploads: remaining,
        }));
    };

    return (
        <UserStatusContext.Provider
            value={{
                ...status,
                isAuthenticated,
                isLoading,
                updateStatus,
                updateRemainingUploads,
            }}
        >
            {children}
        </UserStatusContext.Provider>
    );
};

// Custom hook
export const useUserStatus = () => {
    const context = useContext(UserStatusContext);
    if (!context) {
        throw new Error('useUserStatus must be used within UserStatusProvider');
    }
    return context;
};