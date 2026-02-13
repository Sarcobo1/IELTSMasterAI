// import Navigation from "@/components/navigation"
// import Footer from "@/components/footer"
import { Mic, PenTool, BookOpen, Volume2, Globe } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Mic,
      title: "AI Speaking Feedback",
      description:
        "Receive instant, detailed feedback on fluency, coherence, and lexical resource to improve your speaking skills. Get personalized recommendations to sound more natural.",
    },
    {
      icon: PenTool,
      title: "Writing Band Scoring & Correction",
      description:
        "Get AI-driven band scores and precise grammatical corrections. Understand your writing performance with actionable insights.",
    },
    {
      icon: Globe,
      title: "Pronunciation Analyzer",
      description:
        "Focus on word-level pronunciation analysis and get actionable tips to sound clearer and more confident in English.",
    },
    {
      icon: BookOpen,
      title: "Smart Reading Practice",
      description:
        "Engage with adaptive reading exercises that target specific skills and IELTS question types with comprehensive feedback.",
    },
    {
      icon: Volume2,
      title: "Grammar & IELTS Tips",
      description:
        "Access a curated library of key grammar rules and essential exam strategies to boost your score systematically.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* <Navigation /> */}

      <main className="flex-grow py-12 sm:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Our Features</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools and AI-powered features designed to help you master IELTS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 p-6 sm:p-8 transition-all hover:shadow-lg text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <feature.icon size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  )
}
