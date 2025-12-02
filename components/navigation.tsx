"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, Sparkles, User, Crown } from "lucide-react" 
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // YANGI: Premium rejasini saqlash uchun state
  const [premiumPlanId, setPremiumPlanId] = useState<string | null>(null); 
  
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const savedPlanId = localStorage.getItem('premiumPlanId'); // Saqlangan plan ID sini o'qiymiz
    
    setIsLoggedIn(!!token)
    setPremiumPlanId(savedPlanId); // Statusni o'rnatamiz
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('isPremium') // Statusni ham tozalaymiz
    localStorage.removeItem('premiumPlanId') // Plan ID ni ham tozalaymiz
    
    setIsLoggedIn(false)
    setPremiumPlanId(null); // Statusni yangilaymiz
    router.push('/login')
  }

  // PREMIUM STATUSINI MATNGA AYLANTRISH FUNKSIYASI
  const getPlanBadge = (planId: string | null) => {
    if (!planId) return null;

    switch (planId) {
      case 'premium_monthly':
        return <span className="text-sm font-black text-amber-500 ml-2">(PREMIUM)</span>;
      case 'premium_pro_monthly':
        return <span className="text-sm font-black text-blue-600 ml-2">(PRO)</span>;
      case 'premium_pro_annual':
        // Yillik uchun o'ziga xos nom
        return <span className="text-sm font-black text-emerald-600 ml-2">(PRO ANNUALLY)</span>; 
      default:
        return null;
    }
  }

  const navItems = [
    { label: "Premium", href: "/premium", isSpecial: true },
    { label: "Vocabulary", href: "/vocabularypage" },
    { label: "Speaking Analyzer", href: "/speakinganalyzer" },
    { label: "Writing", href: "/writing-selection" },  
    { label: "Speaking", href: "/speaking-selection" },
    { label: "Reading", href: "/reading-selection" },
    { label: "Listening", href: "/listening-selection" },
    { label: "AI Tutor", href: "/grammar-tutor" },
    { label: "Support", href: "/support" },
  ]
  
  // Premium bo'lsa, 'Upgrade' tugmasini yashirish uchun tekshiruv
  const isUserPremium = !!premiumPlanId;


  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section + PREMIUM STATUS BADGE */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
              <Image 
                src="/icon.webp" 
                alt="logo" 
                width={40} 
                height={40} 
                className="rounded-lg object-cover" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-slate-900 tracking-tight">
                IELTS <span className="text-blue-600">MasterAI</span>
              </span>
              {/* STATUSNI BU YERGA QO'SHAMIZ */}
              {isLoggedIn && getPlanBadge(premiumPlanId)} 
            </div>
          </Link>

          {/* Desktop Navigation - Faqat XL (1280px) dan keyin ko'rinadi */}
          <div className="hidden xl:flex items-center gap-1 lg:gap-6">
            {navItems.filter(item => !item.isSpecial).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Premium Button - Faqat premium BO'LMASA ko'rinadi */}
            {isLoggedIn && !isUserPremium && (
                <Link href="/premium" className="hidden xl:block">
                  <Button 
                    variant="default"
                    className="text-sm px-4 py-2 bg-amber-500 text-slate-900 hover:bg-amber-600 transition-all duration-300 border-0 flex items-center gap-1 font-bold"
                  >
                    <Crown size={16} fill="white" className="text-white"/>
                    Upgrade
                  </Button>
                </Link>
            )}

            {isLoggedIn ? (
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="hidden sm:flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <LogOut size={16} />
                <span>Chiqish</span>
              </Button>
            ) : (
              <Link href="/login">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
                >
                  <User size={16} className="mr-2" />
                  Kirish
                </Button>
              </Link>
            )}

            {/* Menu Tugmasi - XL (1280px) dan kichik hamma joyda ko'rinadi */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors xl:hidden"
            >
              {isOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white shadow-xl">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item, index) => (
              // Premium bo'lsa va 'Premium' linki bo'lsa, uni yashirishimiz mumkin
              // Lekin mobil menyuda uni doim ko'rsatish yaxshiroq (obunani uzaytirish uchun)
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block rounded-lg px-4 py-3 text-sm font-medium transition-colors
                  ${item.isSpecial 
                    ? 'text-amber-600 hover:bg-amber-50 font-bold flex items-center gap-2'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {item.isSpecial && <Crown size={18} fill="currentColor"/>}
                {item.label}
              </Link>
            ))}
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Chiqish
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <User size={18} />
                  Kirish
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}