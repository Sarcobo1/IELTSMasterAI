"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Volume2, Clock, BarChart3, Play } from "lucide-react"

export default function ListeningSelectionPage() {
  const listeningTests = [
    {
      id: "test-1",
      title: "Basic Listening Practice",
      level: "Beginner",
      duration: "20 minutes",
      description: "Oddiy audio tinglash va savollarga javob berish.",
      questionsCount: 10,
    },
    {
      id: "test-2",
      title: "Intermediate Listening",
      level: "Intermediate",
      duration: "30 minutes",
      description: "O'rta darajadagi suhbatlar va leksika.",
      questionsCount: 15,
    },
    {
      id: "test-3",
      title: "Advanced Listening Challenge",
      level: "Advanced",
      duration: "40 minutes",
      description: "Murakkab mavzular va tez nutq.",
      questionsCount: 20,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Listening Tests</h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Tanlangan testni boshlang va tinglash ko'nikmalaringizni rivojlantiring.
            </p>
          </div>

          {/* Tests List */}
          <div className="space-y-6">
            {listeningTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-400 overflow-hidden transition-all hover:shadow-xl"
              >
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Volume2 size={24} className="text-slate-900" />
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

                  <Link href={`/listening/${test.id}`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg flex items-center gap-2">
                      <Play size={16} />
                      Boshlash
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