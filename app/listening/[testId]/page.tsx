"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Play, Pause, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"

// Savol turlari uchun interface (agar Typescript qullanilayotgan bo'lsa)
// Interface (o'zgarishsiz)
interface Question {
  id: number;
  type: "mcq" | "short" | "multiple-choice" | "dropdown-select" |"multi-mcq";
  question: string;
  options?: (string | { label: string; text: string })[];
  correct?: string | string[];
  correctAnswer?: string; 
  placeholder?: string; 
  year?: number; 
  displayNumber: string; // Bu maydon majburiy
}


// Interface (displayNumber qo'shilgan)
interface Question {
  id: number;
  type: "mcq" | "short" | "multiple-choice" | "dropdown-select" |"multi-mcq";
  question: string;
  options?: (string | { label: string; text: string })[];
  correct?: string | string[];
  correctAnswer?: string; 
  placeholder?: string; 
  year?: number; 
  displayNumber: string; // Majburiy maydon
}

// Savollar (Barcha options va displayNumber kiritilgan)
const questions: Question[] = [
    {
        id: 1,
        type: "mcq",
        displayNumber: "1",
        question: "Which TWO things does the speaker say about visiting the football stadium with children?",
        options: [
            "Children can get their photo taken with a football player",
            "There is a competition for children today",
            "Parents must stay with their children at all times",
            "Children will need sunhats and drinks",
            "The café has a special offer on meals for children",
        ],
        correct: "There is a competition for children today",
    },
    {
        id: 2,
        type: "mcq",
        displayNumber: "2",
        question: "Which TWO things does the speaker say about visiting the football stadium with children?",
        options: [
            "Children can get their photo taken with a football player",
            "There is a competition for children today",
            "Parents must stay with their children at all times",
            "Children will need sunhats and drinks",
            "The café has a special offer on meals for children",
        ],
        correct: "Parents must stay with their children at all times",
    },
    {
        id: 3,
        type: "mcq",
        displayNumber: "3",
        question: "Which TWO features of the stadium tour are new this year?",
        options: ["VIP tour", "360 cinema experience", "audio guide", "dressing room tour", "tours in other languages"],
        correct: "360 cinema experience",
    },
    {
        id: 4,
        type: "mcq",
        displayNumber: "4",
        question: "Which TWO features of the stadium tour are new this year?",
        options: ["VIP tour", "360 cinema experience", "audio guide", "dressing room tour", "tours in other languages"],
        correct: "dressing room tour",
    },

    // 5-10 savollar (Dropdown Select / Matching)
    {
        id: 5,
        type: "dropdown-select",
        displayNumber: "5",
        question: "Questions 5-10. Match the year with the correct information (A-H).",
        year: 1870,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "D",
    },
    {
        id: 6,
        type: "dropdown-select",
        displayNumber: "6",
        question: "Questions 5-10. Match the year with the correct information (A-H).",
        year: 1874,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "F",
    },
    {
        id: 7,
        type: "dropdown-select",
        displayNumber: "7",
        question: "Questions 5-10. Match the year with the correct information (A-H).",
        year: 1875,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "B",
    },
    {
        id: 8,
        type: "dropdown-select",
        displayNumber: "8",
        question: "Questions 5-10. Match the year with the correct information (A-H).",
        year: 1877,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "H",
    },
    {
        id: 9,
        type: "dropdown-select",
        displayNumber: "9",
        question: "Year 1878: Match the correct information",
        year: 1878,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "C",
    },
    {
        id: 10,
        type: "dropdown-select",
        displayNumber: "10",
        question: "Year 1880: Match the correct information",
        year: 1880,
        options: [
            { label: "A", text: " the introduction of pay for the players" },
            { label: "B", text: " a change to the design of the goal" },
            { label: "C", text: " the first use of lights for matches" },
            { label: "D", text: "the introduction of goalkeepers" },
            { label: "E", text: "the first international match" },
            { label: "F", text: "two changes to the rules of the game" },
            { label: "G", text: "the introduction of a fee for spectators" },
            { label: "H", text: " an agreement on the length of a game" },
        ],
        correctAnswer: "G",
    },

    // --- PART 2 (Multi-MCQ 11/12) ---
    {
        id: 11,
        type: "multi-mcq", // Ikki javobli tur
        displayNumber: "11-12",
        question: "Questions 11-12. Which TWO benefits for children of learning to write did both students find surprising?",
        options: [
            "improved fine motor skills",
            "improved memory",
            "improved concentration",
            "improved imagination",
            "improved spatial awareness",
        ],
        correct: ["improved fine motor skills", "improved imagination"],
    },
    {
        id: 12,
        type: "multi-mcq", // Ikki javobli tur
        displayNumber: "13-14",
        question: "13 14 For children with dyspraxia, which TWO problems with handwriting do the students think are easiest to correct?",
        options: [
            "not spacing letters correctly",
            "not writing in a straight line",
            "applying too much pressure when writing",
            "writing very slowly",
            "confusing letter shapes",
        ],
        correct: ["not spacing letters correctly", "applying too much pressure when writing"],
    },
    {
        id: 13,
        type: "mcq",
        displayNumber: "15",
        question: "15 What does the woman say about using laptops to teach writing to children with dyslexia?",
        options: ["Children often lack motivation to learn that way", "Children become fluent relatively quickly", "Children react more positively if they make a mistake"],
        correct: "Children react more positively if they make a mistake",
    },
 {
        id: 14,
        type: "mcq",
        displayNumber: "16",
        question: "16 When discussing whether to teach cursive or print writing, the woman thinks that",
        options: ["cursive writing disadvantages a certain group of children", "print writing is associated with lower academic performance", "most teachers in the UK prefer a traditional approach to handwriting"],
        correct: "cursive writing disadvantages a certain group of children",
    },
{
        id: 15,
        type: "mcq",
        displayNumber: "17",
        question: "17  According to the students, what impact does poor handwriting have on exam performance?",
        options: ["There is evidence to suggest grades are affected by poor handwriting", "Neat handwriting is less important now than it used to be", "Candidates write more slowly and produce shorter answers"],
        correct: "There is evidence to suggest grades are affected by poor handwriting",
    },
    {
        id: 16,
        type: "mcq",
        displayNumber: "18",
        question: "18   What prediction does the man make about the future of handwriting?",
        options: ["Touch typing will be taught before writing by hand", "Children will continue to learn to write by hand", "People will dislike handwriting on digital devices"],
        correct: "Children will continue to learn to write by hand",
    },
    {
        id: 17,
        type: "mcq",
        displayNumber: "19",
        question: "19   The woman is concerned that relying on digital devices has made it difficult for her to",
        options: ["spell and punctuate", "take detailed notes", "read old documents"],
        correct: "spell and punctuate",
    },
    {
        id: 18,
        type: "mcq",
        displayNumber: "20",
        question: "20   How do the students feel about their own handwriting?",
        options: ["concerned they are unable to write quickly", "embarrassed by comments made about it", "regretful that they have lost the habit"],
        correct: "360 cinema experience",
    },
]

                  // ✅ YANGI: Part 1 transkripti (ESKI KODDAN OLINGAN MATN)
                  const PART1_TRANSCRIPT = `Good morning and welcome to City Football Club. I'd like to give you some useful information about your visit to the stadium today and then we'll start the tour of the areas of the stadium that are open to visitors. I can see lots of children here today. So just to let mums and dads know a few things before we start. The stadium has lots of stairs and the players' tunnel is very dark. Please don't let your children wander off on their own, even for a minute. We don't want any accidents or anyone getting frightened. Cameras are permitted everywhere and you can take pictures of your child shooting a penalty. Assistants are helping to organise this And hopefully the queue won't be too long. It's very hot and sunny out on the pitch today.

                  You can get food and drink at the cafe, and I really recommend the healthy lunch boxes for children. Also in the cafe, children are invited to do a football-themed drawing. We'll pick the best one at the end of the afternoon. so don't forget to put your name and contact details on the back. That way, if you've left the stadium before then, we'll send your prize, but sadly we can't return drawings. I'd like to mention some features of the tour. We'll start with the 360 cinema experience, which has been very popular over the years, and then I'll take you to the players' dressing rooms, before going outside to the seating area and the pitch. I should say, if you'd prefer your visit to be self-guided, please collect headphones from the reception and then you can listen to the pre-recorded information at your own speed. We've only just introduced this feature and would appreciate your feedback. We're thinking of offering tours in other languages in future.

                  So, if you have any thoughts on that, we'd welcome those too. If you plan to return another time, you might like to book one of our VIP tours. We've only just started offering these, and they can be booked online. Before you hear the rest of the talk, you have some time to look at questions 15 to 20. Now listen and answer questions 15 to 20. Now, the stadium you see today was built in 1989 as part of a three-year redevelopment project. While that project was going on, the team had to play its matches at the ground of another club. Apart from that, the club has been here on this site since 1870. As some of you may know, that was the start of a really important decade in the history of football in this country. For example, 1870 was also the year that football teams started to include a player whose role it was to guard the goal. It's hard to imagine what the game must have been like without someone in that position, isn't it?

                  In 1872 and 73, many other clubs were established, both here and abroad. And the following year, in 1874, referees were allowed to send players off if they committed certain offences. And also in that year, teams started having to swap ends at half-time. One fact I was interested to discover was that in early football games, the aim was for the scorer to get the ball between two flag posts, and later between sticks joined at the top with a piece of tape. In 1875, that tape was replaced with the solid crossbar that we're familiar with today. 1877 saw the founding of further new clubs, and the history books tell us that in the same year, all the clubs decided to set a limit of 90 minutes for each match. Before that, it was a more casual arrangement, and this sometimes caused huge arguments and sometimes fights during matches when one team called the end of the game and the other team wanted to play on to try and score a winning goal.

                  By 1878, The number of teams in the football league increased again. In addition, referees started using whistles and electric lamps were installed on certain pitches. This was a significant change, as games could then be played in the evenings all year round. In 1880, clubs began to charge fans for admission to games, even though players were still amateurs. and had other proper jobs. That's hard to imagine in the modern professional game, where top players earn significant sums of money from both playing and commercial activities.`;

//correct Answer
                  // ✅ YANGI: Part 2 transkripti (o'zingizning 11+ savollariga mos matnni joylang)
                  const PART2_TRANSCRIPT = `
                  Sandra, I seem to remember you had some family visitors staying with you recently. Yeah, that's right. My brother and his family were here a couple of months ago. OK, good. Well, I wanted to ask your advice. I've got my cousin and her family visiting next month and as I don't have kids, I've no idea where to take them. Right. What about accommodation? Are they going to stay with you in your flat? No, thankfully. There wouldn't be room. My cousin wants me to recommend a hotel. Do you know anywhere? Yes, I do actually. I always recommend people stay at the King's Hotel. Where's that near? It's about five minutes' walk from Murray Station, so nice and central. It's actually on George Street. Oh, yes, I know. 
                  I think they're on quite a tight budget, so how much roughly is it to stay there? If you book a family room, it's about £125 per night. My brother paid for two double rooms in the end, and I think that was around £95 for each room. Oh, that's not too bad. So how old are your cousins' kids? Twelve and nine. So I want to organise some trips while they're here. I was thinking of doing a bus tour of the city centre, as none of them have been here before. Those bus tours are quite expensive. I think it's better to do a walking tour. It gives you a much better feel for the city. There's one that starts from Colton Square. It takes a couple of hours and doesn't cost that much. Sounds good. I'll look that up. Thanks. If the weather's nice, one thing you could do is visit the old fort. You could get there by boat. The whole trip takes half a day. That's a really good idea. I'd like to do that myself. And if the weather's bad, I was thinking they could go to the science museum. But maybe they could do that when I'm at work. Yeah, don't forget it's closed on Mondays. They're here from Saturday for four nights, so Tuesday would be best, I think. And it won't be so crowded then. Saturdays are terrible. 
                  I took my kids to the exhibition on old computers there and it was far too crowded. I wanted to go back but it's finished now. That's a shame. My cousin's kids would have enjoyed that. There's another one starting soon on space, which looks really good too. OK, well, I'll mention that to my cousin. Before you hear the rest of the conversation, you have some time to look at questions 7 to 10. Now listen and answer questions 7 to 10. Have you thought about where to take them to eat? Well, I really like all the food stalls at Clacton Market. My cousin's vegetarian. I know it's one of the best places for that kind of food. Definitely, and there'll be loads of choice for the kids too. You need to get there quite early though. At the weekend, most of the stores stop serving lunch at 2.30. Good point. It's all going to need careful planning.
                  My cousin said she'd love to take the kids to a show at the theatre, but tickets are so expensive. I know, but you can get some good deals if you book online with bargaintickets.com for the following day. On some seats there's a 75% discount. Really? I must try and get some. Yeah, there are lots of things you can do for free as well. No need to spend a fortune. Like what? They're coming next month, right? Well, check and see if it's the same weekend as the Roots Music Festival in Blakewell Gardens. R-O-O-T-S? Yeah, check it out online. It's always a family-friendly event and there's no entry charge. That sounds perfect. And if you're in Blakewell Gardens, climb Telegraph Hill. You'll be able to look right down on the port. 
                  Everyone's always really impressed because it's so huge. Oh yeah, I've been meaning to do that for ages. I've heard the view's amazing. Yeah, it's really worth the effort. Well, that's given me loads of ideas. Thanks so much. That is the end of part one. You now have one minute to check your answers to part one. `



// -currentTranscript
// export default function ListeningPage() {
// showTranscript

// === ListeningPage Komponentining Boshlanishi ===
export default function ListeningPage() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [playbackTime, setPlaybackTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [currentTranscript, setCurrentTranscript] = useState(PART1_TRANSCRIPT);
    const TOTAL_IELTS_QUESTIONS = 20;
  

    // ✨ TUZATILGAN: Turlarni (types) aniq belgilash
    const [testStage, setTestStage] = useState<'part1' | 'results1' | 'part2' | 'final'>('part1');

    // ✅ Asosiy Tuzatish: string VOYOKI string[]
    const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>("") 
    
    // ✅ Asosiy Tuzatish: Record ichidagi qiymat ham string VOYOKI string[]
    const [answered, setAnswered] = useState<Record<number, string | string[]>>({}) 
    
    const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean }>({ show: false, isCorrect: false })
    const [showTranscript, setShowTranscript] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [audioSrc, setAudioSrc] = useState("/sample.mp3");

  
   // Audio yaratish
const [audio] = useState(typeof Audio !== "undefined" ? new Audio("/sample.mp3") : null); // Asl holatda qoldiramiz

useEffect(() => {
    if (!audio) return

    // 💡 1-O'ZGARISH: Agar audio ob'ektining joriy manbasi state'dagi manbaga mos kelmasa,
    // uni yangi manba (Part 2 audiosi) bilan almashtiramiz va qayta yuklaymiz.
    if (audio.src.indexOf(audioSrc) === -1) {
        audio.src = audioSrc;
        audio.load(); // Yangi manbani yuklash
        setPlaybackTime(0); // Vaqtni nolga qaytarish
        setIsPlaying(false); // Ijroni to'xtatish
    }
  
    // ... Qolgan kod sample-part2.mp3 ...

    audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration))
    }

    let timer: NodeJS.Timeout
    if (isPlaying) {
        audio.play()
        timer = setInterval(() => {
            setPlaybackTime(Math.floor(audio.currentTime))
            if (audio.currentTime >= audio.duration) {
                setIsPlaying(false)
                clearInterval(timer)
            }
        }, 500)
    } else {
        audio.pause()
    }

    // 💡 2-O'ZGARISH: Dependency arrayga audioSrc ni qo'shamiz
    return () => clearInterval(timer)
}, [isPlaying, audio, audioSrc])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const currentQ = questions[currentQuestion]

    // Dropdown savollari uchun opsiyalarni to'g'ri turda topish
    const matchingQuestion = questions.find(q => q.type === "dropdown-select" && q.options?.length);
    const matchingOptions: { label: string; text: string }[] = (matchingQuestion?.options as { label: string; text: string }[] | undefined) || [];


 
    
// Natijalari

    // 💡 Tuzatilgan handleSelectAnswer funksiyasi
   const handleSelectAnswer = (answer: string) => {
        if (currentQ.type === "multi-mcq") {
            // Endi bu qator Typescript xatosiz ishlaydi
            let currentSelected = Array.isArray(selectedAnswer) ? selectedAnswer : []; 
            
            const maxSelections = 2; // Cheklov: faqat 2 ta tanlov

            if (currentSelected.includes(answer)) {
                setSelectedAnswer(currentSelected.filter(a => a !== answer));
            } else {
                if (currentSelected.length < maxSelections) {
                    setSelectedAnswer([...currentSelected, answer]);
                }
            }
        } else {
            setSelectedAnswer(answer);
        }
    }
// + 1


    // correctAnswers hisoblaydigan yordamchi funksiya
    const calculateCorrectAnswers = (questionCount: number) => {
        return Object.entries(answered).filter(([idx, ans]) => {
            const questionIndex = Number(idx);
            if (questionIndex >= questionCount) return false; // Faqat belgilangan savollar ichida hisoblash

            const question = questions[questionIndex];
            
            if (question.type === "mcq" || question.type === "short") {
                return ans === question.correct;
            } else if (question.type === "multiple-choice" || question.type === "dropdown-select") {
                return ans === question.correctAnswer;
            } else if (question.type === "multi-mcq") {
                const userAnswers = Array.isArray(ans) ? ans.sort() : [];
                const correctAnswers = Array.isArray(question.correct) ? question.correct.sort() : [];

                return userAnswers.length === correctAnswers.length && 
                       userAnswers.every((val, index) => val === correctAnswers[index]);
            }
            return false
        }).length
    }

    const handleCheckAnswer = () => {
        if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) return

        let isCorrect = false;

        if (currentQ.type === "mcq" || currentQ.type === "short") {
            isCorrect = selectedAnswer === currentQ.correct;
        } else if (currentQ.type === "multiple-choice" || currentQ.type === "dropdown-select") {
            isCorrect = selectedAnswer === currentQ.correctAnswer;
        } else if (currentQ.type === "multi-mcq") {
            const userAnswers = Array.isArray(selectedAnswer) ? selectedAnswer.sort() : [];
            const correctAnswers = Array.isArray(currentQ.correct) ? currentQ.correct.sort() : [];
            
            isCorrect = userAnswers.length === correctAnswers.length && 
                        userAnswers.every((val, index) => val === correctAnswers[index]);
        }

        setFeedback({ show: true, isCorrect })
        setAnswered({ ...answered, [currentQuestion]: selectedAnswer })
    }

    // 💡 TUZATILGAN: Navigatsiya mantiqi
    const handleNext = () => {
        // 1. Agar 10-savolda (index 9) bo'lsa, natijani ko'rsatamiz
        if (currentQuestion === 9) {
            setTestStage('results1');
            setFeedback({ show: false, isCorrect: false });
            return;
        } 
        
        // 2. Agar oxirgi savolda bo'lsa, yakuniy natijani ko'rsatamiz
        if (currentQuestion === questions.length - 1) {
            setTestStage('final');
            return;
        } 
        
        // 3. Odatiy o'tish
        if (currentQuestion < questions.length - 1) {
            const nextQuestionIndex = currentQuestion + 1;
            setCurrentQuestion(nextQuestionIndex);

            // Keyingi savolning javobini yuklash
            const nextQuestionType = questions[nextQuestionIndex].type;
            const nextAnswer = answered[nextQuestionIndex] || (nextQuestionType === 'multi-mcq' ? [] : "")
            setSelectedAnswer(nextAnswer);
            setFeedback({ show: false, isCorrect: false });
        }
    }

   // Bu funksiya Part 1 natijasi ko'rsatilgandan so'ng, tugma bosilganda chaqiriladi
const handleStartPart2 = () => {
    // 11-savolga o'tish (indeksi 10)
    setCurrentQuestion(10);
    setTestStage('part2');
    setSelectedAnswer(answered[10] || []); 
    
    // ✅ AUDIO Manbasini o'zgartirish
    setAudioSrc("/sample-part2.mp3"); 
    
    // ✅ TRANSKRIPT Manbasini o'zgartirish - MANA BU QATOR MUHIM!
    setCurrentTranscript(PART2_TRANSCRIPT); 

    // Ijroni to'xtatish
    setIsPlaying(false); 
}

    // Yakuniy natijalar
    const totalCorrectAnswers = calculateCorrectAnswers(questions.length);
    // Part 1 natijalari handleStartPart2
    const part1CorrectAnswers = calculateCorrectAnswers(10);

    // === Natijalar (Part 1 natijasi) ===
    if (testStage === 'results1') {
        return (
            <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
                {/* <Navigation /> */}
                <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                            <CheckCircle size={32} className="text-blue-500" /> Part 1 Result (1-10)
                        </h1>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center mb-8">
                            <p className="text-6xl font-bold text-blue-600 mb-4">
                                {part1CorrectAnswers} / 10
                            </p>
                            <p className="text-lg text-slate-600">Correct Answer {part1CorrectAnswers} </p>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">Continue</h2>
                        <Button 
                            onClick={handleStartPart2} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                        >
                            Part 2 (11-20 Question) <ChevronRight size={20} className="ml-2" />
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // === Natijalar (Yakuniy natija) ===
    if (testStage === 'final') {
        return (
            <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
                {/* <Navigation /> */}
                <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                             <CheckCircle size={32} className="text-blue-500" /> Test Completed
                        </h1>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center mb-8">
                            <p className="text-6xl font-bold text-blue-600 mb-4">
                                {totalCorrectAnswers} / {TOTAL_IELTS_QUESTIONS}
                            </p>
                            <p className="text-lg text-slate-600">Correct Answer {totalCorrectAnswers} </p>
                            <p className="mt-2 text-md text-slate-500">Part 1 result: **{part1CorrectAnswers} / 10**</p>
                        </div>
                        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                            Restart the test
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // === Savollar bo'limi (Asosiy view) ===
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
            {/* <Navigation /> */}
            <main className="flex-grow py-8 sm:py-12 md:py-20 px-3 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                        IELTS Listening Practice Test ({testStage === 'part1' ? 'Part 1' : 'Part 2'})
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Audio Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                                <h3 className="font-bold text-slate-900 mb-6 text-base sm:text-lg">Audio Player</h3>

                                {/* ... Audio va Transkript bo'limi ... (oldingi kod bilan bir xil) */}
                                <div className="flex items-center justify-center mb-6">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                                    >
                                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2 cursor-pointer">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(playbackTime / duration) * 100}%` }} />
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 text-center">
                                        {formatTime(playbackTime)} / {formatTime(duration)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowTranscript(!showTranscript)}
                                    className="w-full p-2 border border-slate-200 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 text-sm"
                                >
                                    {showTranscript ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showTranscript ? "Hide" : "Show"} Transcript
                                </button>

                                {showTranscript && (
                                  <div className="mt-4 bg-slate-50 p-4 rounded-lg text-xs sm:text-sm text-slate-700 leading-relaxed">
                                      <p>{currentTranscript}</p>
                                  </div>
                              )}
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                                
                                  <h3 className="font-bold text-slate-900 mb-6 text-base sm:text-lg">
                                       Questions {currentQ.displayNumber} of {TOTAL_IELTS_QUESTIONS}
                                    </h3>

                                {/* Savol Matni */}
                                {(currentQ.type === "dropdown-select" && currentQuestion >= questions.findIndex(q => q.type === "dropdown-select")) && (
                                    <p className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">
                                        Questions 5-10. Match the year with the correct information (A-H).
                                    </p>
                                )}
                                <p className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">
                                    {currentQ.question}
                                </p>

                                {/* Multiple Choice / MCQ / Multi-MCQ uchun asosiy shart */}
                                {(currentQ.type === "multiple-choice" || currentQ.type === "mcq" || currentQ.type === "multi-mcq") && (
                                    <div className="space-y-3 mb-6">
                                        {currentQ.options?.map((option, index) => {

                                            const isSimple = typeof option === "string";
                                            const optionLabel = isSimple ? String.fromCharCode(65 + index) : (option as { label: string }).label;
                                            const optionText = isSimple ? option : (option as { text: string }).text;
                                            const answerValue = isSimple ? option : (option as { label: string }).label;
                                            const inputType = currentQ.type === "multi-mcq" ? "checkbox" : "radio";
                                            
                                            // Tanlanganlik holatini aniqlash (MUHIM!)
                                            const isChecked = currentQ.type === "multi-mcq"
                                                ? (Array.isArray(selectedAnswer) && selectedAnswer.includes(answerValue))
                                                : selectedAnswer === answerValue;

                                            return (
                                                <label
                                                    key={optionLabel}
                                                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                                        isChecked ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                                                    }`}
                                                >
                                                    <input
                                                        type={inputType}
                                                        name={`q_${currentQ.id}_answer`}
                                                        value={answerValue}
                                                        checked={isChecked} 
                                                        onChange={() => handleSelectAnswer(answerValue)}
                                                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        // Multi-MCQ da 2 ta tanlangan bo'lsa va bu variant tanlanmagan bo'lsa, o'chiramiz
                                                        disabled={currentQ.type === "multi-mcq" && Array.isArray(selectedAnswer) && selectedAnswer.length >= 2 && !isChecked}
                                                    />
                                                    <span className="ml-3 text-sm sm:text-base text-slate-700">
                                                        <span className="font-bold text-blue-600 mr-2">{optionLabel.toUpperCase()}.</span>
                                                        {optionText}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Short state */}
                                {currentQ.type === "short" && (
                                    <input
                                        type="text"
                                        placeholder={currentQ.placeholder}
                                        value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                                        onChange={(e) => handleSelectAnswer(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm sm:text-base mb-6 focus:border-blue-400 outline-none"
                                    />
                                )}

                                {/* Dropdown Select (Matching / Harf Test Yakunlandi) */}
                                {currentQ.type === "dropdown-select" && (
                                    <div className="mb-6 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-slate-800 text-lg">
                                                {currentQ.year}
                                            </p>
                                            <select
                                                value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                                                onChange={(e) => handleSelectAnswer(e.target.value)}
                                                className="w-40 border-2 border-slate-200 rounded-lg p-3 text-sm sm:text-base focus:border-blue-400 outline-none"
                                            >
                                                <option value="" disabled>Select Letter</option>
                                                {matchingOptions.map((option) => (
                                                    <option key={option.label} value={option.label}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <h4 className="font-semibold mb-2">Matching Options (A-H):</h4>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                                                {matchingOptions.map((option) => (
                                                    <li key={option.label}>
                                                        <span className="font-bold text-red-600 mr-1">{option.label}.</span> {option.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>//Keyingi
                                )}


                                {feedback.show && (
                                    <div
                                        className={`p-4 rounded-lg mb-6 text-sm sm:text-base flex items-center gap-3 ${
                                            feedback.isCorrect
                                                ? "bg-green-50 border-2 border-green-200 text-green-900"
                                                : "bg-red-50 border-2 border-red-200 text-red-900"
                                            }`}
                                    >
                                        {feedback.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        <p className="font-semibold">{feedback.isCorrect ? "Correct!" : "Incorrect."}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-between">
                                    <Button
                                        onClick={() => {
                                            if (currentQuestion > 0) {
                                                const prevQuestionIndex = currentQuestion - 1;
                                                setCurrentQuestion(prevQuestionIndex)
                                                
                                                // Agar Part 2 dan Part 1 ga qaytsa va Part 1 tugashi kerak bo'lsa, bosqich 'part1' ga o'tadi
                                                if (currentQuestion === 10 && testStage === 'part2') {
                                                    setTestStage('part1');
                                                }

                                                const prevQuestionType = questions[prevQuestionIndex].type;
                                                const prevAnswer = answered[prevQuestionIndex] || (prevQuestionType === 'multi-mcq' ? [] : "");
                                                setSelectedAnswer(prevAnswer);
                                                setFeedback({ show: false, isCorrect: false })
                                            }
                                        }}
                                        disabled={currentQuestion === 0}
                                        variant="outline"
                                        className="flex-1 text-xs sm:text-sm py-2"
                                    >
                                        <ChevronLeft size={16} className="mr-2" /> Continue
                                    </Button>

                                    {!feedback.show ? (
                                        <Button
                                            onClick={handleCheckAnswer}
                                            disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                                        >
                                            Check Answer
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNext}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                                        >
                                            {currentQuestion === 9 ? "Natijani ko'rish" : currentQuestion === questions.length - 1 ? "Finish" : "Next"} <ChevronRight size={16} className="ml-2" />
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
//multiple-choice