"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"

// --- READING DATA: Matn va Savollar --- TimeLine
const readingData = {
  title: "The History of Penicillin Discovery",
  sections: [
    { id: 'A', content: "The Scottish bacteriologist Dr Alexander Fleming (1881-1955) is credited with the discovery of penicillin in London in 1928. He had been working at St Mary’s Hospital on the bacteriology of septic wounds. As a medic during World War I, he had witnessed the deaths of many wounded soldiers from infection and he had observed that the use of harsh antiseptics, rather than healing the body, actually harmed the blood corpuscles that destroy bacteria." },
    { id: 'B', content: "In his search for effective antimicrobial agents, Fleming was cultivating staphylococcus bacteria in Petri dishes containing agar. Before going on holiday in the summer of 1928, he piled up the agar plates to make room for someone else to use his workbench in his absence and left the windows open. When he returned to work two weeks later, Fleming noticed mould growing on those culture plates that had not been fully immersed in sterilising agent. This was not an unusual phenomenon, except in this case the particular mould seemed to have killed the staphylococcus aureus immediately surrounding it. He realised that this mould had potential." },
    { id: 'C', content: "Fleming consulted a mycologist called C J La Touche, who occupied a laboratory downstairs containing many mould specimens (possibly the source of the original contamination), and they concluded it was the Penicillium genus of ascomycetous fungi. Fleming continued to experiment with the mould on other pathogenic bacteria, finding that it successfully killed a large number of them. Importantly, it was also non-toxic, so here was a bacteria-destroying agent that could be used as an antiseptic in wounds without damaging the human body. However, he was unsuccessful in his attempts to isolate the active antibacterial element, which he called penicillin. In 1929, he wrote a paper on his findings, published in the British Journal of Experimental Pathology, but it failed to kindle any interest at the time." },
    { id: 'D', content: "In 1938, Dr Howard Florey, a professor of pathology at Oxford University, came across Fleming’s paper. In collaboration with his colleague Dr Ernst Chain, and other skilled chemists, he worked on producing a usable drug. They experimented on mice infected with streptococcus. Those untreated died, while those injected with penicillin survived. It was time to test the drug on humans but they could not produce enough – it took 2,000 litres of mould culture fluid to acquire enough penicillin to treat a single patient. Their first case in 1940, an Oxford police officer who was near death as a result of infection by both staphylococci and streptococci, rallied after five days of treatment but, when the supply of penicillin ran out, he eventually died." },
    { id: 'E', content: "In 1941, Florey and biochemist Dr Norman Heatley went to the United States to team up with American scientists with a view to finding a way of making large quantities of the drug. It became obvious that Penicillium notatum would never generate enough penicillin for effective treatments so they began to look for a more productive species. One day a laboratory assistant turned up with a melon covered in mould. This fungus was Penicillium chrysogeum, which produced 200 times more penicillin than Fleming’s original species but, with further enhancement and filtration, it was induced to yield 1,000 times as much as Penicillium notatum. Manufacture could begin in earnest." },
    { id: 'F', content: "The standardisation and large-scale production of the penicillin drug during World War II and its availability for treating wounded soldiers undoubtedly saved many lives. Penicillin proved to be very effective in the treatment of pneumococcal pneumonia – the death rate in WWII was 1% compared to 18% in WWI. It has since proved its worth in the treatment of many life-threatening infections such as tuberculosis, meningitis, diphtheria and several sexually-transmitted diseases." },
    { id: 'G', content: "Fleming has always been acknowledged as the discoverer of penicillin. However, the development of a commercial penicillin drug was due to the skill of chemical scientists Florey, Chain and others who overcame the difficulties of converting it into a usable form. Fleming and Florey received knighthoods in 1944 and they, together with Chain, were awarded the Nobel Prize in Physiology or Medicine in 1945. Heatley’s contribution seems to have been overlooked until, in 1990, he was awarded an honorary doctorate of medicine by Oxford University – the first in its 800-year history." },
    { id: 'H', content: "Fleming was mindful of the dangers of resistance to penicillin early on and he expressly warned on many occasions against overuse of the drug, because this would lead to bacterial resistance. Ironically, the occurrence of resistance is pushing the drive today to find new, more powerful antibiotics." },
  ],
  // IELTS List of Headings uchun sarlavhalar ro'yxati
  headingsList: [
    { label: 'i', text: "Identifying the mould and a temporary setback" },
    { label: 'ii', text: "The development of a commercial drug" },
    { label: 'iii', text: "A successful solution to a production issue" },
    { label: 'iv', text: "A lucky observation" },
    { label: 'v', text: "The origins of the discovery" },
    { label: 'vi', text: "The initial human trials and limited supply" },
    { label: 'vii', text: "The acknowledgement of the contributors" },
    { label: 'viii', text: "A warning for the future" },
    
  ],
  

  
}

// lg:col-span-2 div ichiga, List of Headings Instructions blokidan keyin qo'shing
// (List of Headings Instructions tugagan joy)

{/* Gap Fill / Timeline Completion Instructions (7-13 savollar uchun) */}
<div className="bg-orange-50 rounded-lg border border-orange-200 p-4 sm:p-6">
    <h3 className="font-bold text-orange-800 mb-3 text-base sm:text-lg">Questions 7-13: Completion</h3>
    <p className="text-sm text-orange-700 mb-2">Complete the sentences or the table below. Write **NO MORE THAN THREE WORDS** for each answer.</p>
    
    {/* Timeline qismini kiritamiz (chunki savollar ichida buni ham ko'rsatish talab qilingan) */}
    <div className="text-xs sm:text-sm text-slate-800 space-y-1 mt-3 p-3 bg-white rounded-md border border-orange-100">
        <p className="font-bold text-base">Timeline (11-13):</p>
        <p>1928 Fleming’s discovery of penicillin</p>
        <p>1929 Fleming’s research published</p>
        <p>1940 The first human subject <span className="font-bold text-red-600">11. ……………….</span></p>
        {/* ... qolgan timeline qismi, matnga mos keladi ... */}
    </div>
</div>
// h4
{/* TRUE/FALSE/NOT GIVEN Instructions (14-17 savollar uchun) */}
<div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-6">
    <h3 className="font-bold text-green-800 mb-3 text-base sm:text-lg">Questions 14-17: True/False/Not Given</h3>
    <p className="text-sm text-green-700 mb-4">Do the following statements agree with the information in the text?</p>
    <ul className="list-disc list-inside text-sm text-green-700 ml-4 space-y-1">
        <li>**TRUE** if the statement agrees with the information</li>
        <li>**FALSE** if the statement contradicts the information</li>
        <li>**NOT GIVEN** if there is no information on this</li>
    </ul>
</div>

{/* Reading Passage Content bloki shu yerdan boshlanadi */}
<div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-6 max-h-[80vh] overflow-y-auto"/>
//...


// Savollar ro'yxatini yangilash (Headings Match 1-6, Gap-filling 7-10)
const questions = [
  // Savollar 1-6: List of Headings (Matn bo'limini sarlavhaga moslash)
  { id: 1, type: "heading-match", sectionId: 'A', question: "Section A", correctAnswer: "v" }, // v. The origins of the discovery
  { id: 2, type: "heading-match", sectionId: 'B', question: "Section B", correctAnswer: "iv" }, // iv. A lucky observation
  { id: 3, type: "heading-match", sectionId: 'C', question: "Section C", correctAnswer: "i" },  // i. Identifying the mould and a temporary setback
  { id: 4, type: "heading-match", sectionId: 'D', question: "Section D", correctAnswer: "vi" }, // vi. The initial human trials and limited supply
  { id: 5, type: "heading-match", sectionId: 'E', question: "Section E", correctAnswer: "iii" }, // iii. A successful solution to a production issue
  { id: 6, type: "heading-match", sectionId: 'F', question: "Section F", correctAnswer: "ii" }, // ii. The development of a commercial drug
  
  // Savollar 7-10: Sentence Completion (Katalk to'ldirish, input)
  { id: 7, type: "gap-fill", question: "Fleming observed that harsh antiseptics caused harm to the body's _________.", correctAnswer: "blood corpuscles", wordLimit: 3 },
  { id: 8, type: "gap-fill", question: "The specific mould was identified as the _________ genus of fungi.", correctAnswer: "Penicillium", wordLimit: 1 },
  { id: 9, type: "gap-fill", question: "Due to the lack of penicillin, the first patient, an Oxford police officer, eventually _________.", correctAnswer: "died", wordLimit: 1 },
  { id: 10, type: "gap-fill", question: "The increased availability of penicillin during WWII saved many lives and reduced the death rate from pneumococcal pneumonia to _________.", correctAnswer: "1%", wordLimit: 1 },

  //Savollar 10-13
  { id: 11, type: "gap-fill", question: "1940 The first human subject 11 ……………….", correctAnswer: "died", wordLimit: 2 },
  { id: 12, type: "gap-fill", question: "1941 Collaboration with 12 ……………….", correctAnswer: "American scientists", wordLimit: 3 },
  { id: 13, type: "gap-fill", question: "1945 Three of them share a 13 ……………….", correctAnswer: "Nobel Prize", wordLimit: 2 },



// Savollar 14-16: True/False/Not Given
{ 
  id: 14, 
  type: "tfn", 
  question: "Fleming was specifically looking for a way to use antiseptics safely on human blood corpuscles.", 
  correctAnswer: "False", // Matn (A) deydi: "he had observed that the use of harsh antiseptics... actually harmed the blood corpuscles." - u ziyon yetkazishini kuzatgan, xavfsiz foydalanish yo'lini qidirgani aytilmagan.
  sectionId: 'A' 
},
{ 
  id: 15, 
  type: "tfn", 
  question: "The first successful mass-production method used the Penicillium notatum species of mould.", 
  correctAnswer: "False", // Matn (E) deydi: Penicillium notatum "would never generate enough," keyin Penicillium chrysogeum topilgan.
  sectionId: 'E' 
},
{ 
  id: 16, 
  type: "tfn", 
  question: "The development of the commercial penicillin drug was considered more important than its initial discovery.", 
  correctAnswer: "Not Given", // Matn (G) ikkalasining ham qadrini tan oladi, lekin qaysi biri "muhimroq" ekanini taqqoslamaydi.
  sectionId: 'G' 
},
{ 
  id: 17, 
  type: "tfn", 
  question: "The development of the commercial penicillin drug was considered more important than its initial discovery.", 
  correctAnswer: "Not Given", // Matn (G) ikkalasining ham qadrini tan oladi, lekin qaysi biri "muhimroq" ekanini taqqoslamaydi.
  sectionId: 'G' 
}
//lg:col-span-2

]

{/* TRUE/FALSE/NOT GIVEN Instructions (14-17 savollar uchun) */}
<div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-6">
    <h3 className="font-bold text-green-800 mb-3 text-base sm:text-lg">Questions 14-17: True/False/Not Given</h3>
    <p className="text-sm text-green-700 mb-4">Do the following statements agree with the information in the text?</p>
    <ul className="list-disc list-inside text-sm text-green-700 ml-4 space-y-1">
        <li>**TRUE** if the statement agrees with the information</li>
        <li>**FALSE** if the statement contradicts the information</li>
        <li>**NOT GIVEN** if there is no information on this</li>
    </ul>
</div>

//List


// Sarlavhalar ro'yxatini tez qidirish uchun Map
const headingsMap: Record<string, string> = readingData.headingsList.reduce((acc, heading) => {
  acc[heading.label] = heading.text;
  return acc;
}, {} as Record<string, string>);

// --- ASOSIY KOMPONENT ---
export default function ReadingPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answered, setAnswered] = useState<Record<number, any>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; correct?: string }>({ show: false, isCorrect: false })
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Avtomatik ravishda natijalarni ko'rsatish
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentQ = questions[currentQuestion]

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    // Javobni saqlash: 
    // Key - savolning indeksi (0 dan boshlanadi), Value - foydalanuvchi javobi
    const newAnswered = { ...answered, [currentQuestion]: answer }
    setAnswered(newAnswered)
  }

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return
    let isCorrect = false;
    const correctAns = currentQ.correctAnswer.toLowerCase().trim();
    const userAnswer = selectedAnswer.toLowerCase().trim();

    if (currentQ.type === 'gap-fill') {
        // Gap-fill savollari uchun aniq moslikni tekshirish
        // (Ko'p so'zli javoblar uchun oddiygina to'g'ri javobni olamiz)
        isCorrect = (userAnswer === correctAns);
    } else {
        // Headings Match savollari uchun
        isCorrect = (userAnswer === correctAns);
    }
    
    setFeedback({ show: true, isCorrect, correct: currentQ.correctAnswer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answered[currentQuestion + 1] || "")
      setFeedback({ show: false, isCorrect: false })
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answered[currentQuestion - 1] || "")
      setFeedback({ show: false, isCorrect: false })
    }
  }

  const answeredCount = Object.keys(answered).length
  const progressPercentage = (answeredCount / questions.length) * 100

  // --- NATIJALAR SAHIFASI ---
  if (showResults) {
    let correctAnswers = 0;
    
    Object.entries(answered).forEach(([idx, ans]) => {
      const qIndex = Number.parseInt(idx);
      const question = questions[qIndex];
      const correctAns = question.correctAnswer.toLowerCase().trim();
      const userAnswer = ans.toLowerCase().trim();

      if (userAnswer === correctAns) {
        correctAnswers++;
      }
    });

    return (
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Navigation />
        <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">Test Complete!</h1>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
              <p className="text-6xl sm:text-7xl font-bold text-blue-600 mb-4">
                {correctAnswers}/{questions.length}
              </p>
              <p className="text-lg sm:text-xl text-slate-600">
                You answered {correctAnswers} out of {questions.length} questions correctly.
              </p>
            </div>
            {/* Natijalarni ko'rib chiqish tugmasi */}
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setSelectedAnswer(answered[0] || "");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 mr-4"
            >
              Review Answers
            </Button>
            {/* Qayta ishlash tugmasi */}
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Retake Test
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // --- ASOSIY READING SAHIFASI ---
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">IELTS Reading: {readingData.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm sm:text-base">
              <Clock size={20} />
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Content Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
    
    {/* Passage (wider - Matn) */}
    <div className="lg:col-span-2 space-y-6">
        
        {/* List of Headings Instructions (1-6 savollar uchun) */}
        {/* SHART: currentQuestion 0 dan 5 gacha (1-6 savollar) bo'lsa ko'rsatiladi */}
        {currentQuestion >= 0 && currentQuestion <= 5 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
                <h3 className="font-bold text-blue-800 mb-3 text-base sm:text-lg">Questions 1-6: List of Headings</h3>
                <p className="text-sm text-blue-700 mb-4">Match the correct heading (i-viii) to the paragraphs (A-F).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800">
                    {readingData.headingsList.map((heading) => (
                        <div key={heading.label} className="p-2 border border-slate-300 rounded-md bg-white">
                            <span className="font-bold text-blue-600 mr-2">{heading.label.toUpperCase()}.</span>
                            {heading.text}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Gap Fill / Timeline Completion Instructions (7-13 savollar uchun) */}
        {/* SHART: currentQuestion 6 dan 12 gacha (7-13 savollar) bo'lsa ko'rsatiladi */}
        {currentQuestion >= 6 && currentQuestion <= 12 && (
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 sm:p-6">
                <h3 className="font-bold text-orange-800 mb-3 text-base sm:text-lg">Questions 7-13: Completion</h3>
                <p className="text-sm text-orange-700 mb-2">Complete the sentences or the table below. Write **NO MORE THAN THREE WORDS** for each answer.</p>
                
                {/* Timeline qismi faqat 11-13 savollarda ko'rinishi mumkin */}
                {(currentQuestion >= 10 && currentQuestion <= 12) && ( 
                    <div className="text-xs sm:text-sm text-slate-800 space-y-1 mt-3 p-3 bg-white rounded-md border border-orange-100">
                        <p className="font-bold text-base">Timeline (11-13):</p>
                        <p>1928 Fleming’s discovery of penicillin</p>
                        <p>1929 Fleming’s research published</p>
                        <p>1940 The first human subject <span className="font-bold text-red-600">11. ……………….</span></p>
                        <p>1941 Collaboration with <span className="font-bold text-red-600">12. ……………….</span></p>
                        <p>1945 Three of them share a <span className="font-bold text-red-600">13. ……………….</span></p>
                    </div>
                )}
            </div>
        )}

        {/* TRUE/FALSE/NOT GIVEN Instructions (14-17 savollar uchun) */}
        {/* SHART: currentQuestion 13 dan 16 gacha (14-17 savollar) bo'lsa ko'rsatiladi */}
        {currentQuestion >= 13 && currentQuestion <= 16 && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-6">
                <h3 className="font-bold text-green-800 mb-3 text-base sm:text-lg">Questions 14-17: True/False/Not Given</h3>
                <p className="text-sm text-green-700 mb-4">Do the following statements agree with the information in the text?</p>
                <ul className="list-disc list-inside text-sm text-green-700 ml-4 space-y-1">
                    <li>**TRUE** if the statement agrees with the information</li>
                    <li>**FALSE** if the statement contradicts the information</li>
                    <li>**NOT GIVEN** if there is no information on this</li>
                </ul>
            </div>
        )}
                {/* Reading Passage Content */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="font-bold text-slate-900 mb-4 text-base sm:text-lg">Reading Passage</h3>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                        {readingData.sections.map((section) => (
                            <div key={section.id} className="relative group p-2 rounded-md hover:bg-slate-100 transition-colors">
                                {/* Matn bo'limi belgisi */}
                                <span className="absolute left-[-20px] top-1 font-bold text-lg text-blue-500">{section.id}</span>
                                <p className="ml-5">{section.content}</p>
                                {/* O'ng tomonda Heading Match javobini ko'rsatish (agar javob berilgan bo'lsa) */}
                                {(questions.slice(0, 6).find(q => q.sectionId === section.id && answered[questions.indexOf(q)])) && (
                                    <div className="absolute right-0 top-0 bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-bl-lg text-xs">
                                        Answered: {answered[questions.findIndex(q => q.sectionId === section.id)].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Questions (narrower - Savollar qismi) */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 sticky top-4">
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs sm:text-sm text-slate-600 font-semibold">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                                {Object.keys(answered).length}/{questions.length} Answered
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Hozirgi savol turi bo'yicha sarlavha */}
                    <h3 className="font-bold text-slate-900 mb-4 text-base sm:text-lg">
                        {currentQ.type === 'heading-match' ? `Questions 1-6 (Headings)` : `Questions 7-10 (Completion)`}
                    </h3>
                    
                    {/* Hozirgi savol matni */}
                    <h4 className="text-sm sm:text-base text-slate-700 mb-4">
                        {currentQuestion + 1}. {currentQ.question} 
                        {currentQ.type === 'gap-fill' && currentQ.wordLimit && 
                            <span className="text-red-500 font-semibold ml-2 text-xs">(Max {currentQ.wordLimit} word{currentQ.wordLimit > 1 ? 's' : ''})</span>
                        }
                    </h4>

                    {/* SAVOL TURI: LIST OF HEADINGS (1-6) */}
                    {currentQ.type === "heading-match" && (
                        <div className="space-y-3 mb-6">
                            {readingData.headingsList.map((heading) => (
                                <label
                                    key={heading.label}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedAnswer.toLowerCase() === heading.label.toLowerCase() ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}
                                >
                                    <input
                                        type="radio"
                                        name="heading_answer"
                                        value={heading.label}
                                        checked={selectedAnswer.toLowerCase() === heading.label.toLowerCase()}
                                        onChange={() => handleSelectAnswer(heading.label)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-3 text-sm sm:text-base text-slate-700">
                                        <span className="font-bold text-blue-600 mr-1">{heading.label.toUpperCase()}.</span>
                                        {heading.text}
                                    </span>
                                </label>// Asosiy
                            ))}
                        </div>
                    )}
                    
                    {/* SAVOL TURI: GAP FILL (7-10) */}
                    {currentQ.type === "gap-fill" && (
                        <input
                            type="text"
                            placeholder="Type your answer (Max 3 words)..."
                            value={selectedAnswer}
                            onChange={(e) => handleSelectAnswer(e.target.value)}
                            className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm sm:text-base mb-6 focus:border-blue-400 outline-none"
                        />
                    )}


                    {/* SAVOL TURI: TRUE/FALSE/NOT GIVEN (14-17) - Endi shu yerda turishi kerak */}
                    {currentQ.type === "tfn" && (
                        <div className="space-y-3 mb-6">
                            {["True", "False", "Not Given"].map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                        selectedAnswer.toLowerCase() === option.toLowerCase() 
                                            ? "border-green-500 bg-green-50" 
                                            : "border-slate-200 hover:border-green-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="tfn_answer"
                                        value={option}
                                        checked={selectedAnswer.toLowerCase() === option.toLowerCase()}
                                        onChange={() => handleSelectAnswer(option)}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="ml-3 text-sm sm:text-base font-semibold text-slate-700">
                                        {option.toUpperCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    
                    {/* FEEDBACK (Javobni tekshirish natijasi) */}

                    {/* FEEDBACK (Javobni tekshirish natijasi) */}
                    {feedback.show && (
                        <div
                            className={`p-4 rounded-lg mb-6 text-sm sm:text-base ${feedback.isCorrect ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}
                        >
                            <p className={`font-semibold ${feedback.isCorrect ? "text-green-900" : "text-red-900"} flex items-center`}>
                                {feedback.isCorrect ? <CheckCircle size={18} className="mr-2" /> : <XCircle size={18} className="mr-2" />}
                                {feedback.isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                            </p>
                            {!feedback.isCorrect && (
                                <p className="text-slate-700 mt-2">
                                    Correct: <span className="font-bold text-green-700">{feedback.correct}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* NAVIGATSIYA TUGMALARI */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            variant="outline"
                            className="text-xs sm:text-sm py-2 bg-transparent"
                        >
                            <ChevronLeft size={16} className="mr-2" /> Previous
                        </Button>

                        {!feedback.show ? (
                            <Button
                                onClick={handleCheckAnswer}
                                disabled={!selectedAnswer}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                            >
                                {currentQuestion === questions.length - 1 ? "Finish Test" : "Next Question"}{" "}
                                <ChevronRight size={16} className="ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}