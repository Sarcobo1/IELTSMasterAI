// app/writing/[testId]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { RefreshCw, MessageSquare, BookOpen, Layers, Zap, HelpCircle } from "lucide-react"

// =========================================================
// QUESTIONS FETCHING
// =========================================================
async function fetchQuestionsForTest(testId: string): Promise<string[]> {
  const res = await fetch(`/api/groq-question?part=${testId}&count=10`)
  if (!res.ok) {
    throw new Error("Failed to fetch questions")
  }
  const data = await res.json()
  return data.questions
}

function getTestTitle(testId: string): string {
  switch (testId) {
    case "task-1":
      return "Task 1: Describing a Chart"
    case "task-2":
      return "Task 2: Opinion Essay"
    case "task-3":
      return "Task 3: Advanced Discussion Essay"
    default:
      return "Writing Practice"
  }
}

export default function WritingTaskPage() {
  const params = useParams()
  const testId = params.testId as string
  const testTitle = getTestTitle(testId)

  const [questions, setQuestions] = useState<string[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [essay, setEssay] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("Overall")
  const [scores, setScores] = useState({ overall: 0, grammar: 0, vocabulary: 0, cohesion: 0 })
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [logicResult, setLogicResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [attempts, setAttempts] = useState<Array<any>>([]) // store past attempts: {question, answer, scores, errors}

  // Fetch questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const fetchedQuestions = await fetchQuestionsForTest(testId)
        setQuestions(fetchedQuestions)
      } catch (error) {
        console.error("Error fetching questions:", error)
        alert("Savollarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.")
      } finally {
        setLoadingQuestions(false)
      }
    }
    loadQuestions()
  }, [testId])

  // =========================================================
  // LOCAL STORAGE FOR ATTEMPTS (OPTIONAL)
  // =========================================================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`writing:${testId}:attempts`)
      if (raw) setAttempts(JSON.parse(raw))
    } catch (e) {
      console.error("Failed to load attempts from localStorage", e)
    }
  }, [testId])

  useEffect(() => {
    try {
      localStorage.setItem(`writing:${testId}:attempts`, JSON.stringify(attempts.slice(0, 50)))
    } catch (e) {
      console.error("Failed to save attempts to localStorage", e)
    }
  }, [attempts, testId])

  // =========================================================
  // LOGIC ANALYSIS (WORD COUNT, ETC.)
  // =========================================================
  function analyzeLogic(text: string) {
    const lower = text.toLowerCase()
    const sentences = text.split(/[.!?]\s/).filter(Boolean)
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    const avgSentenceLen = sentences.length ? wordCount / sentences.length : 0

    const tokens = lower.split(/\s+/).filter(Boolean)
    const freq: Record<string, number> = {}
    tokens.forEach((t) => (freq[t] = (freq[t] || 0) + 1))
    const repeated = Object.entries(freq).filter(
      ([w, c]) => c > Math.max(3, Math.floor(wordCount / 20))
    )

    const uniqueWordCount = Object.keys(freq).length
    const typeTokenRatio = wordCount > 0 ? uniqueWordCount / wordCount : 0

    const commonFunctionWords = new Set([
      "the","a","an","and","or","but","for","nor","so","yet","at",
      "by","in","of","on","to","with","is","was","are","were",
      "be","been","am","have","has","had","do","does","did","i","you",
      "he","she","it","we","they","my","your","his","her","its",
      "our","their","me","him","us","them","this","that","these","those"
    ])

    const contentWordCount = tokens.filter((token) => !commonFunctionWords.has(token)).length
    const lexicalDensity = wordCount > 0 ? contentWordCount / wordCount : 0

    const issues: string[] = []
    if (wordCount < 150) issues.push("Very short essay — aim for at least 150-250 words depending on the task.")
    if (avgSentenceLen < 6 && sentences.length > 1) issues.push("Short fragmented sentences — try to connect ideas more smoothly.")
    if (repeated.length > 0) issues.push(`Repeating words detected: ${repeated.slice(0,3).map((r) => r[0]).join(", ")}`)

    return {
      wordCount,
      sentences: sentences.length,
      avgSentenceLen: Number(avgSentenceLen.toFixed(1)),
      repeatedWords: repeated.map((r) => ({ word: r[0], count: r[1] })),
      issues,
      uniqueWordCount,
      typeTokenRatio: Number(typeTokenRatio.toFixed(3)),
      lexicalDensity: Number(lexicalDensity.toFixed(3)),
      contentWordCount,
    }
  }

  // =========================================================
  // HANDLE CHECK + SCORING
  // =========================================================
  const handleCheck = async () => {
    const text = essay.trim()

    if (!text) {
      alert("Please write something first.")
      return
    }

    setChecking(true)
    setGrammarResult(null)
    setLogicResult(null)

    try {
      const question = questions[currentQuestionIndex]
      const groqRes = await fetch("/api/groq-writing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: text, question }),
      })

      if (!groqRes.ok) {
        const txt = await groqRes.text()
        throw new Error("Groq scoring error: " + txt)
      }

      const groqResult = await groqRes.json()

      // Adapt grammar errors
      const adaptedMatches = (groqResult.grammarErrors || []).map((e: any) => ({
        message: e.explanation,
        replacements: [e.correction],
        context: e.error,
      }))

      setGrammarResult({ matches: adaptedMatches })

      const logic = analyzeLogic(text)
      setLogicResult(logic)

      // Use Groq scores, map to UI
      const overall = (groqResult.scores.task_response + groqResult.scores.coherence + groqResult.scores.vocabulary + groqResult.scores.grammar) / 4
      setScores({
        overall: Number(overall.toFixed(1)),
        grammar: Number(groqResult.scores.grammar.toFixed(1)),
        vocabulary: Number(groqResult.scores.vocabulary.toFixed(1)),
        cohesion: Number(groqResult.scores.coherence.toFixed(1)),
      })

      const attempt = {
        question,
        answer: text,
        scores: groqResult.scores,
        errors: adaptedMatches,
        wordCount: logic.wordCount,
        at: new Date().toISOString(),
        feedback: groqResult.feedback.overall,
      }
      setAttempts((prev) => [attempt, ...prev])

      setSubmitted(true)
      setEssay("")
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
    } catch (e: any) {
      console.error(e)
      alert("Error checking with Groq AI: " + (e.message || e))
    } finally {
      setChecking(false)
    }
  }

  const getSuggestions = () => {
    if (!logicResult) return []
    return logicResult.issues
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Navigation />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-slate-900 text-xl">Savollarni yuklab olinmoqda...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Navigation />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-slate-900 text-xl">Savollar topilmadi. Iltimos, qayta urinib ko'ring.</p>
        </main>
        <Footer />
      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">{testTitle}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Essay Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                <label className="block mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-base sm:text-lg mb-2 block">Essay Prompt</span>
                    <span className="text-xs text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{questions[currentQuestionIndex]}</p>
                </label>

                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Write your essay here..."
                  className="w-full min-h-72 p-4 border-2 border-slate-200 rounded-lg focus:border-blue-400 outline-none text-sm sm:text-base resize-none"
                />

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs sm:text-sm text-slate-600">
                    Word Count: {essay.split(/\s+/).filter((w) => w).length}
                  </span>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setEssay("")
                        setSubmitted(false)
                      }}
                      variant="outline"
                      className="text-xs sm:text-sm"
                    >
                      <RefreshCw size={16} className="mr-2" /> Clear
                    </Button>
                    <Button
                      onClick={handleCheck}
                      disabled={checking}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                    >
                      {checking ? "Checking..." : "Get Feedback"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feedback Section */}
            {submitted && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6 h-fit">
                <h3 className="font-bold text-slate-900 mb-4 sm:mb-6 text-base sm:text-lg">AI Feedback</h3>
                <h6>Estimate Score not exactly</h6>

                {/* Score Card */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 sm:p-6 mb-6 text-center">
                  <p className="text-xs sm:text-sm text-slate-600 mb-2">Overall Band Score</p>
                  <p className="text-4xl sm:text-5xl font-bold text-blue-600">{scores.overall}</p>
                  <p className="text-xs text-slate-500 mt-2">/9.0</p>
                </div>

                {/* Metric Tabs */}
                <div className="flex gap-2 mb-6 text-xs flex-wrap">
                  {["Overall", "Grammar", "Vocabulary", "Cohesion"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedMetric(tab)}
                      className={`px-3 py-2 rounded transition-colors font-medium ${
                        selectedMetric === tab
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Feedback Details */}
                <div className="space-y-3 text-xs sm:text-sm">
                  {selectedMetric === "Grammar" && (
                    <>
                      <div className="font-semibold text-slate-900">Grammar Score: {scores.grammar}/9</div>
                      {grammarResult?.matches.length > 0 ? (
                        grammarResult.matches.map((err: any, i: number) => (
                          <div key={i} className="bg-white p-3 rounded border border-red-200">
                            <p className="font-semibold text-red-600">{err.message}</p>
                            {err.context && (
                              <div className="italic text-xs text-slate-600 mt-1">…{err.context}…</div>
                            )}
                            {err.replacements?.length > 0 && (
                              <div className="text-slate-600 mt-2 text-sm">Suggestions: {err.replacements.join(', ')}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-green-600 font-semibold">No major grammar errors found!</p>
                      )}
                    </>
                  )}

                  {selectedMetric === "Vocabulary" && (
                    <>
                      <div className="font-semibold text-slate-900">Vocabulary Score: {scores.vocabulary}/9</div>
                      <p className="text-slate-600">
                        Try using more varied and sophisticated vocabulary to score higher.
                      </p>
                    </>
                  )}

                  {selectedMetric === "Cohesion" && (
                    <>
                      <div className="font-semibold text-slate-900">Cohesion Score: {scores.cohesion}/9</div>
                      <p className="text-slate-600">
                        Use linking words like "however", "moreover", and "furthermore" to improve flow.
                      </p>
                    </>
                  )}

                  {selectedMetric === "Overall" && (
                    <div className="space-y-2">
                      {getSuggestions().map((suggestion, i) => (
                        <div key={i} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                          <p className="text-slate-700">• {suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {attempts[0]?.feedback && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 mt-4 text-sm text-slate-800">
                      <h4 className="font-semibold mb-2">AI Examiner Feedback (Groq)</h4>
                      <pre className="whitespace-pre-wrap text-sm">{attempts[0].feedback}</pre>
                    </div>
                  )}
                </div>

                {/* Recent attempts history */}
                {attempts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Recent Attempts</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {attempts.map((a, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-700">
                          <div className="text-xs text-slate-400">{new Date(a.at).toLocaleString()}</div>
                          <div className="font-semibold mt-1">Q: {a.question}</div>
                          <div className="mt-1">A: {a.answer.slice(0, 200)}{a.answer.length > 200 ? '…' : ''}</div>
                          <div className="mt-2 text-xs text-slate-600">Score: {scores.overall} • Grammar: {scores.grammar} • Vocab: {scores.vocabulary}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 text-xs sm:text-sm py-2"
                  onClick={() => {
                    setSubmitted(false)
                  }}
                >
                  Write Another Essay
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}