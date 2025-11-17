"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { BookOpen, Clock, BarChart3, Eye } from "lucide-react"

export default function ReadingSelectionPage() {
  const readingTests = [
    {
      id: "passage-1",
      title: "Basic Reading Comprehension",
      level: "Beginner",
      duration: "20 minutes",
      description: "Qisqa matnni o'qib, savollarga javob bering.",
      questionsCount: 10,
    },
    {
      id: "passage-2",
      title: "Intermediate Academic Reading",
      level: "Intermediate",
      duration: "30 minutes",
      description: "Ilmiy matnlar va multiple choice savollar.",
      questionsCount: 15,
    },
    {
      id: "passage-3",
      title: "Advanced True/False Reading",
      level: "Advanced",
      duration: "40 minutes",
      description: "Murakkab matnlar va not true/false savollar.",
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Reading Tests</h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Matnlarni o'qib, tushunish ko'nikmalaringizni sinab ko'ring.
            </p>
          </div>

          {/* Tests List */}
          <div className="space-y-6">
            {readingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-green-400 overflow-hidden transition-all hover:shadow-xl"
              >
                <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                      <BookOpen size={24} className="text-slate-900" />
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

                  <Link href={`/reading/${test.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg flex items-center gap-2">
                      <Eye size={16} />
                      O'qishni Boshlash
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