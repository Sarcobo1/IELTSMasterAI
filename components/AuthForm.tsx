// components/AuthForm.tsx

"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; 
import { Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthFormProps {
    type: 'login' | 'register';
    onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isLogin = type === 'login';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // ✅ Xato xabarini aniqroq ko'rsatish
                const errorMessage = data.error || data.message || "Xatolik yuz berdi.";
                setError(errorMessage);
                return; // Bu yerda to'xtatish muhim
            }

            // Muvaffaqiyatli javob
            if (isLogin) {
                // Tizimga kirish muvaffaqiyatli
                login({ id: data.user.id, email: data.user.email }); 
                onSuccess();
            } else {
                // Ro'yxatdan o'tish muvaffaqiyatli
                setEmail(''); // Formani tozalash
                setPassword('');
                alert(data.message || "Ro'yxatdan muvaffaqiyatli o'tdingiz! Iltimos, tizimga kiring.");
                onSuccess();
            }

        } catch (err) {
            console.error("Auth xatosi:", err);
            setError("Tarmoq xatosi: Serverga ulanib bo'lmadi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                {isLogin ? (
                    <LogIn size={20} className="mr-2 text-blue-600" />
                ) : (
                    <UserPlus size={20} className="mr-2 text-green-600" />
                )}
                {isLogin ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            </h3>

            {/* ✅ Xato xabarini yaxshiroq ko'rsatish */}
            {error && (
                <div className="flex items-start bg-red-50 border border-red-300 text-red-800 px-3 py-3 text-sm rounded-lg mb-4">
                    <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`${type}-email`}>
                        Email
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <Mail size={18} className="text-gray-400 ml-3" />
                        <input
                            type="email"
                            id={`${type}-email`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2.5 pl-2 focus:outline-none"
                            placeholder="user@example.com"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`${type}-password`}>
                        Parol
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <Lock size={18} className="text-gray-400 ml-3" />
                        <input
                            type="password"
                            id={`${type}-password`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full p-2.5 pl-2 focus:outline-none"
                            placeholder="Kamida 6 belgi"
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !email || !password || password.length < 6}
                    className={`w-full flex items-center justify-center py-2.5 rounded-md font-semibold text-white transition-colors shadow-sm
                        ${loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : isLogin 
                                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            {isLogin ? "Kirish..." : "Ro'yxatdan o'tish..."}
                        </>
                    ) : (
                        isLogin ? "Kirish" : "Ro'yxatdan o'tish"
                    )}
                </button>
            </form>

            {/* ✅ Qo'shimcha maslаhat */}
            <p className="text-xs text-gray-500 mt-4 text-center">
                {isLogin ? (
                    "Hali ro'yxatdan o'tmaganmisiz? O'ng tomondagi formadan foydalaning."
                ) : (
                    "Allaqachon akkauntingiz bormi? Chap tomondagi formadan kirish mumkin."
                )}
            </p>
        </div>
    );
};

export default AuthForm;