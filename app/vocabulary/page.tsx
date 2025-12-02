"use client";

import { useState } from "react";
import { Lightbulb, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// VocabularyItem tipini aniq belgilaymiz
export type VocabularyItem = {
  word: string;
  pronunciation?: string;
  definition: string;
  example: string;
  highlightWord: string; // Misolda ajratib ko'rsatiladigan so'z
};

interface VocabularyCardProps {
  vocabularyItem: VocabularyItem;
}

export default function VocabularyCard({ vocabularyItem }: VocabularyCardProps) {
  const [userSentence, setUserSentence] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "tip";
    message: string;
  } | null>(null);

  const handleCheck = async () => {
    if (!userSentence.trim()) return;

    setIsChecking(true);
    setFeedback(null);

    // AI tekshiruvi simulyatsiyasi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const feedbackOptions = [
      {
        type: "success" as const,
        message: "Ajoyib! So'z to'g'ri va kontekstda mukammal ishlatilgan.",
      },
      {
        type: "success" as const,
        message: "Zo'r ish! Bu so'zni professional darajada qo'llaganingiz ko'rinib turibdi.",
      },
      {
        type: "tip" as const,
        message:
          "Yaxshi urinish! Akademik kontekstda ishlatish yanada ta'sirli bo'lardi.",
      },
      {
        type: "tip" as const,
        message:
          "Yaxshi! Aniqroq misollar yoki qo'shimcha izoh qo'shsangiz, yanada kuchli bo'ladi.",
      },
    ];

    const randomFeedback =
      feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
    setFeedback(randomFeedback);
    setIsChecking(false);
  };

  const highlightWord = (text: string, word: string) => {
    if (!word) return text;
    const parts = text.split(new RegExp(`(${word})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <mark
          key={i}
          className="bg-blue-200 text-blue-900 font-semibold px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Agar vocabularyItem kelmasa, xavfsiz fallback
  if (!vocabularyItem) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center text-gray-500">
        So'z ma'lumotlari yuklanmadi.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      {/* So'z sarlavhasi */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-blue-600 mb-1">
          {vocabularyItem.word}
        </h3>
        {vocabularyItem.pronunciation && (
          <p className="text-sm text-gray-500 italic">
            /{vocabularyItem.pronunciation}/
          </p>
        )}
      </div>

      {/* Ta'rif */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{vocabularyItem.definition}</p>
      </div>

      {/* Band 9 misol */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm font-semibold text-blue-800">
            Band 9 Misol:
          </span>
        </div>
        <p className="text-gray-800 leading-relaxed">
          {highlightWord(vocabularyItem.example, vocabularyItem.highlightWord)}
        </p>
      </div>

      {/* Mashq qismi */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Ushbu so'zni mashq qiling
        </h4>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Bu so'zni ishlatib, o'zingiz jumla yozing..."
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            className="w-full"
            disabled={isChecking}
          />
          <Button
            onClick={handleCheck}
            disabled={!userSentence.trim() || isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI tekshirmoqda...
              </>
            ) : (
              "AI bilan tekshirish"
            )}
          </Button>

          {/* Fikr-mulohaza */}
          {feedback && (
            <div
              className={`rounded-lg p-4 border ${
                feedback.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-medium ${
                    feedback.type === "success" ? "text-green-800" : "text-amber-800"
                  }`}
                >
                  {feedback.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}