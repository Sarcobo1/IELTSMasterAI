"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { ArrowRight, Mic, BookOpen, PenTool, Volume2, Globe } from "lucide-react"
import Typed from "typed.js"

const PROFILE_IMAGE_KEY = 'ielts_profile_image';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const typedRef = useRef<HTMLSpanElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  // Typed.js
  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: ["Prepare Smarter.", "Speak Better.", "Score Higher."],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      showCursor: false
    });
    return () => typed.destroy();
  }, []);

  // Parallax – butun feature box (karta) uchun
  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current) return;
      const boxes = featuresRef.current.querySelectorAll('.feature-box');
      const scrollY = window.scrollY + window.innerHeight;

      boxes.forEach((box, index) => {
        const rect = box.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distanceFromCenter = (window.innerHeight / 2 - centerY) / 10;
        const speedVariation = -0.1 - (index * 0.02); // Har biriga biroz farq
        const offset = distanceFromCenter * (1 + speedVariation);
        (box as HTMLElement).style.transform = `translateY(${Math.max(-30, Math.min(30, offset))}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // localStorage dan rasm o‘qish
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(PROFILE_IMAGE_KEY);
      if (saved) setUploadedImage(saved);
    } catch (e) {
      console.error(e);
    }
    setIsMounted(true);
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

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

              {/* Left Content */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight text-balance">
                  <span ref={typedRef}></span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
                  Your Personal AI Tutor for IELTS – Speaking, Writing, Reading & Pronunciation.
                </p>

                {/* CTA Buttons – glow olib tashlandi */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <Link href="/grammar-tutor">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg w-full sm:w-auto">
                      Start Your AI Tutor
                      <ArrowRight className="ml-2" size={14} />
                    </Button>
                  </Link>
                  <Link href="/tests">
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg w-full sm:w-auto bg-transparent"
                    >
                      Try Free Test
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center">
                <div className="w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-shadow relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                    {isMounted && uploadedImage ? (
                      <img src={uploadedImage} alt="Uploaded Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 sm:w-24 h-20 sm:h-24 bg-cyan-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl">
                          Student
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600">Click to upload photo</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Powered by AI, Designed For You
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Explore the core features that make IELTS MasterAI the smartest way to prepare.
              </p>
            </div>

            <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {[
                { icon: Mic,        title: "AI Speaking Feedback",          desc: "Receive instant, detailed feedback on fluency, coherence, and lexical resource to improve your speaking skills." },
                { icon: PenTool,    title: "Writing Band Scoring & Correction", desc: "Get AI-driven band scores and precise grammatical corrections to understand your writing performance." },
                { icon: Globe,      title: "Pronunciation Analyzer",       desc: "Focus on word-level pronunciation analysis and get actionable tips to sound clearer and more confident." },
                { icon: BookOpen,   title: "Smart Reading Practice",       desc: "Engage with adaptive reading exercises that target specific skills and IELTS question types." },
                { icon: Volume2,    title: "Grammar & IELTS Tips",         desc: "Access a curated library of key grammar rules and essential exam strategies to boost your score." },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-box relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 text-center overflow-hidden
                             transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                  {/* Neon halo – faqat tashqarida, box ichiga ta'sir qilmaydi */}
                  <div className="absolute -inset-2 rounded-2xl bg-black opacity-0 blur-2xl hover:opacity-50 transition-opacity pointer-events-none" />

                  <div className="flex justify-center mb-3 sm:mb-4 relative z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <feature.icon size={28} className="text-red-600" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-2 text-sm sm:text-base relative z-10">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed relative z-10">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}