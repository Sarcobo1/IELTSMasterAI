"use client"

import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, FileText, BarChart3 } from "lucide-react"

export default function ReadingSelectionPage() {
  const readingTests = [
    {
      id: "passage-1",
      title: "Basic Reading",
      subtitle: "Simple Comprehension",
      level: "Beginner",
      duration: 20,
      description: "Qisqa matnni o‘qib, asosiy ma’lumotlarni tushunish va savollarga javob berish.",
      questionsCount: 10,
      icon: "📘",
      color: "from-green-500 to-teal-500",
      skills: ["Main ideas", "Simple vocabulary", "Basic comprehension"]
    },
    {
      id: "passage-2",
      title: "Academic Reading",
      subtitle: "Multiple Choice",
      level: "Intermediate",
      duration: 30,
      description: "O‘rta murakkablikdagi ilmiy matnlar asosida savollarga javob bering.",
      questionsCount: 15,
      icon: "📗",
      color: "from-blue-500 to-cyan-500",
      skills: ["Inference", "Details", "Academic vocabulary"]
    },
    {
      id: "passage-3",
      title: "Advanced Reading",
      subtitle: "True / False / Not Given",
      level: "Advanced",
      duration: 40,
      description: "Murakkab matnlar va chuqur tahliliy savollar orqali bilimlaringizni sinang.",
      questionsCount: 20,
      icon: "📕",
      color: "from-purple-500 to-pink-500",
      skills: ["Critical reading", "Understanding logic", "Advanced vocabulary"]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📚 IELTS Reading Practice
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Reading Tests
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Matnlarni o‘qish va tushunish bo‘yicha real IELTS darajasidagi mashqlarni bajaring.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {readingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-green-400 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 group"
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${test.color}`} />

                <div className="p-6">
                  {/* Icon + Level */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{test.icon}</div>

                    <span className={`
                      px-3 py-1 text-xs font-bold rounded-full
                      ${test.level === "Beginner" ? "bg-green-100 text-green-700" :
                        test.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"}
                    `}>
                      {test.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900">{test.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{test.subtitle}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-green-600" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText size={16} className="text-blue-600" />
                      <span>{test.questionsCount} questions</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {test.description}
                  </p>

                  {/* Skills */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Skills you'll practice:</p>
                    <div className="flex flex-wrap gap-2">
                      {test.skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <Link href={`/reading/${test.id}`}>
                    <Button
                      className={`w-full bg-gradient-to-r ${test.color} text-white py-3 text-base rounded-xl font-semibold shadow-md group-hover:shadow-lg transition-all`}
                    >
                      Start Reading
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
