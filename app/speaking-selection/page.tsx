// app/speaking/page.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Mic, Clock, BarChart3, Mic2 } from "lucide-react"

export default function SpeakingSelectionPage() {
  const speakingTests = [
    {
      id: "part-1",
      title: "Part 1: Introduction and Interview",
      level: "Beginner",
      duration: "4-5 minutes",
      description: "O'zingiz haqingizda oddiy savollarga javob bering.",
      questionsCount: 5,
    },
    {
      id: "part-2",
      title: "Part 2: Long Turn",
      level: "Intermediate",
      duration: "3-4 minutes",
      description: "Berilgan mavzuda 1-2 daqiqa gapiring.",
      questionsCount: 1,
    },
    {
      id: "part-3",
      title: "Part 3: Discussion",
      level: "Advanced",
      duration: "4-5 minutes",
      description: "Murakkab mavzularda muhokama qiling.",
      questionsCount: 4,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Speaking Tests</h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Nutqingizni AI orqali baholang va yaxshilang.
            </p>
          </div>

          <div className="space-y-6">
            {speakingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-400 overflow-hidden transition-all hover:shadow-xl"
              >
                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Mic size={24} className="text-slate-900" />
                    </div>
                    <BarChart3 size={20} className="text-slate-400" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{test.title}</h3>

                  <div className="flex gap-4 mb-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} />
                      {test.duration}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">Level: {test.level}</div>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">{test.description}</p>
                  <p className="text-slate-500 text-sm mb-6">Savollar soni: {test.questionsCount}</p>

                  <Link href={`/speaking/${test.id}`}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg flex items-center gap-2">
                      <Mic2 size={16} />
                      Gapirishni Boshlash
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