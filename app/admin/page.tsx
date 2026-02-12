"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Crown, Clock } from "lucide-react";

const ADMIN_EMAIL = "akkn72038@gmail.com";

type PremiumEntry = {
    planId: string;
    expiresAt: string;
};

export default function AdminPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [targetEmail, setTargetEmail] = useState("");
    const [planId, setPlanId] = useState<"premium_monthly" | "premium_pro_monthly" | "premium_pro_annual">("premium_monthly");
    const [days, setDays] = useState<number>(30);
    const [message, setMessage] = useState<string | null>(null);
    const [overrides, setOverrides] = useState<Record<string, PremiumEntry>>({});

    const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user?.email]);

    // Load overrides
    useEffect(() => {
        const stored = localStorage.getItem("premiumUsers");
        if (stored) {
            try {
                setOverrides(JSON.parse(stored));
            } catch (e) {
                console.error("premiumUsers parse error", e);
            }
        }
    }, []);

    const saveOverrides = (next: Record<string, PremiumEntry>) => {
        setOverrides(next);
        localStorage.setItem("premiumUsers", JSON.stringify(next));
    };

    const handleAssign = async () => {
        setMessage(null);
        if (!targetEmail.trim()) {
            setMessage("Email kiritilishi kerak.");
            return;
        }
<<<<<<< HEAD
=======

        // Admin tokenni localStorage'dan olish
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        if (!token) {
            setMessage("❌ Xato: Admin token topilmadi. Iltimos, qaytadan login qiling.");
            return;
        }
>>>>>>> 711de7a (Home page optimizatsiya qilindi va Linux orqali yuklandi)
        
        try {
            // MongoDB ga yozish
            const response = await fetch('/api/admin/grant-premium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
<<<<<<< HEAD
=======
                    'Authorization': `Bearer ${token}`,
>>>>>>> 711de7a (Home page optimizatsiya qilindi va Linux orqali yuklandi)
                },
                body: JSON.stringify({ targetEmail: targetEmail.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(`❌ Xato: ${data.message || 'Server xatosi'}`);
                return;
            }

            // localStorage ga ham yozish (backup)
            const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            const next = { ...overrides, [targetEmail.trim()]: { planId, expiresAt } };
            saveOverrides(next);
            
            setMessage(`✅ ${targetEmail} ga ${planId} berildi (MongoDB yangilandi). Muddati: ${new Date(expiresAt).toLocaleDateString()}`);
        } catch (error) {
            console.error('Premium berishda xato:', error);
            setMessage('❌ Xato: Server bilan aloqa qilishda muammo yuz berdi.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-700">Yuklanmoqda...</p>
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <ShieldCheck className="text-red-500" size={48} />
                <p className="text-lg text-gray-700">Kirish huquqi yo'q.</p>
                <p className="text-sm text-gray-500">Faqat admin: {ADMIN_EMAIL}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="text-blue-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                        <p className="text-sm text-slate-500">Faqat {ADMIN_EMAIL} uchun</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Mail size={16} /> Foydalanuvchi email
                        </label>
                        <input
                            type="email"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                            className="w-full mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Crown size={16} /> Reja
                            </label>
                            <select
                                value={planId}
                                onChange={(e) => setPlanId(e.target.value as any)}
                                className="w-full mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="premium_monthly">Premium (oy)</option>
                                <option value="premium_pro_monthly">Premium Pro (oy)</option>
                                <option value="premium_pro_annual">Premium Pro (yil)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Clock size={16} /> Amal qilish (kun)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={3650}
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="w-full mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Belgilash
                    </Button>

                    {message && (
                        <div className="p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
                            {message}
                        </div>
                    )}
                </div>

                {/* Existing overrides list */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Faol belgilangan foydalanuvchilar</h2>
                    <div className="space-y-2">
                        {Object.keys(overrides).length === 0 && (
                            <p className="text-sm text-slate-500">Hozircha ma'lumot yo'q.</p>
                        )}
                        {Object.entries(overrides).map(([email, entry]) => (
                            <div key={email} className="flex justify-between items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                                <div>
                                    <p className="font-semibold text-slate-800">{email}</p>
                                    <p className="text-xs text-slate-500">Reja: {entry.planId}</p>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Muddati: {new Date(entry.expiresAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

