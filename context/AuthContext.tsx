"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    isPremium: boolean;
    planId?: string;
    premiumExpiresAt?: string;
    role?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUserData: () => Promise<void>; // ✅ Yangi funksiya
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // ✅ Foydalanuvchi ma'lumotlarini yuklash
    const fetchUserData = async (token: string): Promise<User | null> => {
        try {
            console.log('🔄 User ma\'lumotlarini yuklamoqda...');
            
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('❌ User ma\'lumotlarini olishda xato:', {
                    status: res.status,
                    error: errorData
                });
                return null;
            }

            const data = await res.json();
            console.log('✅ User ma\'lumotlari yuklandi:', data);
            
            return {
                id: data.id || data._id,
                email: data.email,
                isPremium: data.isPremium || false,
                planId: data.planId || 'free',
                premiumExpiresAt: data.premiumExpiresAt,
                role: data.role
            };
        } catch (error) {
            console.error('fetchUserData xatosi:', error);
            return null;
        }
    };

    // ✅ Ma'lumotlarni yangilash funksiyasi (public)
    const refreshUserData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const userData = await fetchUserData(token);
        if (userData) {
            setUser(userData);
            console.log('🔄 User ma\'lumotlari yangilandi:', userData);
        }
    };

    // Dastlabki yuklash
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('authToken');
            
            if (token) {
                const userData = await fetchUserData(token);
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    // Token yaroqsiz - tozalash
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (token: string) => {
        // ✅ Token validatsiyasi
        if (!token || typeof token !== 'string') {
            console.error('❌ Noto\'g\'ri token formati:', typeof token);
            throw new Error('Noto\'g\'ri token formati');
        }
        
        // Token JWT formatida ekanligini tekshirish (3 qism: header.payload.signature)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('❌ JWT formati noto\'g\'ri. Qismlar soni:', tokenParts.length);
            throw new Error('JWT formati noto\'g\'ri');
        }
        
        console.log('✅ Token formati to\'g\'ri:', {
            length: token.length,
            parts: tokenParts.length,
            preview: token.substring(0, 20) + '...'
        });
        
        // Token'ni saqlash
        localStorage.setItem('authToken', token);
        
        // User ma'lumotlarini yuklash
        const userData = await fetchUserData(token);
        
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('✅ Login muvaffaqiyatli:', userData);
        } else {
            // Agar user ma'lumotlarini yuklab bo'lmasa, token'ni o'chirish
            localStorage.removeItem('authToken');
            throw new Error('User ma\'lumotlarini yuklab bo\'lmadi');
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
        console.log('👋 Logout muvaffaqiyatli');
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isLoading, 
            user, 
            login, 
            logout,
            refreshUserData 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};