"use client"

import { ForwardRefExoticComponent, RefAttributes, useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Clock, Zap, MessageCircle, Sparkles, LucideProps } from "lucide-react"; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ADMIN_TELEGRAM = "@your_admin_username";

// 💡 Navigatsiya panelini import qilamiz
// import Navigation from "@/components/navigation"; 


// --- TYPE DEFINITIONS (Ma'lumot turlari) ---
// Lucide ikonka komponentining umumiy turi
type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// Har bir funksiya (feature) ob'ekti uchun interfeys
interface FeatureType {
    text: string;
    limited: boolean;
    icon: IconType;
    // Xatolik sababchisi: Bazi funksiyalarda bu maydon bo'lmagani uchun uni ixtiyoriy (?) qilamiz
    isSoon?: boolean; 
}
//(Limitli)
// Har bir reja (plan) ob'ekti uchun interfeys
interface PlanType {
    id: string;
    name: string;
    price: string;
    tag: string;
    features: FeatureType[]; // Features uchun aniq tur
    style: string;
    isAnnual?: boolean;
}
// --- END TYPE DEFINITIONS ---


// Obuna rejasi turlari (Plan data) - PlanType[] turini belgilaymiz
const plans: PlanType[] = [
    // 🔥 1. FREE PLAN (Bepul Reja)
    {
        id: 'free',
        name: "Bepul",
        price: "$0",
        tag: "Dastlabki sinov",
        features: [
            { text: "Vocebluary", limited: true, icon: CheckCircle },
            { text: "Speaking Analyzer", limited: true, icon: Clock },
            { text: "Writing", limited: true, icon: Clock },
            { text: "Speaking", limited: false, icon: Clock },
            { text: "Reading", limited: false, icon: Clock },
            { text: "Listening", limited: false, icon: Clock },
            { text: "Ai Tutor", limited: false, icon: Clock  },
        ],
        style: "bg-white border-2 border-gray-300 hover:border-gray-500"
    },
    // 2. Premium rejasi
    {
        id: 'premium_monthly',
        name: "Premium",
        price: "$9",
        tag: "Boshlang'ich",
        features: [
            { text: "Speaking Analyzer: Cheklangan foydalanish (Oyiga 20 ta so'rov)", limited: true, icon: Clock },
            { text: "Writing: Cheklangan AI baholash (Oyiga 20 ta insho)", limited: true, icon: Clock },
            { text: "Barcha 4 bo'lim bo'yicha cheklangan testlar", limited: true, icon: Clock },
            { text: "Grammar Tutor: Standart maslahatlar", limited: false, icon: CheckCircle },
        ],
        style: "bg-slate-50 border-2 border-slate-200 hover:border-blue-300"
    },
    // 3. Premium Pro rejasi
    {
        id: 'premium_pro_monthly',
        name: "Premium Pro",
        price: "$19",
        tag: "Eng qulay",
        features: [
            { text: "Speaking Analyzer: Cheklanmagan foydalanish", limited: false, icon: Zap },
            { text: "Writing: 24/7 tezkor AI baholash (Cheklanmagan)", limited: false, icon: Zap },
            { text: "Barcha 4 bo'lim bo'yicha cheksiz testlar", limited: false, icon: Zap },
            { text: "Grammar Tutor: Premium maslahatlar", limited: false, icon: Zap },
        ],
        style: "bg-white border-2 border-blue-600 shadow-2xl shadow-blue-300"
    },
    // 4. Yillik Premium Pro rejasi
    {
        id: 'premium_pro_annual',
        name: "Yillik Premium Pro",
        price: "$150",
        tag: "Eng ommabop (50% tejash)",
        isAnnual: true,
        features: [
            // isSoon: true bu yerda mavjud
            { text: "Boshqa studentlar bilan Voice-Chat (Tez Kunda)", limited: true, icon: MessageCircle, isSoon: true }, 
            { text: "Barcha Pro funksiyalari", limited: false, icon: Crown },
            { text: "Yillik 50% chegirma", limited: false, icon: Crown },
            { text: "Maxsus Ustuvor Qo'llab-quvvatlash", limited: false, icon: Crown },
            { text: "Kelajakdagi barcha yangi Pro funksiyalar", limited: false, icon: Crown },
        ],
        style: "bg-white border-2 border-amber-500 shadow-2xl shadow-amber-300"
    }
];

export default function PremiumPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [currentExpiry, setCurrentExpiry] = useState<string | null>(null);

    const formatDate = (iso?: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString();
    }

    const planName = (id?: string | null) => {
        const match = plans.find(p => p.id === id);
        return match?.name || id || '';
    };

    // Load existing status for logged-in user from AuthContext (DB)
    useEffect(() => {
        if (!user) {
            setCurrentPlan(null);
            setCurrentExpiry(null);
            return;
        }

        setCurrentPlan(user.planId || 'free');
        setCurrentExpiry(user.premiumExpiresAt || null);
    }, [user]);

    const handlePurchase = (planId: string, isAnnual: boolean) => {
        if (!isAuthenticated || !user?.email) {
            router.push('/sign-in');
            return;
        }

        // Agar "Bepul" tanlansa, Premium yozuvini tozalaymiz
        if (planId === 'free') {
            try {
                const current = localStorage.getItem('premiumUsers');
                if (current) {
                    const map = JSON.parse(current) as Record<string, { planId: string; expiresAt: string }>;
                    delete map[user.email];
                    localStorage.setItem('premiumUsers', JSON.stringify(map));
                }
            } catch (e) {
                console.warn('premiumUsers parse failed when resetting to free', e);
            }
            setCurrentPlan(null);
            setCurrentExpiry(null);
            router.push('/');
            return;
        }

        // Hamma foydalanuvchilar to'lov sahifasiga yo'naltiriladi
        router.push(`/payment?plan=${planId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-700">Yuklanmoqda...</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <p className="text-lg text-gray-700">Premium rejalardan foydalanish uchun tizimga kiring.</p>
                <Button onClick={() => router.push('/sign-in')} className="bg-blue-600 text-white">Kirish</Button>
            </div>
        );
    }

    return (
        <>
            {/* <Navigation />  */}
            
            {/* Sahifa Kontenti */}
            <div className="min-h-screen bg-slate-50 py-12 px-4 pt-20">
                <div className="max-w-7xl mx-auto text-center">
                    <Crown size={48} className="text-amber-500 mx-auto mb-4 fill-amber-500" />
                    <h1 className="text-4xl font-black text-slate-900 mb-2">IELTS MasterAI Obuna Rejalari</h1>
                    <p className="text-xl text-slate-600 mb-10">Maqsadingizga mos keladigan rejangizni tanlang va o'rganishni boshlang.</p>

                    {/* Current status banner */}
                    {currentPlan && (
                        <div className="max-w-2xl mx-auto mb-10 p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="font-semibold">Faol reja: {planName(currentPlan)}</p>
                                {currentExpiry && <p className="text-sm">Amal qilish muddati: {formatDate(currentExpiry)}</p>}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase">
                                {currentPlan}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> 
                        
                        {plans.map((plan) => (
                            <div 
                                key={plan.id}
                                className={`relative p-8 rounded-2xl shadow-xl flex flex-col transition-all duration-300 ${plan.style} ${plan.id === currentPlan ? 'ring-2 ring-blue-500 shadow-blue-500/30' : plan.id === 'free' ? 'shadow-md hover:shadow-lg' : ''}`}
                            >
                                {/* Ommaboplik yorlig'i */}
                                {plan.isAnnual && (
                                    <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full transform rotate-3 shadow-lg">
                                        {plan.tag}
                                    </div>
                                )}

                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                                <p className={`text-4xl font-black mb-4 ${plan.isAnnual ? 'text-amber-600' : plan.id === 'free' ? 'text-gray-600' : 'text-blue-600'}`}>
                                    {plan.price}
                                    <span className="text-lg text-slate-500">
                                        {plan.isAnnual ? '/yiliga' : plan.id === 'free' ? '' : '/oyiga'}
                                    </span>
                                </p>
                                
                                <div className="space-y-3 text-left flex-grow mb-8">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            
                                            {/* Ikonka renderi */}
                                            {feature.icon === Crown ? (
                                                <Crown size={20} className="text-amber-500 flex-shrink-0 mt-1" />
                                            ) : (
                                                <feature.icon 
                                                    size={20} 
                                                    // "Tez Kunda" bo'lsa, uni biroz kulrang qilib qo'yamiz
                                                    // Endi feature.isSoon xato bermaydi, chunki u ixtiyoriy.
                                                    className={feature.isSoon ? "text-slate-400 flex-shrink-0 mt-1" : feature.limited ? "text-red-500 flex-shrink-0 mt-1" : "text-blue-500 flex-shrink-0 mt-1"} 
                                                />
                                            )}
                                            
                                            <p className={`text-slate-700 ${feature.limited ? 'opacity-70' : ''}`}>
                                                {feature.text}
                                                {/* "Tez Kunda" yorlig'i */}
                                                {feature.isSoon && <span className="text-xs text-slate-500 ml-1 font-semibold"> (Tez Kunda)</span>}
                                                {/* Oddiy cheklov yorlig'i (faqat isSoon bo'lmaganida ko'rsatiladi) */}
                                                {feature.limited && !feature.isSoon && <span className="text-xs text-red-500 ml-1 font-semibold"> (Limit)</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <Button 
                                    onClick={() => handlePurchase(plan.id, !!plan.isAnnual)} 
                                    disabled={plan.id !== 'free' && plan.id === currentPlan}
                                    className={`w-full h-12 text-lg font-semibold shadow-lg ${
                                        plan.id === 'free'
                                        ? 'bg-gray-500 hover:bg-gray-600 shadow-gray-500/30'
                                        : plan.isAnnual 
                                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                    } ${plan.id === currentPlan ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {plan.id === currentPlan ? 'Faol reja' : plan.id === 'free' ? 'Bepul Boshlash' : 'Sotib olish'}
                                </Button>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}//hozircha