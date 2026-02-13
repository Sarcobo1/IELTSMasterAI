// app/vocabularypage/page.tsx
"use client";
import { useState } from "react";
import Sidebar from "../vocabulary/page1";
import VocabularyCard, { VocabularyItem } from "../vocabulary/page"; // ✅ Type import qildik
import { vocabularyData } from "../vocabulary/vocabulary";
import { BookOpen, Sparkles } from "lucide-react";
// import Footer from "@/components/footer";

export default function VocabularyPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("Environment");

  const topics = Object.keys(vocabularyData);
  
  // ✅ TUZATISH: Type assertion
  const currentVocabulary = (Array.isArray(vocabularyData[selectedTopic]) 
    ? vocabularyData[selectedTopic] 
    : []) as VocabularyItem[];

  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      Environment: "from-emerald-500 to-teal-600",
      Technology: "from-blue-500 to-indigo-600",
      Business: "from-purple-500 to-pink-600",
      Health: "from-rose-500 to-orange-600",
      Education: "from-cyan-500 to-blue-600",
      Society: "from-yellow-500 to-orange-500",
    };
    return colors[topic] || "from-blue-500 to-indigo-600";
  };
  
  const gradientClass = getTopicColor(selectedTopic);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <main className="flex-grow">
        <div className={`bg-gradient-to-r ${gradientClass} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -ml-40 -mb-40"></div>
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex items-start gap-4 mb-2">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Vocabulary Master
                </h1>
                <p className="text-white/90 text-lg">
                  Elevate your vocabulary to Band 9 excellence
                </p>
              </div>
              <div className="ml-auto hidden md:flex items-center gap-2 text-white/80">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Premium Collection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-12">
            <div className="md:hidden mb-8">
              <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Select Topic
              </p>
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-3 min-w-max">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-5 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                        selectedTopic === topic
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="hidden md:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <Sidebar 
                    topics={topics} 
                    selectedTopic={selectedTopic} 
                    onTopicChange={setSelectedTopic} 
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-10">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h2 className="text-4xl font-bold text-gray-900">
                      {selectedTopic}
                    </h2>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {currentVocabulary.length} words
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                    Master these essential {selectedTopic.toLowerCase()} vocabulary words 
                    and phrases to achieve Band 9 proficiency. Each term is carefully 
                    selected and contextually explained.
                  </p>
                </div>

                <div className="grid gap-6">
                  {currentVocabulary.length > 0 ? (
                    currentVocabulary.map((item, index) => {
                      if (!item) return null;
                      
                      return (
                        <div
                          key={`${selectedTopic}-${item.word}-${index}`}
                          className="group"
                          style={{
                            animation: `fadeIn 0.5s ease-out ${index * 0.06}s both`,
                          }}
                        >
                          <VocabularyCard vocabularyItem={item} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-lg">
                        No vocabulary items found for this topic.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}