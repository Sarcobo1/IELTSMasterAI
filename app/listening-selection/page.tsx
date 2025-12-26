"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { Volume2, Clock, BarChart3, Play, Headphones, Sparkles, Activity, Users, ArrowRight } from "lucide-react"

// Test ma'lumotlari (Ranglar va ikonkalarni boyitdik)
const LISTENING_TESTS = [
  {
    id: "test-1",
    title: "Basic Practice",
    level: "Beginner",
    description: "Kundalik mavzular, sekin nutq va aniq talaffuz. Boshlovchilar uchun ideal.",
    questionsCount: 10,
    color: "emerald",
    participants: "12.5k",
    tags: ["Daily Life", "Slow Pace"]
  },
  {
    id: "test-2",
    title: "Intermediate Lab",
    level: "Intermediate",
    description: "Intervyular va ta'limga oid suhbatlar. O'rta tezlikdagi nutqni tushunish.",
    questionsCount: 15,
    color: "indigo",
    participants: "8.2k",
    tags: ["Education", "Interview"]
  },
  {
    id: "test-3",
    title: "Advanced Challenge",
    level: "Advanced",
    description: "Ilmiy ma'ruzalar va tezkor debatlar. Murakkab so'z boyligi va aksentlar.",
    questionsCount: 20,
    color: "rose",
    participants: "5.1k",
    tags: ["Academic", "Fast Pace"]
  },
]

export default function ListeningSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-purple-500/30">
      
      {/* Background Ambience (Shovqin va ranglar) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-200/40 rounded-full blur-[120px] -z-10"></div>
      </div>

      <main className="flex-grow relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 shadow-sm mb-2 animate-fade-in">
                <Headphones size={16} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-900 uppercase tracking-widest">Listening Module</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Eshiting. Tushuning. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Yuting.</span>
            </h1>
            
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Real imtihon muhitini his eting. Darajangizga mos testni tanlang va qulog'ingizni ingliz tiliga o'rgating.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {LISTENING_TESTS.map((test, index) => (
              <div
                key={test.id}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Decorative Gradient Blob inside card */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${test.color}-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-colors opacity-0 group-hover:opacity-100 duration-500`}></div>

                {/* Top Section: Icon & Level */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                   <div className={`w-14 h-14 rounded-2xl bg-${test.color}-50 flex items-center justify-center text-${test.color}-600 group-hover:scale-110 transition-transform duration-300 border border-${test.color}-100`}>
                      {test.level === "Beginner" ? <Sparkles size={28} /> : test.level === "Intermediate" ? <Activity size={28} /> : <BarChart3 size={28} />}
                   </div>
                   
                   <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-${test.color}-50 text-${test.color}-700 border border-${test.color}-100`}>
                      {test.level}
                   </div>
                </div>

                {/* Title & Stats */}
                <div className="relative z-10 mb-6 flex-grow">
                   <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">{test.title}</h3>
                   <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                      <span className="flex items-center gap-1"></span>
                      <span className="flex items-center gap-1"><Users size={14}/> {test.participants}</span>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed mb-4">{test.description}</p>
                   
                   {/* Tags */}
                   <div className="flex flex-wrap gap-2">
                      {test.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-semibold bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">#{tag}</span>
                      ))}
                   </div>
                </div>

                {/* Audio Visualizer Animation (Bottom) */}
                <div className="absolute bottom-24 right-8 flex items-end gap-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {[1,2,3,4,5].map((bar) => (
                        <div key={bar} className={`w-1 bg-${test.color}-500 rounded-full animate-bounce`} style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="relative z-10 mt-auto pt-6 border-t border-slate-50">
                   <Link href={`/listening/${test.id}`} className="w-full block">
                     <Button className={`w-full h-12 bg-slate-900 hover:bg-${test.color}-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 group-hover:shadow-${test.color}-200 flex items-center justify-between px-6`}>
                        <span className="font-semibold">Boshlash</span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs opacity-70">{test.questionsCount} savol</span>
                           <div className="bg-white/20 p-1 rounded-full">
                              <Play size={12} fill="currentColor" />
                           </div>
                        </div>
                     </Button>
                   </Link>
                </div>

              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}