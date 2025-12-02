"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { ArrowRight, Mic, BookOpen, PenTool, Volume2, Globe, Sparkles, Zap, CheckCircle2, Target, X, ChevronRight } from "lucide-react"
import Typed from "typed.js"

const PROFILE_IMAGE_KEY = 'ielts_profile_image';
const TARGET_SCORE_KEY = 'ielts_target_score';

const SCORES = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Target Score states
  const [targetScore, setTargetScore] = useState<string>("7.0");
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const typedRef = useRef<HTMLSpanElement | null>(null);

  // Typed.js initialization
  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: ["Prepare Smarter.", "Speak Better.", "Score Higher."],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });
    return () => typed.destroy();
  }, []);

  // Load saved data (Image & Score)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;
    try {
      // Load Image
      const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImage) setUploadedImage(savedImage);

      // Load Score
      const savedScore = localStorage.getItem(TARGET_SCORE_KEY);
      if (savedScore) setTargetScore(savedScore);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Handle image upload
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

  // Handle Score Selection
  const handleScoreSelect = (score: string) => {
    setTargetScore(score);
    localStorage.setItem(TARGET_SCORE_KEY, score);
    setIsScoreModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navigation />

      <main className="flex-grow relative">
        
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] md:min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-8 overflow-hidden">
          
          {/* Light Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-white to-white"></div>
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

          {/* Floating Blobs */}
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
          <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left Content */}
              <div className="space-y-6 md:space-y-8 order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 w-fit shadow-sm">
                  <Sparkles size={14} className="text-blue-600" />
                  <span className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide uppercase">AI-Powered IELTS Tutor</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                  IELTS Master <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600">
                    <span ref={typedRef}></span>
                  </span>
                </h1>

                <p className="text-slate-600 max-w-lg text-lg sm:text-xl leading-relaxed">
                  Sun'iy intellekt yordamida IELTS balingizni oshiring. O'z maqsadingizni belgilang va unga erishing.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/grammar-tutor" className="w-full sm:w-auto">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                      Boshlash <ArrowRight size={18} />
                    </Button>
                  </Link>
                  <Link href="/tests" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full h-12 border-2 border-slate-200 text-slate-700 font-semibold text-base px-8 rounded-xl hover:bg-slate-50 transition-all">
                      Bepul Test
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Content - Profile Image & Target Score */}
              <div className="flex justify-center order-1 md:order-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-2xl -z-10"></div>
                
                <div className="relative group">
                  {/* Main Image Card */}
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 flex items-center justify-center overflow-hidden border-[6px] border-white cursor-pointer transition-all duration-300 group-hover:shadow-blue-900/20 group-hover:-translate-y-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                      {isMounted && uploadedImage ? (
                        <div className="relative w-full h-full">
                           <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover"/>
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">O'zgartirish</span>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600">
                            <span className="text-3xl">📷</span>
                          </div>
                          <p className="text-base font-bold text-slate-800">Rasmingizni Yuklang</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {/* EDITABLE TARGET SCORE BADGE */}
                  <div 
                    onClick={() => setIsScoreModalOpen(true)}
                    className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform border border-slate-100 z-20"
                  >
                     <div className="bg-emerald-100 p-2.5 rounded-full">
                        <Target size={24} className="text-emerald-600" />
                     </div>
                     <div className="pr-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Target Score</p>
                        <div className="flex items-center gap-1">
                          <p className="text-2xl font-black text-slate-900 leading-none">
                            {isMounted ? targetScore : "..."}
                          </p>
                          <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Band</span>
                        </div>
                     </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section - RESTORED CONTENT */}
        <section className="relative py-20 px-4 bg-slate-50/50 border-t border-slate-100">
          
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                <Zap size={14} className="text-indigo-600" />
                <span className="text-indigo-700 font-semibold text-xs uppercase tracking-wide">AI Features</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Nega aynan IELTS Master?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Eng so'nggi sun'iy intellekt texnologiyalari va tasdiqlangan o'qitish metodikasi.
              </p>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
              {[
                { icon: "🎯", label: "Aniqlik", value: "99%", bg: "bg-blue-50", border: "border-blue-100" },
                { icon: "⚡", label: "Tezlik", value: "<2s", bg: "bg-amber-50", border: "border-amber-100" },
                { icon: "🤖", label: "AI Model", value: "GPT-4", bg: "bg-violet-50", border: "border-violet-100" },
                { icon: "📈", label: "O'sish", value: "2x", bg: "bg-emerald-50", border: "border-emerald-100" }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`p-6 rounded-2xl bg-white border ${stat.border} shadow-sm text-center hover:shadow-md transition-shadow duration-300`}
                >
                  <div className={`w-12 h-12 mx-auto ${stat.bg} rounded-full flex items-center justify-center text-2xl mb-3`}>{stat.icon}</div>
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{stat.label}</p>
                  <p className="text-slate-900 text-xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: Mic, title: "Speaking", desc: "Talaffuz va ravonlik tahlili.", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: PenTool, title: "Writing", desc: "Insholarni tekshirish va baholash.", color: "text-purple-600", bg: "bg-purple-50" },
                { icon: Globe, title: "Pronunciation", desc: "So'zma-so'z talaffuz mashqi.", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: BookOpen, title: "Reading", desc: "Moslashuvchan reading testlar.", color: "text-amber-600", bg: "bg-amber-50" },
                { icon: Volume2, title: "Listening", desc: "Real imtihon muhiti va audio.", color: "text-rose-600", bg: "bg-rose-50" },
              ].map((feature, i) => (
                <div key={i} className="group relative">
                  <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center">
                    
                    {/* Icon Bubble */}
                    <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon size={28} className={feature.color} />
                    </div>

                    <h3 className="text-slate-900 font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* --- MODAL: TARGET SCORE SELECTOR --- */}
        {isScoreModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
              onClick={() => setIsScoreModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setIsScoreModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target size={28} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Maqsadni belgilang</h3>
                <p className="text-sm text-slate-500 mt-1">Qaysi IELTS balini qo'lga kiritmoqchisiz?</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {SCORES.map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreSelect(score)}
                    className={`
                      py-3 rounded-xl text-lg font-bold border-2 transition-all duration-200
                      ${targetScore === score 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm scale-105' 
                        : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Hozirgi maqsad</p>
                <p className="text-2xl font-black text-emerald-600">Band {targetScore}</p>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
      
      {/* Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}