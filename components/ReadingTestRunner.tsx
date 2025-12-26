'use client'

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Bell, ChevronLeft, ChevronRight, Maximize2, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

// ===================== TYPE DEFINITIONS ===========================
// Siz taqdim etgan JSON tuzilmasiga mos keluvchi TypeScript turlari

type QuestionWithMeta = {
    id: number;
    pre?: string;
    post?: string;
    words?: number;
    answer: string;
    type?: "tfng" | "multiple_choice" | "gap_fill"; // Turini cheklaymiz
    statement?: string; // TFNG uchun
    question?: string; // Multiple Choice uchun
    options?: string[]; // Multiple Choice uchun
};

type QuestionGroupExtended = {
    group_id: string;
    type: string;
    instruction: string;
    group_title?: string;
    questions: QuestionWithMeta[];
};

type PassageBlock = {
    id: string;
    text: string;
    image?: string;
}

type Part = {
    part_id: number;
    passage_title: string;
    image?: string;
    passage: PassageBlock[];
    question_groups: QuestionGroupExtended[];
}

export type Test = {
    test_id: string;
    test_title: string;
    total_questions: number;
    level: string; // Navbar uchun qo'shimcha qilingan
    parts: Part[];
};

type FooterProps = {
    totalQuestions: number
    currentQuestion: number
    answers: Record<number, string>
    onQuestionClick: (q: number) => void
    onPrevious: () => void
    onNext: () => void
    currentPartTitle: string
};


// ===================== DUMMY DATA (Sizning JSONingiz asosida) ===========================
const DUMMY_READING_DATA: Test = {
    "test_id": "BASIC_1",
    "test_title": "The Importance of Clean Water",
    "total_questions": 13,
    "level": "Basic", // Qo'shilgan
    "parts": [
        {
            "part_id": 1,
            "passage_title": "The Importance of Clean Water",
            "image": "/reading-images/basic1.svg",
            "passage": [
                {
                    "id": "p1",
                    "text": "Clean water is essential for human health and daily life. People use water for drinking, cooking, cleaning, and farming. In many parts of the world, access to clean water is limited due to pollution and poor sanitation. Drinking contaminated water can cause serious diseases such as diarrhea and cholera, especially among children and elderly people. Governments and international organizations are working to improve water quality through better infrastructure and public education."
                }
            ],
            "question_groups": [
                {
                    "group_id": "1-4",
                    "type": "tfng",
                    "instruction": "Do the statements agree with the passage?",
                    "questions": [
                        { "id": 1, "statement": "Clean water is important for everyday life.", "answer": "TRUE", "type": "tfng" },
                        { "id": 2, "statement": "Water is mainly used for entertainment.", "answer": "FALSE", "type": "tfng" },
                        { "id": 3, "statement": "Children are more vulnerable to water-related diseases.", "answer": "TRUE", "type": "tfng" },
                        { "id": 4, "statement": "All countries have equal access to clean water.", "answer": "NOT GIVEN", "type": "tfng" }
                    ]
                },
                {
                    "group_id": "5-8",
                    "type": "multiple_choice",
                    "instruction": "Choose the correct answer.",
                    "questions": [
                        {
                            "id": 5,
                            "question": "What is the main topic of the passage?",
                            "options": ["Water sports", "The importance of clean water", "River pollution in cities", "Weather conditions"],
                            "answer": "The importance of clean water",
                            "type": "multiple_choice"
                        },
                        {
                            "id": 6,
                            "question": "What limits access to clean water?",
                            "options": ["Lack of rain", "Poor sanitation and pollution", "Too many rivers", "Cold temperatures"],
                            "answer": "Poor sanitation and pollution",
                            "type": "multiple_choice"
                        },
                        {
                            "id": 7,
                            "question": "Which group is most affected by unsafe water?",
                            "options": ["Teenagers", "Office workers", "Children and elderly people", "Athletes"],
                            "answer": "Children and elderly people",
                            "type": "multiple_choice"
                        },
                        {
                            "id": 8,
                            "question": "Who is helping to solve water problems?",
                            "options": ["Only local families", "Private companies", "Governments and international organizations", "Farmers"],
                            "answer": "Governments and international organizations",
                            "type": "multiple_choice"
                        }
                    ]
                },
                // DIQQAT: Bu yerda sizning JSONdagi gap-fill savollari, savol matni to'g'ri ishlashi uchun tuzatildi.
                {
                    "group_id": "9-13",
                    "type": "gap_fill",
                    "instruction": "Complete the sentences. Choose ONE WORD ONLY.",
                    "questions": [
                        { "id": 9, "pre": "People use water for drinking, cooking, cleaning and", "post": ".", "answer": "farming", "type": "gap_fill" },
                        { "id": 10, "pre": "Dirty water can cause serious", "post": ".", "answer": "diseases", "type": "gap_fill" },
                        { "id": 11, "pre": "Children and elderly people are especially", "post": ".", "answer": "vulnerable", "type": "gap_fill" },
                        { "id": 12, "pre": "Water quality can be improved through better", "post": ".", "answer": "infrastructure", "type": "gap_fill" },
                        { "id": 13, "pre": "Education helps people use water", "post": ".", "answer": "safely", "type": "gap_fill" }
                    ]
                }
            ]
        }
    ]
};


// ===================== NAVBAR COMPONENT ===========================
const IeltsNavbar = ({
    timeLeft, onStart, onPause, paused, onFullscreen, onBack, level, theme, onToggleTheme
}: {
    timeLeft: number, onStart: () => void, onPause: () => void, paused: boolean, onFullscreen: () => void, onBack: () => void, level: string, theme: "light" | "dark", onToggleTheme: () => void
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    const navClasses = theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300';
    const linkClasses = theme === 'dark' ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900';
    const iconHoverClasses = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';


    return (
        <div className={`h-[50px] flex items-center justify-between px-3 border-b shrink-0 select-none ${navClasses}`}>
            <div className="flex items-center gap-4">
                <button onClick={onBack} className={`flex items-center text-sm transition-colors ${linkClasses}`}>
                    <ChevronLeft size={18} className="mr-1" /> Back
                </button>
                <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded shadow-md">
                    {level}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {formatTime(timeLeft)}
                </div>
                {!paused && timeLeft > 0 ? (
                    <button
                        onClick={onPause}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-sm px-4 py-1.5 rounded-sm transition-colors shadow-md"
                    >
                        PAUSE
                    </button>
                ) : (
                    <button
                        onClick={onStart}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-1.5 rounded-sm transition-colors shadow-md"
                    >
                        {timeLeft === 3600 ? "START" : "RESUME"}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onFullscreen} className={`p-1 rounded-full ${linkClasses} ${iconHoverClasses}`}>
                    <Maximize2 size={20} />
                </button>
                <button className={`p-1 rounded-full ${linkClasses} ${iconHoverClasses}`}>
                    <Bell size={20} />
                </button>
                <button
                    onClick={() => console.log("Settings opened")} // Placeholder
                    className={`p-1 rounded-full ${linkClasses} ${iconHoverClasses}`}
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={onToggleTheme}
                    className={`p-1 rounded-full ${linkClasses} ${iconHoverClasses} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                >
                    {theme === 'dark' ? '🌙' : '☀️'}
                </button>
            </div>
        </div>
    )
}


// ======================== FOOTER COMPONENT ============================
const IeltsFooter = ({
    totalQuestions, currentQuestion, answers, onQuestionClick, onPrevious, onNext,
}: FooterProps) => {
    const activeQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1)

    return (
        <div className="bg-white border-t border-gray-300 h-[50px] flex items-center justify-between px-4 shrink-0 select-none shadow-inner z-10">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar mask-gradient">
                <div className="text-sm font-semibold text-gray-600 px-3 py-1.5 border-r border-gray-300 whitespace-nowrap">
                    Review
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ maxWidth: '60vw' }}>
                    {activeQuestions.map((num) => {
                        const isAnswered = answers[num] && answers[num].trim() !== ""
                        const isCurrent = num === currentQuestion

                        return (
                            <button
                                key={num}
                                onClick={() => onQuestionClick(num)}
                                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-sm border-2 transition-all
                                    ${!isCurrent && !isAnswered ? "border-gray-400 bg-white hover:bg-gray-100 text-gray-700" : ""}
                                    ${isAnswered && !isCurrent ? "border-green-600 bg-green-600 text-white hover:bg-green-700" : ""}
                                    ${isCurrent ? "border-blue-600 bg-blue-600 text-white shadow-md scale-110 z-10" : ""}
                                `}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-gray-500 hidden md:inline">
                    Question {currentQuestion} of {totalQuestions}
                </span>

                <div className="flex gap-1 border-l border-gray-300 pl-4">
                    <button
                        onClick={onPrevious}
                        disabled={currentQuestion === 1}
                        className="p-2 bg-gray-200 border border-gray-400 rounded-sm hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={onNext}
                        disabled={currentQuestion === totalQuestions}
                        className="p-2 bg-blue-600 border border-blue-600 rounded-sm hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}


// ========================== CLIENT RUNNER COMPONENT ===============================
export default function ReadingTestRunner({ readingData = DUMMY_READING_DATA }: { readingData?: Test }) {
    const router = useRouter()

    const [timeLeft, setTimeLeft] = useState(3600)
    const [running, setRunning] = useState(false)
    const [paused, setPaused] = useState(false)
    const [leftWidth, setLeftWidth] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [answers, setAnswers] = useState<Record<number, string>>({})

    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [currentPartIndex, setCurrentPartIndex] = useState(0)

    const currentPart = readingData.parts[currentPartIndex] || readingData.parts[0]

    // Fullscreen listener
    useEffect(() => {
        function handleFsChange() {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFsChange)
        return () => document.removeEventListener("fullscreenchange", handleFsChange)
    }, [])

    // ========== TIMER OPTIMIZED ============
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined

        if (running && !paused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setRunning(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [running, paused, timeLeft])

    const handleStart = () => {
        setRunning(true)
        setPaused(false)
    }

    const handlePause = () => {
        setPaused((prev) => !prev)
    }

    // ========== FULLSCREEN ============
    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.error(e))
        } else {
            document.exitFullscreen()
        }
    }

    // ========== BACK (Placeholder for navigation) ============
    const handleBack = () => {
        if (running && timeLeft > 0 && timeLeft < 3600) {
            if (confirm("Test ketmoqda. Haqiqatan ham chiqmoqchimisiz?")) {
                router.push("/") // O'zingizning to'g'ri yo'lingizga o'zgartiring
            }
        } else {
            router.push("/") // O'zingizning to'g'ri yo'lingizga o'zgartiring
        }
    }

    // ========== SETTINGS & THEME ============
    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light")
    }

    useEffect(() => {
        if (theme === "dark") {
            document.body.classList.add("bg-black", "text-white")
            document.body.classList.remove("bg-white", "text-black")
        } else {
            document.body.classList.add("bg-white", "text-black")
            document.body.classList.remove("bg-black", "text-white")
        }
    }, [theme])


    // ========== DRAG PANEL ============
    const startDrag = () => setIsDragging(true)

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
        return () => {
            window.removeEventListener("mousemove", onDrag)
            window.removeEventListener("mouseup", stopDrag)
        }
    }, [isDragging, onDrag])


    // ========== QUESTIONS NAVIGATION AND ANSWERING ============
    const handleAnswerChange = (id: number, v: string) => {
        setAnswers(prev => ({ ...prev, [id]: v }))
    }

    const handleQuestionClick = (num: number) => {
        setCurrentQuestion(num)
        const element = inputRefs.current[num]
        if (element) {
            // Scroll to the question block if needed
            const questionBlock = element.closest('li')
            if (questionBlock) {
                 questionBlock.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            // Focus on the input/radio button 
            element.focus({ preventScroll: true })
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 1) handleQuestionClick(currentQuestion - 1)
    }

    const handleNext = () => {
        if (currentQuestion < readingData.total_questions) handleQuestionClick(currentQuestion + 1)
    }

    // ================== UI ====================
    const themeBg = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900';
    const leftPanelBg = theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300';
    const rightPanelBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';

    return (
        <div className={`flex flex-col h-screen w-full overflow-hidden ${themeBg}`}>
            
            {!isFullscreen && (
                <IeltsNavbar
                    timeLeft={timeLeft}
                    onStart={handleStart}
                    onPause={handlePause}
                    paused={paused}
                    onFullscreen={handleFullscreen}
                    onBack={handleBack}
                    level={readingData.level || "Basic"}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />
            )}

            <div ref={containerRef} className="flex flex-1 overflow-hidden relative w-full">
                
                {/* LEFT PANEL: All Parts & Passages */}
                <div style={{ width: `${leftWidth}%` }} className={`h-full overflow-y-auto border-r transition-colors ${leftPanelBg} custom-scrollbar`}>
                    <div className="p-6 pb-20">
                        <h2 className="text-xl font-bold mb-6 text-center border-b pb-4">{readingData.test_title}</h2>
                        <div className="mb-10">
                            <h3 className="font-bold text-lg mb-3 bg-gray-200 dark:bg-gray-700 p-2 rounded">
                                Part {currentPartIndex + 1}: {currentPart.passage_title}
                            </h3>
                            {currentPart.image && (
                                <div className="mb-4">
                                    <img
                                        src={currentPart.image}
                                        alt={currentPart.passage_title}
                                        className="w-full max-h-80 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
                                    />
                                </div>
                            )}
                            <div className={`space-y-4 leading-relaxed text-justify ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                {currentPart.passage.map(p => (
                                    <p key={p.id}>{p.text}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESIZER */}
                <div
                    onMouseDown={startDrag}
                    className={`w-[10px] cursor-col-resize flex flex-col justify-center items-center z-20 hover:bg-blue-400 transition-colors ${
                        theme === 'dark' ? 'bg-gray-800 border-l border-r border-gray-700' : 'bg-gray-200 border-l border-r border-gray-300'
                    } ${isDragging ? "bg-blue-500 w-[14px]" : ""}`}
                >
                    <div className="flex flex-col gap-1 opacity-50">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL: Questions for current Part */}
                <div style={{ width: `${100 - leftWidth}%` }} className={`h-full overflow-y-auto custom-scrollbar ${rightPanelBg}`}>
                    <div className="p-6 pb-20">
                        <div className="mb-10">
                            <h3 className="font-bold text-xl mb-6 text-blue-600 dark:text-blue-400 border-b border-gray-300 pb-2">
                                Part {currentPartIndex + 1} Questions
                            </h3>
                            {currentPart.question_groups.map((group: QuestionGroupExtended, gidx) => ( 
                                <div key={gidx} className="mb-6 bg-white dark:bg-gray-900 p-4 rounded shadow-sm">
                                    
                                    {/* INSTRUCTION */}
                                    {group.instruction && (
                                        <p className="text-base mb-4 font-medium text-red-700 dark:text-red-400 border-l-4 border-red-400 pl-3 py-1 bg-red-50 dark:bg-gray-700/50">
                                            {group.instruction}
                                        </p>
                                    )}
                                    
                                    <ul className="space-y-6">
                                        {group.questions.map((q: QuestionWithMeta) => {
                                            const isCurrent = currentQuestion === q.id
                                            
                                            // Agar savol turi aniq berilmagan bo'lsa, uni 'gap_fill' deb olamiz
                                            const type = q.type || 'gap_fill' 
                                            let optionsToShow = q.options 
                                            
                                            // True/False/Not Given uchun default variantlar
                                            if (type === 'tfng' && (!optionsToShow || optionsToShow.length === 0)) {
                                                optionsToShow = ['TRUE', 'FALSE', 'NOT GIVEN']
                                            }
                                            
                                            // Radio tugmasining qiymatini olish
                                            const getOptionValue = (opt: string) => opt.split('.')[0].trim() || opt
                                            
                                            // Savol matnining rangi
                                            const questionTextColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';

                                            return (
                                                <li
                                                    key={q.id}
                                                    className={`text-base leading-8 ${questionTextColor} ${isCurrent ? 'bg-yellow-50 dark:bg-gray-800 -mx-2 px-2 rounded border-l-4 border-blue-500' : ''}`}
                                                >
                                                    <span className="mr-2 font-mono text-gray-500">{q.id}.</span>
                                                    
                                                    {type === 'gap_fill' ? (
                                                        // Bo'sh joyni to'ldirish UI
                                                        <>
                                                            <span>{q.pre}</span>
                                                            <div className="inline-block relative mx-2 align-middle">
                                                                <input
                                                                    ref={(el) => { inputRefs.current[q.id] = el }}
                                                                    type="text"
                                                                    value={answers[q.id] || ""}
                                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                    onFocus={() => setCurrentQuestion(q.id)}
                                                                    autoComplete="off"
                                                                    className={`
                                                                        h-8 border-b-2 px-2 text-center font-bold outline-none transition-all
                                                                        bg-transparent min-w-[120px]
                                                                        ${isCurrent ? 'border-blue-600' : 'border-gray-400 hover:border-gray-600'}
                                                                        ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
                                                                    `}
                                                                />
                                                            </div>
                                                            <span>{q.post}</span>
                                                        </>
                                                    ) : (
                                                        // Ko'p tanlovli yoki T/F/NG UI
                                                        <>
                                                            {q.statement && <span className="block mb-2">{q.statement}</span>}
                                                            {q.question && <span className="block mb-2 font-semibold">{q.question}</span>}

                                                            <div className="space-y-2 ml-2">
                                                                {optionsToShow?.map((opt, idx) => {
                                                                    const optionValue = getOptionValue(opt)
                                                                    const isSelected = answers[q.id] === optionValue
                                                                    return (
                                                                        <label 
                                                                            key={idx} 
                                                                            className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${
                                                                                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                                                            }`}
                                                                        >
                                                                            <input
                                                                                // Savol qismida input elementiga ref bog'lash orqali focus qilish imkoniyati
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
                                                        </>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                            {/* Part switcher (boshqa qismlarga o'tish) */}
                            <div className="mt-8 flex flex-wrap gap-2 justify-end">
                                {readingData.parts.map((part, idx) => (
                                    <button
                                        key={part.part_id}
                                        onClick={() => setCurrentPartIndex(idx)}
                                        className={`px-3 py-1 rounded-md text-sm font-semibold shadow ${
                                            idx === currentPartIndex
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Part {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <IeltsFooter
                totalQuestions={readingData.total_questions}
                currentQuestion={currentQuestion}
                answers={answers}
                onQuestionClick={handleQuestionClick}
                onPrevious={handlePrevious}
                onNext={handleNext}
                currentPartTitle={currentPart.passage_title}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
                /* O'chirilgan mask-gradient: XSS xavfidan qochish uchun */
            `}</style>
        </div>
    )
}