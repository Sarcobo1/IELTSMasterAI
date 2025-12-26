// 📁 components/auth/SignInForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('📤 Login so\'rovi yuborilmoqda:', email);
            
            // 1. Serverga Login so'rovi
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            console.log('📥 Login response:', {
                status: response.status,
                ok: response.ok,
                data: data
            });

            if (!response.ok) {
                // ❌ Xato
                setError(data.error || data.message || "Tizimga kirishda xato yuz berdi.");
                setIsLoading(false);
                return;
            }

            // ✅ Muvaffaqiyatli - TOKEN ni tekshirish
            if (!data.token) {
                console.error('❌ Server token qaytarmadi:', data);
                setError('Server token qaytarmadi');
                setIsLoading(false);
                return;
            }

            console.log('🎫 Token qabul qilindi:', {
                type: typeof data.token,
                isString: typeof data.token === 'string',
                length: data.token?.length,
                preview: typeof data.token === 'string' ? data.token.substring(0, 20) + '...' : data.token
            });

            // ⚠️ MUHIM: login() ga TOKEN (string) yuborish kerak, user object emas!
            await login(data.token);
            
            console.log('✅ Login muvaffaqiyatli, redirect qilinmoqda...');
            router.push('/');
            
        } catch (err) {
            console.error("❌ Login xatosi:", err);
            setError(err instanceof Error ? err.message : "Serverga ulanishda xato yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                    <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="user@example.com"
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Parol
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isLoading}
                >
                    {isLoading ? "Kirilmoqda..." : "Kirish"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Hisobingiz yoʻqmi?{" "}
                    <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                        Roʻyxatdan oʻtish
                    </Link>
                </p>
            </div>
        </div>
    );
}