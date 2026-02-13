"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react"
import { Fullscreen, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { useRouter } from "next/navigation"
import readingDataRaw from "../../reading_data/all_reading_data.json"
import { useAuth } from "@/context/AuthContext"

type Question = {
    id: number;
    pre?: string;
    post?: string;
    words: number;
    answer: string;
    // question type and meta
    type?: "gap_fill" | "tfng" | "mcq" | "multiple-choice" | "multiple_choice";
    statement?: string;
    question?: string;
    options?: string[];
};

type QuestionGroup = {
    group_title?: string;
    questions: Question[];
};

type Part = {
    part_id: number;
    passage_title: string;
    image?: string;
    passage: { id: string; text: string; image?: string }[];
    question_groups: QuestionGroup[];
};

type Test = {
    test_id: string;
    test_title: string;
    total_questions: number;
    parts: Part[];
    level: string;
};

type Params = { testId: string };

// JSON ↓ testni topish
function findTestById(testId: string): Test | null {
    for (const level of (readingDataRaw as any).levels) {
        const found = level.tests.find((t: any) => t.test_id === testId)
        if (found) return { ...found, level: level.level_name }
    }
    return null
}

// ===================== NAVBAR ===========================
const IeltsNavbar = ({
    timeLeft,
    onStart,
    onFullscreen,
    onBack,
    level
}: {
    timeLeft: number
    onStart: () => void
    onFullscreen: () => void
    onBack: () => void
    level: string
}) => {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    return (
        <div className="h-[50px] flex items-center justify-between px-3 border-b border-gray-300 shrink-0 select-none bg-white text-gray-800">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={18} className="mr-1" /> Back
                </button>
                <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded shadow-md">
                    {level}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-xl font-mono font-bold">
                    {formatTime(timeLeft)}
                </div>
                <button 
                    onClick={onStart}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-1.5 rounded-sm transition-colors shadow-md"
                >
                    START
                </button>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onFullscreen} className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                    <Maximize2 size={20}/>
                </button>
            </div>
        </div>
    )
}


// ======================== FOOTER ============================

const IeltsFooter = ({
    questionIds,
    currentQuestion,
    answers,
    onQuestionClick,
    onPrevious,
    onNext,
    partsLength,
    currentPartIndex,
    onPartSelect
}: {
    questionIds: number[]
    currentQuestion: number
    answers: Record<number, string>
    onQuestionClick: (q: number) => void
    onPrevious: () => void
    onNext: () => void
    partsLength: number
    currentPartIndex: number
    onPartSelect: (idx: number) => void
}) => {

    const activeQuestions = questionIds

    return (
        <div className="bg-white border-t border-gray-300 h-[50px] flex items-center justify-between px-4 shrink-0 select-none shadow-inner">

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {Array.from({ length: partsLength }, (_, idx) => (
                        <button
                            key={idx}
                            onClick={() => onPartSelect(idx)}
                            className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                                idx === currentPartIndex
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            Part {idx + 1}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1.5">
                    {activeQuestions.slice(0, 13).map((num) => {
                        const isAnswered = answers[num] && answers[num].trim() !== ""
                        const isCurrent = num === currentQuestion

                        return (
                            <button
                                key={num}
                                onClick={() => onQuestionClick(num)}
                                className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-sm border-2 transition-all
                                    ${!isCurrent && !isAnswered ? "border-gray-400 bg-white hover:bg-gray-100 text-gray-700" : ""}
                                    ${isAnswered && !isCurrent ? "border-green-600 bg-green-600 text-white hover:bg-green-700" : ""}
                                    ${isCurrent ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105" : ""}
                                `}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>

                <span className="text-xs text-gray-500 ml-4">Part {currentPartIndex + 1} of {partsLength}</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                    Question {Math.max(1, activeQuestions.indexOf(currentQuestion) + 1)} / {activeQuestions.length}
                </span>

                <div className="flex gap-1 border-l border-gray-300 pl-4">
                    <button
                        onClick={onPrevious}
                        disabled={currentQuestion === 1}
                        className="p-2 bg-gray-200 border border-gray-400 rounded-sm hover:bg-gray-300 disabled:opacity-50"
                    >
                        <ChevronLeft size={20}/>
                    </button>

                    <button
                        onClick={onNext}
                        disabled={questionIds.length === 0 || currentQuestion === questionIds[questionIds.length - 1]}
                        className="p-2 bg-red-600 border border-red-600 rounded-sm hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </div>
        </div>
    )
}


// ========================== MAIN PAGE ===============================

export default function IeltsTestInterface({ params }: { params: Promise<Params> }) {
    const router = useRouter()
    const { testId } = use(params) as { testId: string }
    const readingData = findTestById(testId)
    if (!readingData) {
        return <div className="p-8 text-center text-red-600 font-bold">Test topilmadi!</div>
    }
    const { isAuthenticated, isLoading, user } = useAuth()
    const [hasPremium, setHasPremium] = useState(false)

    const [timeLeft, setTimeLeft] = useState(3600)
    const [running, setRunning] = useState(false)
    const [paused, setPaused] = useState(false)
    const [leftWidth, setLeftWidth] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [currentPartIndex, setCurrentPartIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [showResults, setShowResults] = useState(false)
    const [score, setScore] = useState<number | null>(null)
    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Premium status check (localStorage same as premium page)
    useEffect(() => {
        if (!user?.email) {
            setHasPremium(false)
            return
        }
        try {
            const stored = localStorage.getItem("premiumUsers")
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, { planId: string; expiresAt: string }>
                const entry = parsed[user.email]
                if (entry && entry.planId !== "free") {
                    setHasPremium(true)
                    return
                }
            }
            setHasPremium(false)
        } catch (e) {
            console.error("premiumUsers parse error", e)
            setHasPremium(false)
        }
    }, [user?.email])

    // Track fullscreen state
    useEffect(() => {
        function handleFsChange() {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFsChange)
        return () => document.removeEventListener("fullscreenchange", handleFsChange)
    }, [])

    // ========== TIMER ============
    useEffect(() => {
        if (!running || paused) return
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [running, paused])


    const handleStart = () => {
        setRunning(true)
        setPaused(false)
    }

    // ========== FULLSCREEN ============
    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    // ========== BACK ============
    const handleBack = () => {
        router.push("/reading-selection")
    }



    // ========== DRAG PANEL ============
    const startDrag = (e: React.MouseEvent) => {
        setIsDragging(true)
    }

    const onDrag = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100

        if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth)
    }, [isDragging])

    const stopDrag = () => setIsDragging(false)

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", onDrag)
            window.addEventListener("mouseup", stopDrag)
        } else {
            window.removeEventListener("mousemove", onDrag)
            window.removeEventListener("mouseup", stopDrag)
        }
    }, [isDragging, onDrag])


    // ========== QUESTIONS ============
    const handleAnswerChange = (id: number, v: string) => {
        setAnswers(prev => ({ ...prev, [id]: v }))
    }

    const handleQuestionClick = (num: number) => {
        setCurrentQuestion(num)
        setTimeout(() => {
            inputRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "center" })
            inputRefs.current[num]?.focus()
        }, 100)
    }

    const getPartQuestionIds = (partIdx: number) => {
        const part = readingData.parts?.[partIdx]
        if (!part) return []
        return part.question_groups.flatMap(g => g.questions.map(q => q.id))
    }

    const handlePrevious = () => {
        const ids = getPartQuestionIds(currentPartIndex)
        const idx = ids.indexOf(currentQuestion)
        if (idx > 0) {
            handleQuestionClick(ids[idx - 1])
        }
    }

    const handleNext = () => {
        const ids = getPartQuestionIds(currentPartIndex)
        const idx = ids.indexOf(currentQuestion)
        if (idx !== -1 && idx < ids.length - 1) {
            handleQuestionClick(ids[idx + 1])
        }
    }


    const getWordLimit = (id: number) => {
        const q = readingData.parts
            ?.flatMap(p => p.question_groups)
            ?.flatMap(g => g.questions)
            .find(q => q.id === id)
        return q?.words || 1
    }

    const getFirstQuestionId = (partIndex: number) => {
        const ids = getPartQuestionIds(partIndex)
        if (!ids.length) return null
        return ids[0]
    }

    const handlePartSwitch = (idx: number) => {
        setCurrentPartIndex(idx)
        const firstQ = getFirstQuestionId(idx)
        if (firstQ) {
            setCurrentQuestion(firstQ)
            setTimeout(() => {
                inputRefs.current[firstQ]?.scrollIntoView({ behavior: "smooth", block: "center" })
                inputRefs.current[firstQ]?.focus()
            }, 100)
        }
    }

    const normalize = (v: string) => v.trim().toLowerCase()

    const checkAnswers = () => {
        let correct = 0
        const questions = readingData.parts
            .flatMap(p => p.question_groups)
            .flatMap(g => g.questions)

        questions.forEach(q => {
            const userAnsRaw = answers[q.id] || ""
            const correctAns = q.answer || ""
            if (normalize(userAnsRaw) === normalize(correctAns)) {
                correct += 1
            }
        })

        setScore(correct)
        setShowResults(true)
    }

    const clearResults = () => {
        setShowResults(false)
        setScore(null)
    }


    const needsPremium = readingData.level && !String(readingData.level).toLowerCase().includes("basic")

    // ================== UI ====================
    if (needsPremium && (isLoading || (!isAuthenticated && !user))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
                Yuklanmoqda...
            </div>
        )
    }

    if (needsPremium && (!hasPremium || !isAuthenticated)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <div className="max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Premium talab qilinadi</h2>
                    <p className="text-slate-600">
                        Bu Academic/Advanced reading test faqat Premium foydalanuvchilar uchun. Davom etish uchun obuna bo'ling.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push("/premium")}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                            Premium rejalari
                        </button>
                        <button
                            onClick={() => router.push("/sign-in")}
                            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                        >
                            Kirish
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
            
            {!isFullscreen && (
                <IeltsNavbar
                    timeLeft={timeLeft}
                    onStart={handleStart}
                    onFullscreen={handleFullscreen}
                    onBack={handleBack}
                    level={readingData.level}
                />
            )}

            <div ref={containerRef} className="flex flex-1 overflow-hidden relative w-full">
                {/* LEFT PANEL: Current Part Passage */}
                <div style={{ width: `${leftWidth}%` }} className="h-full overflow-y-auto bg-white border-r border-gray-300 custom-scrollbar">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">{readingData.test_title}</h2>

                        {/* Current part passage */}
                        {readingData.parts[currentPartIndex] && (
                            <div className="mb-8">
                                <h3 className="font-bold text-lg mb-2">
                                    Part {currentPartIndex + 1}: {readingData.parts[currentPartIndex].passage_title}
                                </h3>
                                {readingData.parts[currentPartIndex].image && (
                                    <div className="mb-4">
                                        <img
                                            src={readingData.parts[currentPartIndex].image}
                                            alt={readingData.parts[currentPartIndex].passage_title}
                                            className="w-full max-h-72 object-contain rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                                <div className="space-y-4 leading-relaxed">
                                    {readingData.parts[currentPartIndex].passage.map(p => (
                                        <p key={p.id} className="text-justify">{p.text}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RESIZER */}
                <div
                    onMouseDown={startDrag}
                    className={`w-[8px] bg-white cursor-col-resize flex flex-col justify-center items-center border-r border-l border-gray-300 ${
                        isDragging ? "w-[12px]" : ""
                    }`}
                >
                    <div className="flex flex-col gap-1.5 opacity-60">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL: Questions of current Part */}
                <div style={{ width: `${100 - leftWidth}%` }} className="h-full overflow-y-auto bg-gray-50 custom-scrollbar">
                    <div className="p-4">
                        {readingData.parts[currentPartIndex] && (
                            <div className="mb-8">
                                <h3 className="font-bold text-xl mb-4">Part {currentPartIndex + 1} Questions</h3>
                                {readingData.parts[currentPartIndex].question_groups.map((group, gidx) => (
                                    <div key={gidx} className="mb-4">
                                        {group.group_title && (
                                            <h4 className="font-bold text-lg mb-2">{group.group_title}</h4>
                                        )}
                                        <ul className="list-disc list-inside space-y-4 ml-4">
                                            {group.questions.map(q => {
                                                const isCurrent = currentQuestion === q.id
                                                const limit = getWordLimit(q.id)
                                                const type = q.type || "gap_fill"
                                                const getOptionValue = (opt: string) => opt.split(".")[0].trim() || opt
                                                let optionsToShow = q.options
                                                if (type === "tfng" && (!optionsToShow || optionsToShow.length === 0)) {
                                                    optionsToShow = ["TRUE", "FALSE", "NOT GIVEN"]
                                                }
                                                const questionText = q.statement || q.question || q.pre || q.post || "Savol matni mavjud emas"
                                                const isCorrect = showResults && normalize(answers[q.id] || "") === normalize(q.answer || "")
                                                const isIncorrect = showResults && answers[q.id] && !isCorrect
                                                return (
                                                    <li
                                                        key={q.id}
                                                        className={`text-base ${isCurrent ? 'text-blue-600 font-semibold' : ''} ${isCorrect ? 'bg-green-50' : ''} ${isIncorrect ? 'bg-red-50' : ''}`}
                                                    >
                                                        {type === "gap_fill" ? (
                                                            <>
                                                        {q.pre}
                                                        <div className="inline-block relative">
                                                            <input
                                                                        ref={(el) => { inputRefs.current[q.id] = el }}
                                                                type="text"
                                                                value={answers[q.id] || ""}
                                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                onFocus={() => setCurrentQuestion(q.id)}
                                                                className="w-32 h-6 border-b border-gray-400 px-1 mx-1 text-center focus:border-blue-600 bg-transparent"
                                                                placeholder={String(q.id)}
                                                            />
                                                                    {!answers[q.id] && (
                                                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-gray-600 font-bold pointer-events-none">
                                                                {q.id}
                                                            </span>
                                                                    )}
                                                        </div>
                                                        {q.post}
                                                                {showResults && (
                                                                    <span className="ml-2 text-xs text-gray-600">To‘g‘ri javob: {q.answer}</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="mb-2">
                                                                    <span className="block font-semibold">{questionText}</span>
                                                                </div>
                                                                <div className="space-y-2 ml-2">
                                                                    {optionsToShow?.map((opt, idx) => {
                                                                        const optionValue = getOptionValue(opt)
                                                                        const isSelected = answers[q.id] === optionValue
                                                                        return (
                                                                            <label
                                                                                key={idx}
                                                                                className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-100"
                                                                            >
                                                                                <input
                                                                                    ref={idx === 0 ? (el) => { inputRefs.current[q.id] = el } : undefined}
                                                                                    type="radio"
                                                                                    name={`q_${q.id}`}
                                                                                    value={optionValue}
                                                                                    checked={isSelected}
                                                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                                    onFocus={() => setCurrentQuestion(q.id)}
                                                                                    className="text-blue-600 focus:ring-blue-500"
                                                                                />
                                                                                <span className="text-sm">{opt}</span>
                                                                            </label>
                                                                        )
                                                                    })}
                                                                </div>
                                                                {showResults && (
                                                                    <div className="text-xs text-gray-600">To‘g‘ri javob: {q.answer}</div>
                                                                )}
                                                            </>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Answer actions at bottom */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <button
                                onClick={checkAnswers}
                                className="px-3 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                            >
                                Javoblarni tekshirish
                            </button>
                            {showResults && (
                                <>
                                    <button
                                        onClick={clearResults}
                                        className="px-3 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    >
                                        Tozalash
                                    </button>
                                    {score !== null && (
                                        <span className="text-sm font-semibold text-green-700">
                                            Natija: {score} / {readingData.total_questions}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <IeltsFooter
                questionIds={getPartQuestionIds(currentPartIndex)}
                currentQuestion={currentQuestion}
                answers={answers}
                onQuestionClick={handleQuestionClick}
                onPrevious={handlePrevious}
                onNext={handleNext}
                partsLength={readingData.parts.length}
                currentPartIndex={currentPartIndex}
                onPartSelect={handlePartSwitch}
            />


            {/* Custom Scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border: 2px solid #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
            `}</style>
        </div>
    )
}
