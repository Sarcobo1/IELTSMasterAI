// components/auth/SignUpForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Serverga Ro'yxatdan o'tish (Register) so'rovini yuborish
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 2. Muvaffaqiyatli Ro'yxatdan O'tish
                // Odatda, ro'yxatdan o'tgandan so'ng Kirish sahifasiga yo'naltiriladi
                router.push('/sign-in?success=true'); 
            } else {
                // 3. Xato: Masalan, bu email allaqachon ro'yxatdan o'tgan
                setError(data.message || "Ro'yxatdan o'tishda xato yuz berdi.");
            }
        } catch (err) {
            console.error("Register API chaqiruvida xato:", err);
            setError("Serverga ulanishda kutilmagan xato yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                    <p className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </p>
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
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Parol (Min. 6 belgi)
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan O'tish"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p>
                    Hisobingiz bormi?{" "}
                    <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                        Kirish
                    </Link>
                </p>
            </div>
        </div>
    );
}