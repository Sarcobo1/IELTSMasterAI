"use client"



import Link from "next/link"
// import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Clock, Upload, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import readingDataRaw from "../reading_data/all_reading_data.json"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

// TypeScript types for JSON structure
type ReadingTest = {
  test_id: string;
  test_title: string;
  total_questions: number;
  description?: string;
  parts?: any[];
};

type ReadingLevel = {
  level_id: string;
  level_name: string;
  tests: ReadingTest[];
};


export default function ReadingSelectionPage() {
  // JSONdan testlarni olish
  const [levels, setLevels] = useState<ReadingLevel[]>([])
  const { user, isAuthenticated, isLoading } = useAuth()
  const [planId, setPlanId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setLevels(readingDataRaw.levels as ReadingLevel[] || [])
  }, [])

  // Premium holatini localStorage'dan o'qish (xuddi premium sahifasidagi kabi)
  useEffect(() => {
    if (!user?.email) return
    try {
      const stored = localStorage.getItem("premiumUsers")
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, { planId: string; expiresAt: string }>
        const entry = parsed[user.email]
        if (entry) setPlanId(entry.planId)
      }
    } catch (e) {
      console.error("premiumUsers parse error", e)
    }
  }, [user?.email])

  const hasPremium = !!planId && planId !== "free"
  const lockedLevel = (levelId: string) => levelId !== "BASIC" && !hasPremium

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📚 IELTS Reading Practice
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Reading Tests</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Matnlarni o‘qish va tushunish bo‘yicha real IELTS darajasidagi mashqlarni bajaring.
            </p>
          </div>

          {/* PDF yuklash (Custom Test) CTA */}
          <div className="mb-12">
            <div className="bg-white border border-dashed border-green-300 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">PDF’dan avtomatik reading testi</h3>
                  <p className="text-slate-600">
                    O‘z PDF faylingizni yuklang, savollar va passage avtomatik ajratiladi.
                  </p>
                </div>
              </div>
              <Link href="/custom-test">
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold shadow">
                  PDF yuklash
                </Button>
              </Link>
            </div>
          </div>

          {/* Levels and Tests */}
          {levels.length === 0 ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : (
            levels.map((level) => (
              <div key={level.level_id} className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{level.level_name}</h2>
                <div className="max-h-[600px] overflow-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {level.tests.map((test) => (
                      <div
                        key={test.test_id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-green-400 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 group"
                      >
                        <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-5xl">📘</div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                              {level.level_name}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900">{test.test_title}</h3>
                          <p className="text-sm text-slate-500 mb-4">{test.test_id}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock size={16} className="text-green-600" />
                              <span>{test.total_questions} questions</span>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            {/* description yo'q bo'lsa test_title ko'rsatiladi */}
                            {test.description || test.test_title}
                          </p>
                          <Button
                            className={`w-full py-3 text-base rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
                              lockedLevel(level.level_id)
                                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                : "bg-gradient-to-r from-green-500 to-teal-500 text-white group-hover:shadow-lg"
                            }`}
                            onClick={() => {
                              if (lockedLevel(level.level_id)) {
                                router.push("/premium")
                                return
                              }
                              router.push(`/reading/${test.test_id}`)
                            }}
                            disabled={isLoading}
                          >
                            {lockedLevel(level.level_id) ? (
                              <>
                                <Lock size={16} /> Premium kerak
                              </>
                            ) : (
                              "Start Reading"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  )
}
