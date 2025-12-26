// app/payment/page.tsx
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Clock, Send, Copy } from "lucide-react";

const ADMIN_TELEGRAM = "@your_admin_username";
const CARD_NUMBER = "8600 1234 5678 9012";
const CARD_NAME = "Muhammadjonov Azizbek";

const plans = [
    {
        id: "premium_monthly",
        name: "Premium (oylik)",
        price: "$9",
        period: "30 kun",
        features: [
            "Speaking Analyzer: Oyiga 20 ta so'rov",
            "Writing: Oyiga 20 ta insho",
            "Barcha bo'limlarda cheklangan testlar",
            "AI Grammar tavsiyalari",
        ],
        icon: Clock,
    },
    {
        id: "premium_pro_monthly",
        name: "Premium Pro (oylik)",
        price: "$19",
        period: "30 kun",
        features: [
            "Speaking Analyzer: Cheklanmagan",
            "Writing: Cheklanmagan tezkor baholash",
            "Barcha bo'limlarda cheksiz testlar",
            "AI Tutor: Premium maslahatlar",
        ],
        icon: Zap,
    },
    {
        id: "premium_pro_annual",
        name: "Premium Pro (yillik)",
        price: "$150",
        period: "365 kun",
        features: [
            "Premium Pro'ning barcha imkoniyatlari",
            "Yiliga 50% tejash",
            "Ustuvor qo'llab-quvvatlash",
        ],
        icon: Crown,
    },
];

const buildTelegramUrl = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    const text = encodeURIComponent(
        `Assalomu alaykum! Men ${plan?.name || planId} tarifini sotib olmoqchiman.\n` +
        `Narx: ${plan?.price || "-"}\n` +
        `Davomiylik: ${plan?.period || "-"}\n` +
        `\nKarta: ${CARD_NUMBER}\nIsm: ${CARD_NAME}\n` +
        `\nTo'lov skrinshotini shu yerga yuboraman.`
    );
    return `https://t.me/${ADMIN_TELEGRAM.replace("@", "")}?text=${text}`;
};

// ✅ Asosiy komponent - Suspense ichida
function PaymentContent() {
    const params = useSearchParams();
    const router = useRouter();
    const planId = params.get("plan") || "premium_monthly";

    const plan = useMemo(() => plans.find(p => p.id === planId) || plans[0], [planId]);

    const copyCard = async () => {
        try {
            await navigator.clipboard.writeText(`${CARD_NUMBER} (${CARD_NAME})`);
            alert("Karta ma'lumoti nusxa olindi");
        } catch (e) {
            alert("Nusxa olishni ilovada qo'llab-quvvatlang");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <plan.icon className="text-blue-600" size={28} />
                    <div>
                        <p className="text-sm text-slate-500">Tanlangan tarif</p>
                        <h1 className="text-2xl font-bold text-slate-900">{plan.name}</h1>
                        <p className="text-lg font-semibold text-blue-600">{plan.price} · {plan.period}</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">To'lov ma'lumotlari</h2>
                    <p className="text-sm text-blue-800">Karta raqami: <span className="font-semibold">{CARD_NUMBER}</span></p>
                    <p className="text-sm text-blue-800">Ism: <span className="font-semibold">{CARD_NAME}</span></p>
                    <p className="text-sm text-blue-800">Admin Telegram: <span className="font-semibold">{ADMIN_TELEGRAM}</span></p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        <Button size="sm" variant="outline" onClick={copyCard} className="flex items-center gap-2">
                            <Copy size={16} /> Karta ma'lumotini nusxalash
                        </Button>
                        <Button size="sm" onClick={() => router.push(buildTelegramUrl(plan.id))} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                            <Send size={16} /> Telegramga yozish
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Tarifda nimalar bor?</h3>
                    <ul className="space-y-2 list-disc list-inside text-slate-700">
                        {plan.features.map((f, idx) => (
                            <li key={idx}>{f}</li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-semibold mb-1">To'lov jarayoni</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Karta raqamiga to'lovni amalga oshiring.</li>
                        <li>Telegram orqali adminga yozing: {ADMIN_TELEGRAM}.</li>
                        <li>To'lov skrinshotini yuboring va emailingizni ko'rsating.</li>
                        <li>Admin tasdiqlaganidan so'ng tarifingiz faollashtiriladi.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

// ✅ Export default - Suspense bilan
export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}