"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { Mic, PenTool, BookOpen, Volume2, Clock, Zap, Target, ArrowRight } from "lucide-react"

// --- TEST MA'LUMOTLARI ---
const TESTS = [
  {
    title: "Speaking Module",
    icon: Mic,
    duration: "11-14 min",
    difficulty: "All Levels",
    description:
      "Fluency, Pronunciation va Coherence bo'yicha sun'iy intellektga asoslangan baholash bilan nutq amaliyoti.",
    href: "/speaking-selection", 
    color: "bg-gradient-to-br from-orange-400 to-red-500",
    shadow: "shadow-orange-300/50",
    bgClass: "bg-orange-50",
  },
  {
    title: "Writing Module",
    icon: PenTool,
    duration: "60 min",
    difficulty: "All Levels",
    description: "Essay va Task 1 yozing. Band ballari va grammatikani tekshirish bo'yicha tezkor javob oling.",
    href: "/writing-selection", 
    color: "bg-gradient-to-br from-blue-400 to-cyan-500",
    shadow: "shadow-blue-300/50",
    bgClass: "bg-blue-50",
  },
  {
    title: "Reading Module",
    icon: BookOpen,
    duration: "60 min",
    difficulty: "All Levels",
    description: "Matnlar bilan ishlash, javoblar tahlili va natijalarni zudlik bilan baholash bilan tanishing.",
    href: "/reading-selection", 
    color: "bg-gradient-to-br from-green-400 to-teal-500",
    shadow: "shadow-green-300/50",
    bgClass: "bg-green-50",
  },
  {
    title: "Listening Module",
    icon: Volume2,
    duration: "30 min",
    difficulty: "All Levels",
    description: "Audio yozuvlarni tinglang, savollarga javob bering va natijalarni batafsil tahlil qiling.",
    href: "/listening-selection", 
    color: "bg-gradient-to-br from-purple-400 to-pink-500",
    shadow: "shadow-purple-300/50",
    bgClass: "bg-purple-50",
  },
]

export default function TestsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500/30">
      
      {/* Background Effect: Grid and Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <main className="flex-grow relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm animate-fade-in">
                <Target size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">IELTS 4 Modul</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Testni <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">boshlang</span>
            </h1>
            
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              IELTS imtihonining har bir bo'limida mahoratingizni oshiring. Har bir modul o'ziga xos yondashuvni talab qiladi.
            </p>
          </div>

          {/* Tests Grid (2x2 Layout for better balance) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
            {TESTS.map((test) => (
              <Link href={test.href} key={test.title} className="group block relative perspective-1000">
                <div
                  className={`relative ${test.bgClass} rounded-[2rem] border-2 border-slate-100 p-8 flex flex-col items-start h-full transition-all duration-500 
                  shadow-xl hover:shadow-2xl hover:${test.shadow}
                  hover:scale-[1.02] 
                  transform hover:rotate-y-3 hover:rotate-x-2`}
                >
                  
                  {/* Floating Icon */}
                  <div className={`w-16 h-16 rounded-full ${test.color} flex items-center justify-center mb-6 shadow-xl text-white transition-all duration-500 group-hover:scale-[1.15] group-hover:shadow-2xl`}>
                    <test.icon size={32} />
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-3">{test.title}</h3>

                  <p className="text-slate-600 text-base leading-relaxed mb-6 flex-grow">{test.description}</p>

                  {/* Stats Badges */}
                  <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold">
                    <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <Clock size={16} className="text-indigo-500" />
                      {test.duration}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <Zap size={16} className="text-indigo-500" />
                      {test.difficulty}
                    </div>
                  </div>
                  
                  {/* Start Button */}
                  <Button className={`w-full h-12 ${test.color} text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl flex items-center justify-center gap-2`}>
                      Boshlash
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>

          {/* Tips Section - Slightly Modernized */}
          <div className="bg-white border-2 border-indigo-200 rounded-[2rem] p-8 sm:p-12 shadow-inner shadow-indigo-100/50">
            <h3 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Zap size={28} className="text-indigo-600 fill-indigo-100/50" />
              Muhim Maslahatlar
            </h3>
            <ul className="space-y-4 text-base text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-black mt-0.5">01</span>
                <p>
                  <strong className="text-slate-900">Doimiy Mashq:</strong> Format va savol turlari bilan tanishish uchun muntazam ravishda sinov testlarini o'tkazing.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-black mt-0.5">02</span>
                <p>
                  <strong className="text-slate-900">Vaqtni Boshqarish:</strong> Har bir bo'limga ajratilgan vaqtdan samarali foydalanishni o'rganing. Qiyin savollarga uzoq qolib ketmang.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-black mt-0.5">03</span>
                <p>
                  <strong className="text-slate-900">Fikrlarni Qayta Ko'rish:</strong> Imkon qadar javoblaringizni tekshirib chiqing, ayniqsa Listening va Reading bo'limlarida.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* GLOBAL STYLES & ANIMATIONS */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .hover\\:rotate-y-3:hover { transform: rotateY(3deg); }
        .hover\\:rotate-x-2:hover { transform: rotateX(2deg); }
      `}</style>
    </div>
  )
}