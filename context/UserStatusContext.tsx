import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

interface UserStatus {
    isPremium: boolean;
    remainingUploads: number;
    totalLimit: number;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// ✅ YANGI: Context Endi Funksiya (Dispatch) ni ham O'z Ichiga Oladi
interface UserContextType extends UserStatus {
    // Funksiyani qo'shamiz
    updateRemainingUploads: (newRemaining: number) => void; 
}

const defaultStatus: UserContextType = {
    isPremium: false,
    remainingUploads: 0,
    totalLimit: 0,
    isAuthenticated: false,
    isLoading: true,
    updateRemainingUploads: () => {}, // Standart bo'sh funksiya
};

const UserStatusContext = createContext<UserContextType>(defaultStatus);

export const UserStatusProvider: React.FC = ({ children }) => {
    const [status, setStatus] = useState<UserStatus>(defaultStatus);

    // Yangilash funksiyasi (Callback orqali optimallashtirilgan)
    const updateRemainingUploads = useCallback((newRemaining: number) => {
        setStatus(prev => ({
            ...prev,
            remainingUploads: newRemaining,
        }));
    }, []);

    // ... (useEffect ichidagi fetchStatus mantig'i o'zgarishsiz qoladi) ...
    // ... (To'liq fetchStatus funksiyasini oldingi javobingizdan ko'chirib oling) ...
    
    // Yengillangan Context qiymati
    const contextValue = {
        ...status,
        updateRemainingUploads, // Funksiyani Context'ga qo'shish
    };


    return (
        // Endi contextValue Type'i UserContextType ga mos keladi
        <UserStatusContext.Provider value={contextValue}>
            {children}
        </UserStatusContext.Provider>
    );
};

export const useUserStatus = () => useContext(UserStatusContext);