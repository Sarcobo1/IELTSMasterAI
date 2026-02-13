// app/speaking/[testId]/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
// import Navigation from "@/components/navigation"
// import Footer from "@/components/footer"
import {
  Mic,
  RotateCcw,
  MessageSquare,
  BookOpen,
  Layers,
  Zap,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

// =========================================================
// AI GENERATION FUNCTION
// =========================================================
async function generateQuestionsWithAI(testId: string, count: number, part2Topic?: string): Promise<string[]> {
  try {
    const res = await fetch("/api/groq-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, count, part2Topic }),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error("AI question generation error: " + txt)
    }

    const data = await res.json()
    return data.questions
  } catch (e) {
    console.error(e)
    return [] // Fallback to empty if error
  }
}

// =========================================================
// GET QUESTIONS (AI GENERATED)
let currentPart2Topic = ""

function getQuestionsForTest(testId: string): Promise<string[]> {
  switch (testId) {
    case "part-1":
      return generateQuestionsWithAI("part-1", 5)
    case "part-2":
      return generateQuestionsWithAI("part-2", 1).then(questions => {
        if (questions.length > 0) {
          // Extract topic from cue card for Part 3
          currentPart2Topic = questions[0].split("\n")[0].replace("Describe ", "").trim()
        }
        return questions
      })
    case "part-3":
      // Use currentPart2Topic if available, else generate generic
      return generateQuestionsWithAI("part-3", 4, currentPart2Topic || undefined)
    default:
      notFound()
      return Promise.resolve([])
  }
}

function getTestTitle(testId: string): string {
  switch (testId) {
    case "part-1":
      return "Part 1: Introduction and Interview"
    case "part-2":
      return "Part 2: Long Turn"
    case "part-3":
      return "Part 3: Discussion"
    default:
      return "Speaking Practice"
  }
}

export default function SpeakingTestPage() {
  const params = useParams()
  const testId = params.testId as string
  const testTitle = getTestTitle(testId)

  const [questions, setQuestions] = useState<string[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [transcripts, setTranscripts] = useState<Array<{ text: string; at: string }>>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [checking, setChecking] = useState(false)
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [logicResult, setLogicResult] = useState<any>(null)
  const [feedback, setFeedback] = useState<any>({})
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState({
    fluency: 0,
    pronunciation: 0,
    grammar: 0,
    vocabulary: 0,
  })
  const [isDailyLimited, setIsDailyLimited] = useState(false)

  const recognitionRef = useRef<any>(null)
  const recognitionBufferRef = useRef<string>("")
  const confidencesRef = useRef<number[]>([])

  // =========================================================
  // LOAD QUESTIONS ON MOUNT
  // =========================================================
  useEffect(() => {
    setLoadingQuestions(true)
    getQuestionsForTest(testId)
      .then(setQuestions)
      .finally(() => setLoadingQuestions(false))
  }, [testId])

  // =========================================================
  // LOCAL STORAGE
  // =========================================================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`speaking:${testId}:transcripts`)
      if (raw) setTranscripts(JSON.parse(raw))
    } catch (e) {
      console.error("Failed to load transcripts from localStorage", e)
    }

    // Kunlik limitni tekshirish (kuniga 1 ta analiz)
    try {
      const lastDate = localStorage.getItem(`speaking:${testId}:lastDate`)
      const today = new Date().toISOString().split("T")[0]
      if (lastDate === today) {
        setIsDailyLimited(true)
      }
    } catch (e) {
      console.error("Failed to read speaking daily limit date", e)
    }
  }, [testId])

  useEffect(() => {
    try {
      localStorage.setItem(`speaking:${testId}:transcripts`, JSON.stringify(transcripts.slice(0, 50)))
    } catch (e) {
      console.error("Failed to save transcripts to localStorage", e)
    }
  }, [transcripts, testId])

  // =========================================================
  // TIMER
  // =========================================================
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording])

  // =========================================================
  // SPEECH RECOGNITION
  // =========================================================
  const handleMicClick = () => {
    if (isRecording) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("SpeechRecognition API not supported in this browser. Use Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event: any) => {
      let finalParts: string[] = []
      let interim = ""
      const newConfidences: number[] = []

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i]
        if (res.isFinal) {
          finalParts.push(res[0].transcript.trim())
          if (res[0].confidence) newConfidences.push(res[0].confidence)
        } else {
          interim += res[0].transcript
        }
      }

      if (finalParts.length > 0) {
        const now = new Date().toISOString()
        const entries = finalParts.map((p) => ({ text: p, at: now }))
        setTranscripts((prev) => [...entries, ...prev].slice(0, 50))
        recognitionBufferRef.current = (recognitionBufferRef.current + " " + finalParts.join(" ")).trim()
        confidencesRef.current = [...confidencesRef.current, ...newConfidences]
      }

      setCurrentTranscript(interim)
    }

    recognition.onerror = (e: any) => console.error("Recognition error:", e)

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
      const latest = (recognitionBufferRef.current + " " + (currentTranscript || "")).trim()
      if (latest) handleCheck(latest)
      recognitionBufferRef.current = ""
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    setRecordingTime(0)
    confidencesRef.current = []
  }

  const stopRecognition = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }

  // =========================================================
  // LOGIC / FLUENCY ANALYSIS
  // =========================================================
  function analyzeLogic(text: string) {
    const lower = text.toLowerCase()
    const sentences = text.split(/[.!?]\s/).filter(Boolean)
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    const avgSentenceLen = sentences.length ? wordCount / sentences.length : 0

    const fillers = ["um", "uh", "like", "you know", "so", "actually", "basically"]
    let fillerCount = 0
    fillers.forEach((f) => {
      const re = new RegExp("\\b" + f + "\\b", "gi")
      const m = lower.match(re)
      if (m) fillerCount += m.length
    })

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
    if (wordCount < 20) issues.push("Very short answer — try to speak longer for better evaluation.")
    if (avgSentenceLen < 6 && sentences.length > 1) issues.push("Short fragmented sentences — try to connect ideas more smoothly.")
    if (fillerCount > 2) issues.push(`Detected ${fillerCount} filler words (um/uh/like). Try to reduce them.`)
    if (repeated.length > 0) issues.push(`Repeating words detected: ${repeated.slice(0,3).map((r) => r[0]).join(", ")}`)
    issues.push("Note: This analysis doesn't check if your answer directly addresses the question—focus on relevance for IELTS.")

    return {
      wordCount,
      sentences: sentences.length,
      avgSentenceLen: Number(avgSentenceLen.toFixed(1)),
      fillerCount,
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
  const handleCheck = async (textParam?: string) => {
    if (isDailyLimited) {
      alert("Bugun bu speaking bo'limi uchun tahlil limiti tugagan. Ertaga yana bir marta tekshirtirishingiz mumkin.")
      return
    }
    const combined = [currentTranscript, ...transcripts.map((t) => t.text)]
      .filter(Boolean)
      .join(" ")
      .trim()
    const text = (textParam ?? combined ?? "").trim()

    if (!text) {
      alert("Please record something first.")
      return
    }

    setChecking(true)
    setGrammarResult(null)
    setLogicResult(null)
    setFeedback({})
    setStrengths([])
    setImprovements([])

    try {
      // Calculate local pronunciation score
      let avgConfidence = 0
      if (confidencesRef.current.length > 0) {
        avgConfidence = confidencesRef.current.reduce((a, b) => a + b, 0) / confidencesRef.current.length
      }
      const pronunciationScore = avgConfidence > 0 ? Number((avgConfidence * 9).toFixed(1)) : 5.0 // Default to 5 if no confidence

      const question = questions[currentQuestionIndex]
      const groqRes = await fetch("/api/groq-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, question, recordingTime }),
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

      // Set scores (pronunciation local, others from Groq)
      setScores({
        fluency: Number(groqResult.scores.fluency.toFixed(1)),
        pronunciation: pronunciationScore,
        grammar: Number(groqResult.scores.grammar.toFixed(1)),
        vocabulary: Number(groqResult.scores.vocabulary.toFixed(1)),
      })

      // Set additional Groq data
      setFeedback(groqResult.feedback || {})
      setStrengths(groqResult.strengths || [])
      setImprovements(groqResult.improvements || [])

      setShowResults(true)

      // Kunlik limitni belgilash
      const today = new Date().toISOString().split("T")[0]
      localStorage.setItem(`speaking:${testId}:lastDate`, today)
      setIsDailyLimited(true)
    } catch (e: any) {
      console.error(e)
      alert("Error checking with Groq AI: " + (e.message || e))
    } finally {
      setChecking(false)
    }
  }

  const retryQuestion = () => {
    setTranscripts([])
    setCurrentTranscript("")
    setGrammarResult(null)
    setLogicResult(null)
    setFeedback({})
    setStrengths([])
    setImprovements([])
    setScores({ fluency: 0, pronunciation: 0, grammar: 0, vocabulary: 0 })
    setShowResults(false)
    setRecordingTime(0)
    confidencesRef.current = []
  }

  const nextQuestion = () => {
    retryQuestion()
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
  }

  const regenerateQuestions = async () => {
    setLoadingQuestions(true)
    const newQuestions = await getQuestionsForTest(testId)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    retryQuestion()
    setLoadingQuestions(false)
  }

  // =========================================================
  // RENDER
  // =========================================================
  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 overflow-x-hidden">
        {/* <Navigation /> */}
        <main className="flex-grow flex items-center justify-center">
          <p className="text-white text-xl">Loading AI-generated questions...</p>
        </main>
        {/* <Footer /> */}
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 overflow-x-hidden">
        {/* <Navigation /> */}

        <main className="flex-grow py-8 sm:py-10 md:py-10 px-3 sm:px-6 lg:px-8 flex items-start justify-center">
          <div className="max-w-4xl w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">
              {testTitle} - Detailed Speaking Analysis 📊
            </h1>

            {/* Current question + time */}
            <div className="bg-slate-700 p-4 rounded-lg mb-8 text-center border border-blue-500/50">
              <p className="text-sm text-gray-400 mb-1">
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>
              <p className="text-lg font-semibold text-white mb-2 italic">
                "{questions[currentQuestionIndex]}"
              </p>
              <p className="text-gray-300 text-sm">
                Recorded time:{" "}
                <span className="font-bold text-blue-300">
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, "0")}s
                </span>
              </p>
            </div>

            {/* Scores */}
            <h2 className="text-2xl font-semibold text-white mb-4">Overall Score (1-9 Band)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[
                { label: "Fluency", score: scores.fluency, icon: Zap, color: "text-yellow-400" },
                { label: "Pronunciation", score: scores.pronunciation, icon: Mic, color: "text-purple-400" },
                { label: "Grammar", score: scores.grammar, icon: Layers, color: "text-blue-400" },
                { label: "Vocabulary", score: scores.vocabulary, icon: BookOpen, color: "text-green-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-700/70 rounded-xl p-4 sm:p-5 text-center border border-slate-600"
                >
                  <item.icon size={24} className={`${item.color} mx-auto mb-2`} />
                  <p className="text-xs sm:text-sm text-gray-300 mb-1 font-medium">{item.label}</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">
                    {item.score.toFixed(1)}
                  </p>
                  <div className="mt-3 w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(item.score / 9) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* How scores are calculated */}
            <div className="bg-slate-800 p-5 rounded-xl mb-8 border border-blue-500/50">
              <h4 className="font-bold text-lg mb-3 text-blue-300 flex items-center">
                <HelpCircle size={20} className="mr-2" /> How Scores Are Calculated
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                <li><b>Fluency</b>: AI analysis of flow, hesitations, and coherence (plus local fillers detection).</li>
                <li><b>Pronunciation</b>: Based on browser speech recognition confidence scores.</li>
                <li><b>Grammar</b>: AI-detected errors and range/accuracy.</li>
                <li><b>Vocabulary</b>: AI analysis of range and precision (plus local variety metrics).</li>
              </ul>
              <p className="text-xs text-gray-400 mt-4">
                Scores are estimates — real IELTS uses human examiners.
              </p>
            </div>

            {/* Detailed feedback */}
            <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Detailed Feedback</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Grammar */}
              {grammarResult && (
                <div className="bg-slate-800 p-5 rounded-xl border border-red-500/50">
                  <h4 className="font-bold text-lg mb-3 text-blue-300 flex items-center">
                    <Layers size={20} className="mr-2" /> Grammar Suggestions ({grammarResult.matches.length})
                  </h4>
                  {grammarResult.matches.length === 0 ? (
                    <p className="text-green-400 font-medium">No grammar issues found. Great job! ✅</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-3 text-sm text-gray-200">
                      {grammarResult.matches.map((m: any, i: number) => (
                        <li key={i}>
                          <b className="text-red-300">{m.message}</b>
                          {m.context && (
                            <div className="italic text-xs text-gray-400 mt-1">
                              Context: "...{m.context}..."
                            </div>
                          )}
                          {m.replacements?.length > 0 && (
                            <div className="text-xs text-green-400 mt-1">
                              Suggest: {m.replacements.join(", ")}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Fluency & Vocabulary */}
              {logicResult && (
                <div className="bg-slate-800 p-5 rounded-xl border border-blue-500/50">
                  <h4 className="font-bold text-lg mb-3 text-blue-300 flex items-center">
                    <MessageSquare size={20} className="mr-2" /> Fluency & Vocabulary Analysis
                  </h4>
                  <div className="text-sm text-gray-300 mb-3 space-y-1">
                    <p>
                      Total Words: <span className="font-semibold text-white">{logicResult.wordCount}</span> | Sentences: <span className="font-semibold text-white">{logicResult.sentences}</span>
                    </p>
                    <p>
                      Avg Sentence Length: <span className="font-semibold text-white">{logicResult.avgSentenceLen}</span>
                    </p>
                    <p>
                      Filler Words: <span className={`font-semibold ${logicResult.fillerCount > 3 ? "text-red-400" : "text-green-400"}`}>{logicResult.fillerCount}</span>
                    </p>
                    <p>
                      Unique Words: <span className="font-semibold text-white">{logicResult.uniqueWordCount}</span>
                    </p>
                    <p>
                      TTR: <span className="font-semibold text-white">{logicResult.typeTokenRatio}</span> | Density: <span className="font-semibold text-white">{logicResult.lexicalDensity}</span>
                    </p>
                  </div>

                  <h5 className="font-semibold text-md text-gray-200 mt-4 mb-2">
                    Coherence & Fluency Issues:
                  </h5>
                  {logicResult.issues.length === 0 ? (
                    <p className="text-green-400 text-sm">No obvious issues found.</p>
                  ) : (
                    <ul className="list-disc pl-5 mt-2 text-sm text-yellow-300 space-y-1">
                      {logicResult.issues.map((it: string, i: number) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* AI Feedback Sections */}
            <h2 className="text-2xl font-semibold text-white mb-4">AI Examiner Feedback</h2>
            <div className="space-y-6 mb-8">
              {/* Strengths */}
              {strengths.length > 0 && (
                <div className="bg-slate-800 p-5 rounded-xl border border-green-500/50">
                  <h4 className="font-bold text-lg mb-3 text-green-300 flex items-center">
                    <CheckCircle size={20} className="mr-2" /> Strengths
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-200">
                    {strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {improvements.length > 0 && (
                <div className="bg-slate-800 p-5 rounded-xl border border-yellow-500/50">
                  <h4 className="font-bold text-lg mb-3 text-yellow-300 flex items-center">
                    <AlertCircle size={20} className="mr-2" /> Areas for Improvement
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-200">
                    {improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Feedback */}
              {Object.keys(feedback).length > 0 && (
                <div className="bg-slate-800 p-5 rounded-xl border border-blue-500/50">
                  <h4 className="font-bold text-lg mb-3 text-blue-300 flex items-center">
                    <MessageSquare size={20} className="mr-2" /> Detailed Category Feedback
                  </h4>
                  <div className="space-y-4 text-sm text-gray-200">
                    {feedback.fluency && (
                      <div>
                        <b className="text-yellow-300">Fluency:</b> {feedback.fluency}
                      </div>
                    )}
                    {feedback.vocabulary && (
                      <div>
                        <b className="text-green-300">Vocabulary:</b> {feedback.vocabulary}
                      </div>
                    )}
                    {feedback.grammar && (
                      <div>
                        <b className="text-blue-300">Grammar:</b> {feedback.grammar}
                      </div>
                    )}
                    {feedback.overall && (
                      <div className="mt-4">
                        <b className="text-purple-300">Overall:</b> {feedback.overall}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="bg-slate-700 rounded-xl p-6 sm:p-8 text-center mt-12 border border-slate-600">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button onClick={retryQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <RotateCcw size={16} className="mr-2" /> Retry Current Question
                </Button>
                <Button onClick={nextQuestion} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3">
                  Next Question (Q{currentQuestionIndex + 2 > questions.length ? 1 : currentQuestionIndex + 2})
                </Button>
                <Button onClick={regenerateQuestions} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3">
                  Regenerate New Questions
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* <Footer /> */}
      </div>
    )
  }

  // =========================================================
  // MAIN RECORDING SCREEN
  // =========================================================
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* <Navigation /> */}

      <main className="flex-grow py-8 sm:py-12 px-3 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-3xl w-full text-center text-slate-900">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{testTitle}</h1>
          <p className="text-sm sm:text-base text-slate-600 mb-10">Record your answer and get instant feedback.</p>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            {/* Question */}
            <div className="mb-8">
              <p className="text-xs uppercase text-blue-600 font-bold mb-2">
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>
              <p className="text-xl sm:text-2xl text-slate-900 font-semibold italic whitespace-pre-line">
                {questions[currentQuestionIndex]}
              </p>
            </div>

            {/* Mic button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleMicClick}
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isRecording
                    ? "bg-red-600 animate-pulse ring-8 ring-red-600/30"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <Mic size={48} className="text-white" />
              </button>
            </div>

            {isRecording && (
              <div className="text-center mb-6">
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-red-600 text-sm animate-pulse">
                  Recording in progress... Click mic to stop and check.
                </p>
              </div>
            )}

            {/* Transcript */}
            <div className="mt-6 text-left">
              <h3 className="text-md font-semibold text-slate-900 mb-2">Live Transcript / History</h3>
              <div className="bg-slate-50 p-4 rounded text-slate-900 min-h-[120px] max-h-[300px] overflow-y-auto border border-slate-200">
                {currentTranscript || transcripts.length > 0 ? (
                  <div className="space-y-3">
                    {currentTranscript && (
                      <div className="border-b border-slate-300 pb-2">
                        <div className="text-xs text-blue-600 font-semibold">Live (Interim)</div>
                        <div className="mt-1 text-lg italic">{currentTranscript}</div>
                      </div>
                    )}
                    {transcripts.map((t, i) => (
                      <div key={i} className="border-b border-slate-200 pb-2">
                        <div className="text-xs text-slate-500">
                          {new Date(t.at).toLocaleTimeString()}
                        </div>
                        <div className="mt-1">{t.text}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">No recording started yet.</span>
                )}
              </div>

              <div className="flex gap-3 mt-4 justify-end">
                <Button
                  onClick={() => {
                    setTranscripts([])
                    setCurrentTranscript("")
                    setGrammarResult(null)
                    setLogicResult(null)
                    recognitionBufferRef.current = ""
                    localStorage.removeItem(`speaking:${testId}:transcripts`)
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-slate-900"
                >
                  Clear History
                </Button>
                <Button
                  onClick={() => handleCheck()}
                  disabled={checking || isRecording || (!currentTranscript && transcripts.length === 0)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {checking ? "Checking..." : "Check & Analyze"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  )
}