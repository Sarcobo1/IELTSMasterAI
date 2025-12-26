// /app/reading/page.tsx

"use client"

import Link from "next/link"
import React from 'react';
import { Clock, FileText } from "lucide-react"

// Shadcn/UI Button o'rniga oddiy tugma ishlatamiz. Agar loyihangizda Shadcn bo'lsa, uni import qiling
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`p-3 rounded-md font-semibold text-center transition-colors ${className}`} {...props}>
        {children}
    </button>
);


// --- MOCK DATA (Bu yerda sizning barcha testlaringiz ro'yxati joylashadi) ---
const readingTests = [
    {
        id: "passage-1", // Dinamik yo'lga yuboriladigan ID
        title: "Basic Reading: Georgia O’Keeffe",
        subtitle: "7 savol, ONE WORD ONLY",
        level: "Beginner",
        duration: 20,
        description: "Qisqa matnni o‘qib, asosiy ma’lumotlarni tushunish va savollarga javob berish.",
        questionsCount: 7,
        icon: "📘",
        color: "from-green-500 to-teal-500",
        skills: ["Main ideas", "Simple vocabulary"]
    },
    {
        id: "academic-test-1", // Dinamik yo'lga yuboriladigan ID
        title: "Academic Reading",
        subtitle: "13 savol, Matching Headings",
        level: "Intermediate",
        duration: 30,
        description: "O‘rta murakkablikdagi ilmiy matnlar asosida savollarga javob bering.",
        questionsCount: 13,
        icon: "📗",
        color: "from-blue-500 to-cyan-500",
        skills: ["Inference", "Details", "Academic vocabulary"]
    },
];


export default function ReadingSelectionPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            📚 IELTS Reading Practice
                        </div>
                        <h1 className="text-5xl font-bold text-slate-900 mb-4">
                            Reading Test Selection
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Matnlarni o‘qish va tushunish bo‘yicha mashqlarni bajaring.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {readingTests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white rounded-2xl border border-slate-200 hover:border-green-400 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 group"
                            >
                                {/* Gradient Header */}
                                <div className={`h-2 bg-gradient-to-r ${test.color}`} />

                                <div className="p-6">
                                    {/* Icon + Level */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-5xl">{test.icon}</div>

                                        <span className={`
                                            px-3 py-1 text-xs font-bold rounded-full
                                            ${test.level === "Beginner" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                                        `}>
                                            {test.level}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-900">{test.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{test.subtitle}</p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock size={16} className="text-green-600" />
                                            <span>{test.duration} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <FileText size={16} className="text-blue-600" />
                                            <span>{test.questionsCount} questions</span>
                                        </div>
                                    </div>
                                    
                                    {/* Button - DYNAMIC LINK */}
                                    <Link href={`/reading/${test.id}`}> 
                                        <Button
                                            className={`w-full bg-gradient-to-r ${test.color} text-white py-3 text-base rounded-xl font-semibold shadow-md group-hover:shadow-lg transition-all`}
                                        >
                                            Testni boshlash
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}