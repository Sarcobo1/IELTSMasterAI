// app/writing/page.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { PenTool, Clock, FileText, Edit, TrendingUp } from "lucide-react"

export default function WritingSelectionPage() {
  const writingTests = [
    {
      id: "task-1",
      title: "Task 1",
      subtitle: "Describing a Chart",
      level: "Beginner",
      duration: 20,
      description: "Grafik, jadval yoki diagrammani tahlil qiling va asosiy ma'lumotlarni tasvirlab yozing.",
      wordCount: 150,
      icon: "📊",
      color: "from-blue-500 to-cyan-500",
      skills: ["Data interpretation", "Comparative language", "Describing trends"]
    },
    {
      id: "task-2",
      title: "Task 2",
      subtitle: "Opinion Essay",
      level: "Intermediate",
      duration: 40,
      description: "Berilgan mavzu bo'yicha o'z fikringizni bildiring va dalillar bilan asoslang.",
      wordCount: 250,
      icon: "💭",
      color: "from-purple-500 to-pink-500",
      skills: ["Argumentation", "Critical thinking", "Persuasive writing"]
    },
    {
      id: "task-3",
      title: "Task 3",
      subtitle: "Advanced Discussion",
      level: "Advanced",
      duration: 50,
      description: "Murakkab mavzuda har tomonlama tahlil va chuqur muhokama yozing.",
      wordCount: 300,
      icon: "🎯",
      color: "from-orange-500 to-red-500",
      skills: ["Complex analysis", "Academic writing", "Sophisticated vocabulary"]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <main className="flex-grow py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✍️ IELTS Writing Practice
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Writing Tests
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              AI yordamida insho yozing va real vaqtda grammatika, lug'at va uslub bo'yicha batafsil baholash oling.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-xs text-slate-600 mt-1">Test Levels</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-green-600">AI</div>
              <div className="text-xs text-slate-600 mt-1">Powered</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-purple-600">9.0</div>
              <div className="text-xs text-slate-600 mt-1">Band Score</div>
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {writingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 group"
              >
                {/* Gradient Header */}
                <div className={`h-3 bg-gradient-to-r ${test.color}`} />

                <div className="p-6">
                  {/* Icon & Level Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{test.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      test.level === "Beginner" ? "bg-green-100 text-green-700" :
                      test.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {test.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{test.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{test.subtitle}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-blue-500" />
                      <span className="font-medium">{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText size={16} className="text-purple-500" />
                      <span className="font-medium">Min. {test.wordCount} words</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {test.description}
                  </p>

                  {/* Skills Tags */}
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

                  {/* Start Button */}
                  <Link href={`/writing/${test.id}`}>
                    <Button className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white py-3 text-base rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg group-hover:shadow-xl transition-all`}>
                      <Edit size={18} />
                      Start Writing
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16 bg-white rounded-2xl border-2 border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              🚀 Why Practice Here?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-semibold text-slate-900 mb-2">Timed Practice</h3>
                <p className="text-sm text-slate-600">Real exam conditions with countdown timer</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-semibold text-slate-900 mb-2">AI Feedback</h3>
                <p className="text-sm text-slate-600">Instant grammar and vocabulary analysis</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-slate-900 mb-2">Band Scores</h3>
                <p className="text-sm text-slate-600">Get estimated IELTS band scores (1-9)</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <TrendingUp size={20} />
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Task 1:</strong> Focus on key trends and comparisons, not every detail</li>
              <li>• <strong>Task 2:</strong> Present clear arguments with supporting examples</li>
              <li>• <strong>Task 3:</strong> Show critical thinking and sophisticated language</li>
              <li>• Always plan your essay structure before writing</li>
              <li>• Save 2-3 minutes at the end to proofread</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}