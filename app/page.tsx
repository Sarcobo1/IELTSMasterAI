"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// import Footer from "@/components/footer"
import { ArrowRight, Mic, BookOpen, PenTool, Volume2, Globe, Sparkles, Zap, CheckCircle2, Target, X, BarChart3, Trophy, ChevronRight } from "lucide-react"
import Typed from "typed.js"

// --- KONFIGURATSIYA ---
const PROFILE_IMAGE_KEY = 'ielts_profile_image';
const TARGET_SCORE_KEY = 'ielts_target_score';
const SCORES = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [targetScore, setTargetScore] = useState<string>("7.5");
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const typedRef = useRef<HTMLSpanElement | null>(null);

  // Typed.js initialization (faqat client va katta ekranlarda)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return; // mobil qurilmalarda typed.js ni o'chiramiz
    if (!typedRef.current) return;

    const typed = new Typed(typedRef.current, {
      strings: ["your future.", "your opportunities.", "your results."],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1500,
      loop: true,
      showCursor: false,
    });

    return () => typed.destroy();
  }, []);

  // LocalStorage Logic
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;
    try {
      const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImage) setUploadedImage(savedImage);
      const savedScore = localStorage.getItem(TARGET_SCORE_KEY);
      if (savedScore) setTargetScore(savedScore);
    } catch (e) { console.error(e); }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      setUploadedImage(data);
      localStorage.setItem(PROFILE_IMAGE_KEY, data);
    };
    reader.readAsDataURL(file);
  };

  const handleScoreSelect = (score: string) => {
    setTargetScore(score);
    localStorage.setItem(TARGET_SCORE_KEY, score);
    setIsScoreModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500/30">
      
      {/* Background Grid Pattern (yengillashtirilgan fon, tashqi rasm yo'q) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.16),transparent_60%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.14),transparent_55%)]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <main className="flex-grow relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-white/50 backdrop-blur-md shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">AI 2.0 Versiyasi</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                  Transform <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
                    <span ref={typedRef}></span>
                  </span>
                </h1>

                <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  A new era of IELTS preparation with <span className="text-slate-900 font-bold underline decoration-indigo-400/50 decoration-2 underline-offset-4">IELTSMasterAI.</span> 
                  Get precise, AI-powered analysis for your Speaking and Writing.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                  <Link href="/grammar-tutor" className="w-full sm:w-auto group">
                    <div className="relative w-full sm:w-auto overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-8 py-4 text-base font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900 gap-2">
                          Boshlash <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                  </Link>
                  
                  <Link href="/tests" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full h-14 text-slate-600 font-semibold text-base px-8 rounded-2xl hover:bg-white hover:shadow-lg hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100">
                      Bepul Test
                    </Button>
                  </Link>
                </div>

                {/* Users info (yengil variant, tashqi avatar rasmlarisiz) */}
                <div className="flex items-center justify-center lg:justify-start gap-3 pt-4 text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 px-3 py-1">
                    1,000+ o'quvchi
                  </span>
                  <span className="text-slate-500">IELTSMasterAI orqali tayyorlanmoqda</span>
                </div>

              </div>

              {/* Right Content - Modern Glass Card */}
              <div className="flex-1 relative w-full max-w-lg lg:max-w-xl perspective-1000">
                 {/* Decorative Gradient Blob behind image */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

                 <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-4 shadow-2xl shadow-indigo-500/10 transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out">
                    
                    {/* Image Container */}
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 group cursor-pointer">
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                       <label htmlFor="image-upload" className="w-full h-full block">
                         {isMounted && uploadedImage ? (
                           <img src={uploadedImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400">
                             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                               <span className="text-4xl">😎</span>
                             </div>
                             <span className="font-medium">Rasm yuklash</span>
                           </div>
                         )}
                         
                         {/* Glass Overlay on Hover */}
                         <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">O'zgartirish</span>
                         </div>
                       </label>
                    </div>

                    {/* Floating Elements */}
                    <div 
                      onClick={() => setIsScoreModalOpen(true)}
                      className="absolute -right-6 bottom-12 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform animate-float"
                    >
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <Target size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target</p>
                          <p className="text-2xl font-black text-slate-900">{isMounted ? targetScore : "..."}</p>
                       </div>
                    </div>

                    <div className="absolute -left-6 top-12 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white flex items-center gap-2 animate-float animation-delay-2000">
                       <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <Zap size={16} fill="currentColor" />
                       </div>
                       <p className="text-sm font-bold text-slate-700">AI Powered</p>
                    </div>

                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES SECTION - ENG ZAMONAVIY QISM */}
        <section className="py-24 px-4 bg-white relative">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Hammasi bitta platformada.</h2>
               <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tarqoq resurslardan charchadingizmi? IELTS Master sizga tizimli va aqlli yondashuvni taqdim etadi.</p>
            </div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              
              {/* Card 1: Large Speaking (Span 2 cols) */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-200 transition-colors"></div>
                 
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                       <Mic size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Speaking Simulator</h3>
                    <p className="text-slate-500 max-w-md">Xuddi examiner bilan gaplashgandek mashq qiling. AI sizning talaffuzingiz, grammatikangiz va lug'at boyligingizni real vaqtda tekshiradi.</p>
                 </div>

                 <Link href="/speaking-selection">
                         <div className="relative z-10 mt-6 flex items-center gap-2 text-indigo-600 font-semibold cursor-pointer group-hover:translate-x-2 transition-transform">
                    Boshlash <ArrowRight size={20} />
                 </div>
                 </Link>
               
                 {/* Visualizer bars animation */}
                 <div className="absolute bottom-8 right-8 flex items-end gap-1 h-20 opacity-50">
                    {[40, 70, 30, 80, 50, 90, 40, 60].map((h, i) => (
                       <div key={i} className="w-2 bg-indigo-500 rounded-full animate-music-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                 </div>
              </div>

              {/* Card 2: Writing (Tall) */}
              <div className="md:row-span-2 group relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-500">
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>

                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-white/10">
                       <PenTool size={28} />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Writing AI</h3>
                    <p className="text-slate-400">Essay yozing va 3 soniyada to'liq tekshiruvga ega bo'ling. 9.0 bandlik so'zlar taklifi.</p>
                 </div>

                 <div className="relative z-10 mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
                    <div className="flex justify-between text-sm mb-2 text-slate-400">
                       <span>Grammar</span>
                       <span className="text-emerald-400">9.0</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full w-[95%]"></div>
                    </div>
                    <div className="flex justify-between text-sm mt-3 mb-2 text-slate-400">
                       <span>Coherence</span>
                       <span className="text-emerald-400">8.5</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full w-[85%]"></div>
                    </div>
                 </div>
              </div>

              {/* Card 3: Reading */}
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-amber-50 border border-amber-100 p-8 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-amber-600">
                    <BookOpen size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Reading</h3>
                 <p className="text-slate-500 text-sm">Matndagi kalit so'zlarni avtomatik topish va savollar tahlili.</p>
              </div>

              {/* Card 4: Listening */}
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-rose-50 border border-rose-100 p-8 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-rose-600">
                    <Volume2 size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Real Listening</h3>
                 <p className="text-slate-500 text-sm">Turli aksentlar va shovqinli muhitlar simulyatsiyasi.</p>
              </div>

            </div>
          </div>
        </section>

        {/* MODAL (Modernized) */}
        {isScoreModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg transition-opacity"
              onClick={() => setIsScoreModalOpen(false)}
            ></div>
            
            <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl animate-zoom-in">
               <button onClick={() => setIsScoreModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                 <X size={18} className="text-slate-500"/>
               </button>

               <div className="text-center mt-4 mb-8">
                  <div className="inline-block p-3 bg-indigo-50 rounded-2xl mb-4">
                    <Trophy size={32} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Maqsadingiz qanday?</h3>
                  <p className="text-slate-500 text-sm mt-1">Sizga mos o'quv dasturini tuzamiz.</p>
               </div>

               <div className="grid grid-cols-3 gap-3">
                  {SCORES.map(score => (
                    <button
                      key={score}
                      onClick={() => handleScoreSelect(score)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 ${targetScore === score ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {score}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

      </main>
      {/* <Footer /> */}
      
      {/* GLOBAL STYLES & ANIMATIONS */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 4s linear infinite;
        }
        
        @keyframes float {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }

        @keyframes music-bar {
           0%, 100% { height: 30%; }
           50% { height: 100%; }
        }
        .animate-music-bar {
           animation: music-bar 1s ease-in-out infinite;
        }

        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  )
}