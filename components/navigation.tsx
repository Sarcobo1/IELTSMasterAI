// components/Navbar.tsx
'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, User, Crown, LogOut } from "lucide-react" // LogOut ikonkasi qo'shildi
import { useState } from "react"
// ✅ O'ZGARISH: Clerk importlari olib tashlandi
import { useAuth } from '@/context/AuthContext'; // ✅ CUSTOM AUTH import qilindi

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    // ✅ useAuth() hookini ishlatamiz
    const { isAuthenticated, user, logout } = useAuth(); 

    const navItems = [
        { label: "Vocabulary", href: "/vocabularypage" },
        { label: "Speaking Analyzer", href: "/speakinganalyzer" },
        { label: "Writing", href: "/writing-selection" },
        { label: "Speaking", href: "/speaking-selection" },
        { label: "Reading", href: "/reading-selection" },
        { label: "Listening", href: "/listening-selection" },
        { label: "AI Tutor", href: "/grammar-tutor" },
        { label: "Support", href: "/support" },
    ]

    const handleLogout = () => {
        logout();
        setIsOpen(false); // Mobile menuni yopish
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                            <Image src="/icon.webp" alt="logo" width={40} height={40} className="rounded-lg object-cover" />
                        </div>
                        <span className="text-lg font-bold leading-tight text-slate-900 tracking-tight">
                            IELTS <span className="text-blue-600">MasterAI</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex items-center gap-6">
                        <Link href="/premium" className="text-sm font-bold flex items-center gap-1 text-amber-500 hover:text-amber-600">
                            <Crown size={16} /> Premium
                        </Link>

                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-slate-600 hover:text-blue-600"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth + Mobile */}
                    <div className="flex items-center gap-3">

                        {/* Auth Tugmalari */}
                        {isAuthenticated ? (
                            // ✅ Kirilgan holat (email ko'rsatilmaydi)
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Chiqish
                                </Button>
                            </div>
                        ) : (
                            // ✅ Kirilmagan holat
                            <Button asChild className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                                <Link href="/sign-in">
                                    <User size={16} /> Kirish
                                </Link>
                            </Button>
                        )}


                        {/* Mobile Menu Btn */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 xl:hidden"
                            aria-label="Toggle Menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="xl:hidden border-t border-slate-100 bg-white shadow-xl">
                    <div className="space-y-1 px-4 py-4">

                        <Link
                            href="/premium"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-amber-500 font-bold px-4 py-2 rounded-lg hover:bg-amber-50"
                        >
                            <Crown size={18} /> Premium
                        </Link>

                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            {isAuthenticated ? (
                                // ✅ Mobile Kirilgan Holat: Chiqish tugmasi (email ko'rsatilmaydi)
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        onClick={handleLogout} 
                                        className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={16} /> Chiqish
                                    </Button>
                                </div>
                            ) : (
                                // ✅ Mobile Kirilmagan Holat: Kirish va Ro'yxatdan o'tish tugmalari
                                <div className="flex flex-col gap-2">
                                    <Button asChild className="w-full bg-blue-600 text-white mb-2 hover:bg-blue-700">
                                        <Link href="/sign-in" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                                            <User size={16} /> Kirish
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                                        <Link href="/sign-up" onClick={() => setIsOpen(false)}>Ro‘yxatdan o‘tish</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}