"use client"

import Link from "next/link"
// import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Mic, Users } from "lucide-react"

export default function SpeakingSelectionPage() {
  const speakingTests = [
    {
      id: "part-1",
      title: "Part 1",
      subtitle: "Introduction & Interview",
      level: "Beginner",
      duration: 1,
      description: "Oddiy savollar, o‘zingiz haqingizda gapirish va intervyu shaklidagi muloqot.",
      icon: "💬",
      color: "from-blue-500 to-cyan-500",
      skills: ["Fluency", "Simple answers", "Personal topics"]
    },
    {
      id: "part-2",
      title: "Part 2",
      subtitle: "Cue Card",
      level: "Intermediate",
      duration: "1.30",
      description: "Berilgan mavzu bo‘yicha 1-2 daqiqa davomida uzluksiz gapiring.",
      icon: "🎤",
      color: "from-purple-500 to-pink-500",
      skills: ["Long turn", "Organized speech", "Topic development"]
    },
    {
      id: "part-3",
      title: "Part 3",
      subtitle: "Discussion",
      level: "Advanced",
      duration: 2,
      description: "Murakkab mavzular bo‘yicha chuqur tahliliy savollarga javob bering.",
      icon: "🧠",
      color: "from-orange-500 to-red-500",
      skills: ["Critical thinking", "Abstract ideas", "Advanced vocabulary"]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* <Navigation /> */}

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🎙️ IELTS Speaking Practice
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Speaking Tests
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              AI yordamida real IELTS bo‘yicha Part 1, Part 2 va Part 3 savollariga javob bering.
            </p>
          </div>

          {/* Speaking Cards (same as writing style) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {speakingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 group"
              >
                {/* Gradient header */}
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
                      <Clock size={16} className="text-blue-500" />
                      <span>{test.duration} minutes</span>
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
                  <Link href={`/speaking/${test.id}`}>
                    <Button
                      className={`w-full bg-gradient-to-r ${test.color} text-white py-3 text-base rounded-xl font-semibold shadow-md group-hover:shadow-lg transition-all`}
                    >
                      Start Speaking
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
