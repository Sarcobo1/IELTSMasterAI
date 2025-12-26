// app/sign-up/page.tsx
import SignUpForm from '@/components/auth/SignUpForm'; 
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Ro'yxatdan O'tish - IELTS MasterAI",
    description: "IELTS MasterAI ga yangi foydalanuvchini ro'yxatdan o'tish sahifasi.",
};

export default function SignUpPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Yangi Hisob Yaratish</h1>
            
            {/* SignUpForm componentini chaqiramiz */}
            <SignUpForm />
        </div>
    );
}