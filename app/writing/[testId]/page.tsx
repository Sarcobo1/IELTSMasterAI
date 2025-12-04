// app/writing/[testId]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { RefreshCw, Clock, AlertCircle } from "lucide-react"

// =========================================================
// TEST CONFIGURATION
// =========================================================
const TEST_CONFIG = {
  "task-1": {
    title: "Task 1: Describing a Chart",
    duration: 20, // minutes
    wordCount: 150,
    description: "Grafik, jadval yoki diagrammani tasvirlab yozing",
    promptType: "chart"
  },
  "task-2": {
    title: "Task 2: Opinion Essay",
    duration: 40,
    wordCount: 250,
    description: "Berilgan mavzu bo'yicha o'z fikringizni bildiring",
    promptType: "opinion"
  },
  "task-3": {
    title: "Task 3: Advanced Discussion",
    duration: 50,
    wordCount: 300,
    description: "Murakkab mavzuda chuqur tahlil va muhokama",
    promptType: "discussion"
  }
}

// =========================================================
// SAMPLE QUESTIONS BY TYPE
// =========================================================
const SAMPLE_QUESTIONS = {
  chart: [
    "The chart below shows the percentage of households with internet access in different countries from 2010 to 2020. Summarize the information by selecting and reporting the main features.",
    "The graph illustrates the changes in global temperature over the past 50 years. Describe the main trends shown in the data.",
    "The table shows the export values of different products from a country. Summarize the key information and make comparisons where relevant.",
    "The pie chart displays the distribution of energy sources used in a country. Describe the main features and percentages.",
    "The bar chart compares student enrollment in various university subjects. Report the main trends and significant differences."
  ],
  opinion: [
    "Some people believe that technology has made our lives more complicated. Others think it has made life easier. Discuss both views and give your opinion.",
    "Many people think that the government should spend money on improving public transportation. Others believe private cars should be prioritized. What is your view?",
    "Some argue that children should start learning a foreign language at primary school. Others say it should begin in secondary school. Discuss both sides and state your opinion.",
    "Is it better to live in a large city or a small town? Discuss the advantages and disadvantages of both and give your opinion.",
    "Some people say that the best way to reduce crime is to give longer prison sentences. Others believe better education is more effective. What do you think?"
  ],
  discussion: [
    "Climate change is one of the most pressing issues of our time. Discuss the causes, effects, and potential solutions to this global problem.",
    "The rise of artificial intelligence is transforming society. Analyze both the opportunities and challenges AI presents for the future of work and human relationships.",
    "Globalization has connected the world economically and culturally. Critically evaluate whether its benefits outweigh its drawbacks for developing nations.",
    "The traditional education system is being challenged by online learning. Compare and contrast both approaches and discuss which model is more suitable for the 21st century.",
    "Income inequality is growing in many countries. Examine the root causes of this trend and propose comprehensive policy solutions."
  ]
}

export default function WritingTaskPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string
  
  const config = TEST_CONFIG[testId as keyof typeof TEST_CONFIG]
  
  if (!config) {
    router.push('/writing')
    return null
  }

  const [questions, setQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [essay, setEssay] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("Overall")
  const [scores, setScores] = useState({ overall: 0, grammar: 0, vocabulary: 0, cohesion: 0 })
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [attempts, setAttempts] = useState<Array<any>>([])

  // TIMER STATES
  const [testStarted, setTestStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration * 60) // seconds
  const [timeUp, setTimeUp] = useState(false)

  // Load questions based on test type
  useEffect(() => {
    const questionType = config.promptType
    const availableQuestions = SAMPLE_QUESTIONS[questionType as keyof typeof SAMPLE_QUESTIONS]
    setQuestions(availableQuestions)
  }, [testId])

  // Timer logic
  useEffect(() => {
    if (!testStarted || timeUp || submitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeUp(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testStarted, timeUp, submitted])

  // Load attempts from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`writing:${testId}:attempts`)
      if (raw) setAttempts(JSON.parse(raw))
    } catch (e) {
      console.error("Failed to load attempts", e)
    }
  }, [testId])

  useEffect(() => {
    try {
      localStorage.setItem(`writing:${testId}:attempts`, JSON.stringify(attempts.slice(0, 50)))
    } catch (e) {
      console.error("Failed to save attempts", e)
    }
  }, [attempts, testId])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start test
  const handleStartTest = () => {
    setTestStarted(true)
    setTimeUp(false)
    setTimeLeft(config.duration * 60)
  }

  // Submit essay
  const handleCheck = async () => {
    const text = essay.trim()

    if (!text) {
      alert("Please write something first.")
      return
    }

    if (text.split(/\s+/).filter(Boolean).length < config.wordCount * 0.8) {
      const confirm = window.confirm(
        `Your essay is shorter than recommended (${config.wordCount} words). Submit anyway?`
      )
      if (!confirm) return
    }

    setChecking(true)
    setGrammarResult(null)

    try {
      const question = questions[currentQuestionIndex]
      const groqRes = await fetch("/api/groq-writing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: text, question, taskType: config.promptType }),
      })

      if (!groqRes.ok) {
        throw new Error("Scoring failed")
      }

      const groqResult = await groqRes.json()

      const adaptedMatches = (groqResult.grammarErrors || []).map((e: any) => ({
        message: e.explanation,
        replacements: [e.correction],
        context: e.error,
      }))

      setGrammarResult({ matches: adaptedMatches })

      const overall = (groqResult.scores.task_response + groqResult.scores.coherence + 
                       groqResult.scores.vocabulary + groqResult.scores.grammar) / 4
      
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
        wordCount: text.split(/\s+/).filter(Boolean).length,
        at: new Date().toISOString(),
        feedback: groqResult.feedback?.overall || "",
        timeSpent: config.duration * 60 - timeLeft,
      }
      
      setAttempts((prev) => [attempt, ...prev])
      setSubmitted(true)
      setTestStarted(false)
    } catch (e: any) {
      console.error(e)
      alert("Error checking essay: " + (e.message || e))
    } finally {
      setChecking(false)
    }
  }

  // Reset test
  const handleReset = () => {
    setEssay("")
    setSubmitted(false)
    setTestStarted(false)
    setTimeUp(false)
    setTimeLeft(config.duration * 60)
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-slate-900 text-xl">Loading questions...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{config.title}</h1>
            <p className="text-slate-600">{config.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-slate-500">
              <span>⏱️ Duration: {config.duration} minutes</span>
              <span>📝 Minimum words: {config.wordCount}</span>
            </div>
          </div>

          {/* Time Up Alert */}
          {timeUp && !submitted && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-red-900 text-lg">⏰ Time's Up!</h3>
                <p className="text-red-700 mt-1">Your time has ended. Please submit your essay now or start a new test.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Essay Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                {/* Timer Display */}
                {testStarted && !submitted && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
                    timeLeft < 120 ? 'bg-red-50 border-2 border-red-300' : 'bg-blue-50 border-2 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className={timeLeft < 120 ? 'text-red-600' : 'text-blue-600'} size={24} />
                      <span className="font-semibold text-slate-700">Time Remaining:</span>
                    </div>
                    <span className={`text-2xl font-bold ${timeLeft < 120 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}

                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 text-lg">Essay Prompt</span>
                    <span className="text-xs text-slate-500">Question {currentQuestionIndex + 1}/{questions.length}</span>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {questions[currentQuestionIndex]}
                  </p>
                </div>

                {/* Start Button */}
                {!testStarted && !submitted && (
                  <div className="text-center py-12">
                    <Button
                      onClick={handleStartTest}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                    >
                      ▶️ Start Test ({config.duration} minutes)
                    </Button>
                    <p className="text-sm text-slate-500 mt-3">Timer will start when you click the button</p>
                  </div>
                )}

                {/* Essay Textarea */}
                {testStarted && !submitted && (
                  <>
                    <textarea
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      placeholder="Start writing your essay here..."
                      className="w-full min-h-96 p-4 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none text-base resize-none"
                      disabled={timeUp}
                    />

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-slate-600">
                        Word Count: {essay.split(/\s+/).filter(Boolean).length} / {config.wordCount}
                      </span>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setEssay("")}
                          variant="outline"
                        >
                          <RefreshCw size={16} className="mr-2" /> Clear
                        </Button>
                        <Button
                          onClick={handleCheck}
                          disabled={checking || (!timeUp && essay.trim().length < 50)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {checking ? "Checking..." : "Submit & Get Feedback"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Submitted State */}
                {submitted && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Essay Submitted!</h3>
                    <p className="text-slate-600 mb-6">Check your results in the feedback panel →</p>
                    <Button
                      onClick={handleReset}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Write Another Essay
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Panel */}
            {submitted && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">📊 AI Feedback</h3>
                <p className="text-xs text-slate-500 mb-4">Estimated score (not exact)</p>

                {/* Score Card */}
                <div className="bg-white rounded-xl border-2 border-blue-300 p-6 mb-6 text-center shadow-lg">
                  <p className="text-sm text-slate-600 mb-2">Overall Band Score</p>
                  <p className="text-6xl font-bold text-blue-600">{scores.overall}</p>
                  <p className="text-xs text-slate-500 mt-2">/9.0</p>
                </div>

                {/* Metric Tabs */}
                <div className="flex gap-2 mb-6 text-xs flex-wrap">
                  {["Overall", "Grammar", "Vocabulary", "Cohesion"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedMetric(tab)}
                      className={`px-3 py-2 rounded-lg transition-all font-medium ${
                        selectedMetric === tab
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Feedback Details */}
                <div className="space-y-3 text-sm">
                  {selectedMetric === "Grammar" && (
                    <>
                      <div className="font-semibold text-slate-900 bg-white p-3 rounded-lg">
                        Grammar Score: {scores.grammar}/9
                      </div>
                      {grammarResult?.matches.length > 0 ? (
                        grammarResult.matches.slice(0, 5).map((err: any, i: number) => (
                          <div key={i} className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                            <p className="font-semibold text-red-600 text-xs">{err.message}</p>
                            {err.context && (
                              <div className="italic text-xs text-slate-500 mt-1">"{err.context}"</div>
                            )}
                            {err.replacements?.length > 0 && (
                              <div className="text-green-600 mt-2 text-xs font-medium">
                                ✓ Suggestion: {err.replacements[0]}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="text-green-700 font-semibold">✓ No major grammar errors found!</p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedMetric === "Vocabulary" && (
                    <div className="bg-white p-4 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-2">Vocabulary Score: {scores.vocabulary}/9</div>
                      <p className="text-slate-600 text-sm">
                        Use more varied and sophisticated vocabulary to improve your score.
                      </p>
                    </div>
                  )}

                  {selectedMetric === "Cohesion" && (
                    <div className="bg-white p-4 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-2">Cohesion Score: {scores.cohesion}/9</div>
                      <p className="text-slate-600 text-sm">
                        Use linking words and phrases to improve the flow of your essay.
                      </p>
                    </div>
                  )}

                  {selectedMetric === "Overall" && attempts[0]?.feedback && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <h4 className="font-semibold mb-2 text-slate-900">AI Examiner Feedback</h4>
                      <pre className="whitespace-pre-wrap text-sm text-slate-700">{attempts[0].feedback}</pre>
                    </div>
                  )}
                </div>

                {/* Time spent */}
                {attempts[0]?.timeSpent && (
                  <div className="mt-4 bg-white p-3 rounded-lg text-sm text-slate-600">
                    ⏱️ Time spent: {Math.floor(attempts[0].timeSpent / 60)}:{(attempts[0].timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}