// app/speaking/[testId]/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import {
  Mic,
  RotateCcw,
  MessageSquare,
  BookOpen,
  Layers,
  Zap,
  HelpCircle,
} from "lucide-react"

// =========================================================
// ВОПРОСЫ
// =========================================================
const PART1_QUESTIONS = [
  "Describe your hometown. What is the most interesting thing about it?",
  "Tell me about your favorite book or movie and why you like it.",
  "What is your dream job, and what steps are you taking to achieve it?",
  "Do you prefer living in the city or the countryside? Explain why.",
  "What kind of food do you enjoy eating, and do you like cooking?",
]

const PART2_QUESTIONS = [
  "Describe a time when you faced a difficult challenge and how you overcame it. You should say: what the challenge was, how you dealt with it, and what you learned.",
  "Describe a person who has had a significant influence on your life. You should say: who this person is, how you know them, and why they are important to you.",
  "Describe a memorable trip or holiday you have taken. You should say: where you went, who you went with, and what made it memorable.",
  "Talk about a recent piece of news or a current event that caught your attention. You should say: what it was about, why it interested you, and how it affects people.",
]

const PART3_QUESTIONS = [
  "What are the benefits of learning a second language? Do you think everyone should learn one?",
  "How important is technology in modern education? What are the advantages and disadvantages?",
  "Do you think social media is a good thing or a bad thing? Why? How has it changed communication?",
  "What is the best way for people to stay healthy? Should governments do more to promote health?",
  "Describe a popular festival or celebration in your country. How does it bring people together?",
]

function getQuestionsForTest(testId: string): string[] {
  switch (testId) {
    case "part-1":
      return PART1_QUESTIONS
    case "part-2":
      return PART2_QUESTIONS
    case "part-3":
      return PART3_QUESTIONS
    default:
      notFound()
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
  const questions = getQuestionsForTest(testId)
  const testTitle = getTestTitle(testId)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [transcripts, setTranscripts] = useState<Array<{ text: string; at: string }>>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [checking, setChecking] = useState(false)
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [logicResult, setLogicResult] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState({
    fluency: 0,
    pronunciation: 0,
    grammar: 0,
    vocabulary: 0,
  })

  const recognitionRef = useRef<any>(null)
  const recognitionBufferRef = useRef<string>("")
  const confidencesRef = useRef<number[]>([])

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
  // GRAMMAR CHECK (HF)
  // =========================================================
  async function checkGrammarWithHF(text: string) {
    const res = await fetch("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText: text }),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error("HF Grammar error: " + txt)
    }
    const data = await res.json()

    const matches = data.corrections.map((c: any) => ({
      message: c.explanation,
      replacements: [c.corrected],
      rule: "Grammar/Style",
      context: c.original,
    }))

    return { matches }
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

    try {
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

      // Adapt grammar errors to match the existing grammarResult format
      const adaptedMatches = (groqResult.grammarErrors || []).map((e: any) => ({
        message: e.explanation,
        replacements: [e.correction],
        context: e.error,
      }))

      setGrammarResult({ matches: adaptedMatches })

      const logic = analyzeLogic(text)
      setLogicResult(logic)

      // Use Groq scores
      setScores({
        fluency: Number(groqResult.scores.fluency.toFixed(1)),
        pronunciation: Number(groqResult.scores.pronunciation.toFixed(1)),
        grammar: Number(groqResult.scores.grammar.toFixed(1)),
        vocabulary: Number(groqResult.scores.vocabulary.toFixed(1)),
      })

      setShowResults(true)
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
    setScores({ fluency: 0, pronunciation: 0, grammar: 0, vocabulary: 0 })
    setShowResults(false)
    setRecordingTime(0)
    confidencesRef.current = []
  }

  const nextQuestion = () => {
    retryQuestion()
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
  }

  // =========================================================
  // RENDER
  // =========================================================
  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 overflow-x-hidden">
        <Navigation />

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
                <li><b>Fluency</b>: Based on fillers and recording length.</li>
                <li><b>Pronunciation</b>: Browser speech confidence.</li>
                <li><b>Grammar</b>: Number of detected errors.</li>
                <li><b>Vocabulary</b>: Word variety and lexical density.</li>
              </ul>
              <p className="text-xs text-gray-400 mt-4">
                Scores are estimates — real IELTS uses human examiners.
              </p>
            </div>

            {/* Detailed feedback */}
            <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Detailed Feedback</h2>
            <div className="grid md:grid-cols-2 gap-6">
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

            {/* Buttons */}
            <div className="bg-slate-700 rounded-xl p-6 sm:p-8 text-center mt-12 border border-slate-600">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button onClick={retryQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <RotateCcw size={16} className="mr-2" /> Retry Current Question
                </Button>
                <Button onClick={nextQuestion} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3">
                  Next Question (Q{currentQuestionIndex + 2 > questions.length ? 1 : currentQuestionIndex + 2})
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // =========================================================
  // MAIN RECORDING SCREEN
  // =========================================================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 px-3 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-3xl w-full text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{testTitle}</h1>
          <p className="text-sm sm:text-base text-gray-300 mb-10">Record your answer and get instant feedback.</p>

          <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-700">
            {/* Question */}
            <div className="mb-8">
              <p className="text-xs uppercase text-blue-400 font-bold mb-2">
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>
              <p className="text-xl sm:text-2xl text-gray-100 font-semibold italic">
                "{questions[currentQuestionIndex]}"
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
                <p className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-red-300 text-sm animate-pulse">
                  Recording in progress... Click mic to stop and check.
                </p>
              </div>
            )}

            {/* Transcript */}
            <div className="mt-6 text-left">
              <h3 className="text-md font-semibold text-gray-200 mb-2">Live Transcript / History</h3>
              <div className="bg-slate-900 p-4 rounded text-gray-200 min-h-[120px] max-h-[300px] overflow-y-auto border border-slate-700">
                {currentTranscript || transcripts.length > 0 ? (
                  <div className="space-y-3">
                    {currentTranscript && (
                      <div className="border-b border-slate-700 pb-2">
                        <div className="text-xs text-blue-400 font-semibold">Live (Interim)</div>
                        <div className="mt-1 text-lg italic">{currentTranscript}</div>
                      </div>
                    )}
                    {transcripts.map((t, i) => (
                      <div key={i} className="border-b border-slate-800 pb-2">
                        <div className="text-xs text-slate-400">
                          {new Date(t.at).toLocaleTimeString()}
                        </div>
                        <div className="mt-1">{t.text}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">No recording started yet.</span>
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
                  className="bg-gray-700 hover:bg-gray-600"
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

      <Footer />
    </div>
  )
}