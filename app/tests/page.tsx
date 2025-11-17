"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Mic, PenTool, BookOpen, Volume2, Clock, BarChart3 } from "lucide-react"

export default function TestsPage() {
  const tests = [
    {
      title: "Speaking Test",
      icon: Mic,
      duration: "11-14 minutes",
      difficulty: "All Levels",
      description:
        "Practice your speaking skills with AI-powered evaluation covering fluency, pronunciation, and coherence.",
      href: "/speaking-selection", // O'zgartirildi: To'g'ridan-to'g'ri /speaking ga emas, balki tanlov sahifasiga
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Writing Test",
      icon: PenTool,
      duration: "60 minutes",
      difficulty: "All Levels",
      description: "Write essays with real-time grammar checking and receive instant feedback on band scores.",
      href: "/writing-selection", // O'zgartirildi: Tanlov sahifasiga
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Reading Test",
      icon: BookOpen,
      duration: "60 minutes",
      difficulty: "All Levels",
      description: "Complete passages with multiple choice and short answer questions with instant scoring.",
      href: "/reading-selection", // O'zgartirildi: Tanlov sahifasiga
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Listening Test",
      icon: Volume2,
      duration: "30 minutes",
      difficulty: "All Levels",
      description: "Listen to audio recordings and answer comprehension questions with detailed result analysis.",
      href: "/listening-selection", // O'zgartirildi: Tanlov sahifasiga
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Available Tests</h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Choose a test module to practice and improve your IELTS skills with real-time feedback.
            </p>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {tests.map((test) => (
              <div
                key={test.title}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 overflow-hidden transition-all hover:shadow-xl"
              >
                <div className={`h-2 bg-gradient-to-r ${test.color}`} />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                      <test.icon size={24} className="text-slate-900" />
                    </div>
                    <BarChart3 size={20} className="text-slate-400" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{test.title}</h3>

                  <div className="flex gap-4 mb-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} />
                      {test.duration}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">Level: {test.difficulty}</div>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">{test.description}</p>

                  <Link href={test.href}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg">
                      Start Test
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Test-Taking Tips</h3>
            <ul className="space-y-3 text-sm sm:text-base text-slate-700">
              <li>✓ Take practice tests regularly to build confidence and familiarity with the format.</li>
              <li>✓ Read all instructions carefully before starting each section.</li>
              <li>✓ Manage your time effectively—don't spend too long on difficult questions.</li>
              <li>✓ Review your answers before submitting when possible.</li>
              <li>✓ Use the detailed feedback to identify areas for improvement.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}