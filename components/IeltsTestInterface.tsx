'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, Settings, Maximize2, Minimize2, CheckCircle, XCircle } from "lucide-react"

// --- I. TYPESCRIPT INTERFACES ---

interface PassagePart {
    id: string;
    text: string;
}

interface Question {
    id: number;
    pre?: string; 
    post?: string; 
    words?: number;
    statement?: string; 
    type: 'gap_fill' | 'multiple_choice' | 'tfng'; 
    options?: string[]; 
    answer: string;
}

interface QuestionGroup { 
    group_title: string; 
    instruction?: string; 
    questions: Question[]; 
}

interface TestPart {
    part_id: number;
    passage_title: string;
    passage: PassagePart[];
    question_groups: QuestionGroup[];
}

interface ApiTestDataResponse {
    success: boolean;
    test_id: string;
    test_title: string;
    level: string;
    total_questions: number;
    parts: TestPart[];
}

interface IeltsTestInterfaceProps {
    customData: ApiTestDataResponse; 
}


// --- II. SUB COMPONENTS ---

// 1. IeltsNavbar
interface IeltsNavbarProps {
    timeLeft: number, 
    isRunning: boolean,
    onToggleTimer: () => void,
    onFullscreen: () => void,
    isFullscreen: boolean,
    testTitle: string,
    onBack: () => void,
}

const IeltsNavbar: React.FC<IeltsNavbarProps> = ({ 
    timeLeft, 
    isRunning, 
    onToggleTimer, 
    onFullscreen, 
    isFullscreen, 
    testTitle, 
    onBack,
}) => {
    
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="bg-white text-gray-800 h-[50px] flex items-center justify-between px-3 border-b border-gray-300 shrink-0 select-none">
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft size={18} className="mr-1" /> Back
                </button>
                <div className="bg-red-600 text-white font-bold text-xs px-2 py-1 rounded shadow-md">
                    {testTitle}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="text-xl font-mono font-bold text-gray-900">
                        {formatTime(timeLeft)}
                    </div>
                    <button 
                        onClick={onToggleTimer}
                        className={`font-bold text-sm px-4 py-1.5 rounded-sm transition-colors shadow-md ${
                            isRunning 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        {isRunning ? 'PAUSE' : 'START'}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <button 
                    onClick={onFullscreen} 
                    className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button 
                    className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
            </div>
        </div>
    )
}

// 2. IeltsFooter
interface IeltsFooterProps {
    totalQuestions: number;
    currentQuestion: number;
    answers: Record<number, string>;
    onQuestionClick: (q: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    currentPartTitle: string;
    onCheckAnswers: () => void;
    showResults: boolean;
    score: number;
    totalParts: number;
    currentPartIndex: number;
    onPartChange: (index: number) => void;
}

const IeltsFooter: React.FC<IeltsFooterProps> = ({ 
    totalQuestions, 
    currentQuestion, 
    answers,
    onQuestionClick,
    onPrevious,
    onNext,
    currentPartTitle,
    onCheckAnswers,
    showResults,
    score,
    totalParts,
    currentPartIndex,
    onPartChange
}) => {
    const activeQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1)
    
    return (
        <div className="bg-white border-t border-gray-300 h-[50px] flex items-center justify-between px-4 shrink-0 select-none shadow-inner z-10">
            
            {/* CHAP TOMON: PART NAVIGATSIYASI */}
            <div className="flex items-center gap-4 border-r border-gray-300 pr-4">
                <div className="text-sm font-semibold text-gray-600 px-3 py-1.5 whitespace-nowrap">
                    {currentPartTitle}
                </div>

                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden shadow-sm">
                    {Array.from({ length: totalParts }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => onPartChange(index)}
                            className={`px-3 py-1 text-sm font-bold transition-colors border-r last:border-r-0 ${
                                currentPartIndex === index 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                            }`}
                            title={`Go to Part ${index + 1}`}
                        >
                            Part {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* O'RTA: SAVOL NAVIGATSIYASI */}
            <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar pr-2 flex-1 justify-center">
                <div className="flex gap-1.5">
                    {activeQuestions.map((num) => {
                        const isAnswered = answers[num] && answers[num].trim() !== ''
                        const isCurrent = num === currentQuestion
                        
                        return (
                            <button
                                key={num}
                                onClick={() => onQuestionClick(num)}
                                className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-sm border-2 transition-all shrink-0
                                    ${!isCurrent && !isAnswered ? "border-gray-400 text-gray-700 bg-white hover:bg-gray-100" : ""}
                                    ${!isCurrent && isAnswered ? "border-green-600 text-white bg-green-600 hover:bg-green-700" : ""}
                                    ${isCurrent ? "border-blue-600 text-white bg-blue-600 shadow-md scale-105" : ""}
                                `}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>
                <span className="text-xs text-gray-500 ml-4 hidden sm:inline whitespace-nowrap">Savol: {currentQuestion} / {totalQuestions}</span>
            </div>

            {/* O'NG TOMON: ACTION TUGMALARI */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                {showResults && (
                    <div className="text-sm font-bold text-green-600">
                        Natija: {score} / {totalQuestions}
                    </div>
                )}
                <button 
                    onClick={onCheckAnswers}
                    disabled={showResults}
                    className="bg-green-600 text-white px-4 py-1 rounded-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {showResults ? 'Natija Ko‘rsatildi' : 'Javoblarni Tekshirish'}
                </button>
                <div className="flex gap-1">
                    <button 
                        onClick={onPrevious}
                        disabled={currentQuestion === 1}
                        className="p-2 bg-gray-200 border border-gray-400 rounded-sm hover:bg-gray-300 text-gray-700 disabled:opacity-50 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={onNext}
                        disabled={currentQuestion === totalQuestions}
                        className="p-2 bg-red-600 border border-red-600 rounded-sm hover:bg-red-700 text-white disabled:opacity-50 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}


// --- III. MAIN PAGE COMPONENT (IeltsTestInterface.tsx) ---
export default function IeltsTestInterface({ customData }: IeltsTestInterfaceProps) {
    
    const totalParts = customData.parts.length;

    // --- State'lar ---
    const [timeLeft, setTimeLeft] = useState<number>(3600)
    const [isRunning, setIsRunning] = useState<boolean>(false) 
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [leftWidth, setLeftWidth] = useState<number>(50)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [currentPartIndex, setCurrentPartIndex] = useState<number>(0); 
    const [currentQuestion, setCurrentQuestion] = useState<number>(1)
    const [answers, setAnswers] = useState<Record<number, string>>({}) 
    const [showResults, setShowResults] = useState<boolean>(false) 
    const [score, setScore] = useState<number>(0) 
    
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({}) 

    const currentPart = customData.parts[currentPartIndex];
    
    // Barcha Partlar bo'yicha savollarni yagona massivga jamlash
    const allQuestions: Question[] = useMemo(() => {
        let questionCounter = 1;
        const questions: Question[] = [];
        customData.parts.forEach(part => {
            part.question_groups.forEach(group => {
                group.questions.forEach(q => {
                    questions.push({
                        ...q,
                        id: questionCounter++ // Global ID berish
                    });
                });
            });
        });
        return questions;
    }, [customData.parts]);

    const totalQuestions = allQuestions.length;
    
    // Joriy Partning savol diapazonini topish mantiqi
    const findQuestionRange = (targetPartIndex: number) => {
        let currentQId = 1;
        let startQ = 1;
        let endQ = 0;
        
        for(let i = 0; i < customData.parts.length; i++){
            const part = customData.parts[i];
            let partQCount = part.question_groups.reduce((sum, group) => sum + group.questions.length, 0);
            
            if (i < targetPartIndex) {
                currentQId += partQCount;
            } else if (i === targetPartIndex) {
                startQ = currentQId;
                endQ = currentQId + partQCount - 1;
                break;
            }
        }
        return { startQ, endQ };
    }

    const currentPartRange = findQuestionRange(currentPartIndex);
    const firstQuestionId = currentPartRange.startQ;
    const lastQuestionId = currentPartRange.endQ;


    if (!currentPart) {
        return (
            <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">
                Tahlil qilingan ma'lumotda qism topilmadi.
            </div>
        );
    }
    
    // --- Mantiqiy funksiyalar ---

    const goToPart = (index: number) => {
        if (index >= 0 && index < totalParts) {
            setCurrentPartIndex(index);
            // Yangi qismdagi birinchi savolga o'tish
            const newRange = findQuestionRange(index);
            setCurrentQuestion(newRange.startQ); 
            setShowResults(false);
        }
    }

    // Timer, Fullscreen, Back, Drag funksiyalari (o'zgarishsiz)
    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const toggleTimer = () => {
        setIsRunning(prev => !prev);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error('Fullscreen xatosi:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleBack = () => {
        if (isRunning && timeLeft > 0) {
            if (confirm("Test ketmoqda. Haqiqatan ham chiqmoqchimisiz?")) {
                window.history.back();
            }
        } else {
            window.history.back();
        }
    }
    
    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleQuestionClick = (questionNum: number) => {
        if (questionNum >= 1 && questionNum <= totalQuestions) {
            setCurrentQuestion(questionNum)
            setTimeout(() => {
                const element = inputRefs.current[questionNum]
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element.focus()
                }
            }, 100)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 1) {
            handleQuestionClick(currentQuestion - 1)
        }
    }

    const handleNext = () => {
        if (currentQuestion < totalQuestions) {
            handleQuestionClick(currentQuestion + 1)
        }
    }

    const checkAnswers = () => {
        if (showResults) return; 

        let correctCount = 0;
        allQuestions.forEach(q => {
            const userAnswer = answers[q.id]?.trim().toUpperCase();
            const correctAnswer = q.answer.trim().toUpperCase();
            
            if (userAnswer === correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true);
        setIsRunning(false);
    };

    const startDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const onDrag = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return
        
        const containerRect = containerRef.current.getBoundingClientRect()
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
        
        if (newLeftWidth > 20 && newLeftWidth < 80) {
            setLeftWidth(newLeftWidth)
        }
    }, [isDragging])

    const stopDrag = useCallback(() => {
        setIsDragging(false)
    }, [])

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
    }, [isDragging, onDrag, stopDrag])

    // --- JSX RENDER ---
    return (
        <div className="flex flex-col h-screen w-full bg-gray-100 font-sans overflow-hidden">
            
            {/* Navbar */}
            {!isFullscreen && (
                <IeltsNavbar 
                    timeLeft={timeLeft}
                    isRunning={isRunning}
                    onToggleTimer={toggleTimer}
                    onFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                    testTitle={customData.test_title}
                    onBack={handleBack}
                />
            )}

            {/* Main Split Content Area */}
            <div 
                ref={containerRef} 
                className={`flex flex-1 overflow-hidden relative w-full ${isDragging ? 'select-none' : ''}`}
            >
                
                {/* LEFT PANEL: READING PASSAGE 
                    !!! FAQAT currentPart matni ko'rsatiladi !!!
                */}
                <div 
                    style={{ width: `${leftWidth}%` }} 
                    className="h-full overflow-y-auto bg-white border-r border-gray-300 custom-scrollbar shrink-0"
                >
                    <div className="p-4">
                        
                        <div className="mb-8 p-3 rounded-md shadow-lg border-2 border-blue-400 bg-blue-50">
                            
                            {/* Part sarlavhasi (Faqat joriy Part uchun) */}
                            <div className={`mb-4 pb-2 border-b border-blue-600`}>
                                <h3 className={`font-bold text-xl text-blue-800`}>
                                    {currentPart.passage_title || `Reading Passage ${currentPartIndex + 1}`}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Questions {firstQuestionId}–{lastQuestionId}.
                                </p>
                            </div>

                            {/* Part matnining o'zi (Faqat joriy Part uchun) */}
                            <div className="space-y-4 text-gray-800 text-base leading-relaxed">
                                {currentPart.passage.map((p) => (
                                    <p key={p.id} className="text-justify indent-8">
                                        {p.text}
                                    </p>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                </div>

                {/* RESIZER HANDLE */}
                <div
                    onMouseDown={startDrag}
                    className={`w-[8px] bg-white cursor-col-resize flex flex-col justify-center items-center shrink-0 z-20 border-r border-l border-gray-300 transition-all ${isDragging ? "w-[12px] bg-gray-300" : "hover:bg-gray-200"}`}
                >
                    <div className="flex flex-col gap-1.5 opacity-60">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-gray-400 rounded-full shadow"></div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL: QUESTIONS */}
                <div 
                    style={{ width: `${100 - leftWidth}%` }} 
                    className="h-full overflow-y-auto bg-gray-50 custom-scrollbar shrink-0"
                >
                    <div className="p-4">
                        <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-sm">
                            <h3 className="font-bold text-xl mb-4 text-gray-900">Questions {firstQuestionId}–{lastQuestionId}</h3>
                            
                            <div className="space-y-8">
                                {currentPart.question_groups.map((group, groupIndex) => {
                                    const partQuestions = group.questions;
                                    const currentPartStartQ = findQuestionRange(currentPartIndex).startQ;
                                    
                                    return (
                                        <div key={groupIndex} className="space-y-4">
                                            <h4 className="font-bold text-lg text-gray-900 border-b pb-2 mb-2">
                                                {group.group_title} 
                                            </h4>
                                            
                                            {/* INSTRUCTION */}
                                            {group.instruction && (
                                                <p className="text-sm text-red-700 border-l-4 border-red-300 pl-2 bg-red-50 py-1">
                                                    {group.instruction}
                                                </p>
                                            )}
                                            
                                            <ul className="list-none space-y-4 ml-0">
                                                {partQuestions.map((q, qIndex) => {
                                                    // Global Savol ID'sini hisoblash
                                                    const currentQId = currentPartStartQ + qIndex; 
                                                    
                                                    const isCurrent = currentQuestion === currentQId;
                                                    const userAnswer = answers[currentQId] || ''
                                                    const correctAnswer = q.answer
                                                    const isCorrect = showResults && userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase()
                                                    const isIncorrect = showResults && userAnswer.trim().toUpperCase() !== '' && !isCorrect

                                                    let optionsToShow = q.options;
                                                    
                                                    if (q.type === 'tfng' && !optionsToShow) {
                                                        optionsToShow = ['TRUE', 'FALSE', 'NOT GIVEN'];
                                                    }
                                                    
                                                    if ((q.type === 'multiple_choice' || q.type === 'tfng') && optionsToShow && optionsToShow.every(opt => !opt.match(/^[A-Z]\./))) {
                                                        optionsToShow = optionsToShow.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`);
                                                    }

                                                    const getOptionValue = (opt: string) => opt.split('.')[0].trim().replace(/\.$/, '') || opt;


                                                    return (
                                                        <li 
                                                            key={currentQId}
                                                            className={`text-base text-gray-800 transition-all p-2 rounded ${isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                                        >
                                                            <span className="mr-2 font-mono text-gray-500">{currentQId}.</span>

                                                            {q.type === 'gap_fill' ? (
                                                                // --- Gap-Fill rendering ---
                                                                <>
                                                                    <span className="text-gray-900">
                                                                        {q.pre}
                                                                    </span>
                                                                    <div className="inline-block relative">
                                                                        <input 
                                                                            ref={(el) => { inputRefs.current[currentQId] = el as HTMLInputElement }}
                                                                            type="text" 
                                                                            value={userAnswer}
                                                                            onChange={(e) => handleAnswerChange(currentQId, e.target.value)}
                                                                            onFocus={() => handleQuestionClick(currentQId)}
                                                                            className={`w-32 h-6 border-b-2 border-gray-400 px-1 mx-1 text-center rounded-none focus:outline-none focus:border-blue-600 bg-transparent font-semibold text-blue-800 text-sm transition-all
                                                                                ${showResults ? (isCorrect ? 'border-green-600 bg-green-100' : (isIncorrect ? 'border-red-600 bg-red-100' : '')) : ''}`}
                                                                            placeholder={String(currentQId)} 
                                                                            disabled={showResults} 
                                                                        />
                                                                        {showResults && (
                                                                            <span className="text-xs text-gray-500 ml-2 block sm:inline">
                                                                                (To'g'ri: <span className="font-semibold text-green-700">{correctAnswer}</span>)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-900">
                                                                        {q.post}
                                                                    </span>
                                                                    {showResults && (isCorrect ? <CheckCircle size={16} className="text-green-600 ml-2 inline" /> : (isIncorrect ? <XCircle size={16} className="text-red-600 ml-2 inline" /> : ''))}
                                                                </>
                                                            ) : (
                                                                // --- Multiple Choice / TFNG rendering ---
                                                                <>
                                                                    <span className="text-gray-900 block mb-2 font-normal">
                                                                        {q.statement || q.pre}
                                                                    </span>
                                                                    
                                                                    <div className="space-y-2 ml-4">
                                                                        {optionsToShow?.map((opt, idx) => {
                                                                            const optionValue = getOptionValue(opt);
                                                                            const isOptionCorrect = showResults && correctAnswer.toUpperCase() === optionValue.toUpperCase();
                                                                            const isOptionSelected = userAnswer.toUpperCase() === optionValue.toUpperCase();
                                                                            const isOptionIncorrectlySelected = showResults && isOptionSelected && !isOptionCorrect;
                                                                            
                                                                            return (
                                                                                <label key={idx} className={`flex items-start cursor-pointer p-2 rounded transition-all ${isOptionCorrect ? 'bg-green-50' : isOptionIncorrectlySelected ? 'bg-red-50' : 'hover:bg-gray-100'}`}>
                                                                                    <input
                                                                                        ref={idx === 0 ? (el) => { inputRefs.current[currentQId] = el as HTMLInputElement } : undefined}
                                                                                        type="radio"
                                                                                        name={`q_${currentQId}`}
                                                                                        value={optionValue} 
                                                                                        checked={isOptionSelected}
                                                                                        onChange={(e) => handleAnswerChange(currentQId, e.target.value)}
                                                                                        onFocus={() => handleQuestionClick(currentQId)}
                                                                                        disabled={showResults}
                                                                                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                                                                    />
                                                                                    <span className={`text-gray-800 flex-1 ${isOptionCorrect ? 'font-bold text-green-700' : ''}`}>
                                                                                        {opt.replace(/^[A-Z]\.\s?/, '')} 
                                                                                        {showResults && isOptionCorrect && <CheckCircle size={16} className="text-green-600 ml-2 inline" />}
                                                                                        {showResults && isOptionIncorrectlySelected && <XCircle size={16} className="text-red-600 ml-2 inline" />}
                                                                                    </span>
                                                                                </label>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {showResults && !isCorrect && (
                                                                        <span className="text-xs text-gray-500 block mt-2 pt-2 border-t border-dashed">
                                                                            To'g'ri javob: <span className="font-semibold text-green-700">{correctAnswer}</span>
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <IeltsFooter 
                totalQuestions={totalQuestions}
                currentQuestion={currentQuestion}
                answers={answers}
                onQuestionClick={handleQuestionClick}
                onPrevious={handlePrevious}
                onNext={handleNext}
                currentPartTitle={currentPart.passage_title || `Part ${currentPartIndex + 1}`}
                onCheckAnswers={checkAnswers}
                showResults={showResults}
                score={score}
                totalParts={totalParts}
                currentPartIndex={currentPartIndex}
                onPartChange={goToPart}
            />

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 0;
                    border: 2px solid #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>
        </div>
    )
}