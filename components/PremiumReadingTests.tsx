// components/PremiumReadingTests.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useUserStatus } from '../context/UserStatusContext';
import { useAuth } from '@/context/AuthContext'; // ✅ Qo'shildi

interface ReadingTest {
    id: number;
    title: string;
    questions: any[]; // Test savollari
}

const PremiumReadingTests: React.FC = () => {
    // ✅ isAuthenticated va isLoading useAuth dan olinadi
    const { isPremium } = useUserStatus();
    const { isAuthenticated, isLoading } = useAuth();
    
    const [tests, setTests] = useState<ReadingTest[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        
        const fetchTests = async () => {
            const token = localStorage.getItem('authToken');
            
            try {
                const res = await fetch('/api/premium/reading-tests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 403) {
                    // ❌ Premium emas (Backendda cheklov ishlagan)
                    setError("Bu kontentga faqat Premium a'zolar kirishi mumkin.");
                    setTests(null);
                } else if (!res.ok) {
                    // Boshqa xatolar (401, 500)
                    const errorData = await res.json();
                    setError(errorData.message || "Testlarni yuklashda xato yuz berdi.");
                    setTests(null);
                } else {
                    // ✅ Muvaffaqiyatli yuklandi
                    const data = await res.json();
                    setTests(data.tests);
                    setError(null);
                }
            } catch (err) {
                setError('Tarmoqqa ulanish xatosi.');
            }
        };
        
        // Optimallashtirish: Agar frontendda isPremium false bo'lsa, fetch qilmay, to'g'ridan-to'g'ri xato ko'rsatamiz
        if (isPremium) {
            fetchTests();
        } else {
            setError("Bu kontentga faqat Premium a'zolar kirishi mumkin.");
        }

    }, [isPremium, isAuthenticated, isLoading]);

    if (isLoading) {
        return <div>Testlar yuklanmoqda...</div>;
    }

    // Foydalanuvchi tizimga kirmagan
    if (!isAuthenticated) {
        return (
            <div className="alert-access">
                O'qish testlaridan foydalanish uchun tizimga kiring.
            </div>
        );
    }

    // ✅ Testlar muvaffaqiyatli yuklangan
    if (tests && isPremium) {
        return (
            <div className="premium-tests-list">
                <h2>⭐ Premium O'qish Testlari ({tests.length} ta)</h2>
                <ul>
                    {tests.map(test => (
                        <li key={test.id}>
                            <a href={`/test/${test.id}`}>{test.title}</a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    // ⛔️ Premium emas va kontent yuklanmadi (403 xatosi olingan)
    if (error) {
         return (
            <div className="alert-premium-required">
                <h3>🔒 Premium Talab Qilinadi</h3>
                <p>{error}</p>
                <p>Barcha testlarga kirish uchun <a href="/obuna">Premium Obunani</a> faollashtiring.</p>
            </div>
        );
    }
    
    return null; // Boshqa holatlar
};

export default PremiumReadingTests;