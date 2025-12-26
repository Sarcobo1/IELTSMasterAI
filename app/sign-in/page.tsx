// app/sign-in/page.tsx
import SignInForm from '@/components/auth/SignInForm'; // Kirish formasini import qilamiz
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const metadata: Metadata = {
    title: 'Tizimga Kirish - IELTS MasterAI',
    description: 'IELTS MasterAI ga kirish sahifasi.',
};

export default function SignInPage() {
    // AuthContext'dan holatni olamiz
    // ⚠️ Eslatma: useAuth bu yerda ishlashi uchun, bu fayl 'use client' bo'lishi kerak!
    // Lekin NextJS 13+ da `redirect` server komponentida chaqiriladi, shuning uchun
    // tekshirishni AuthForm ichida bajarish yaxshiroq. Hozircha oddiy qoldiramiz.

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Tizimga Kirish</h1>
            
            {/* SignInForm componentini chaqiramiz */}
            <SignInForm />
        </div>
    );
}