// path: ../vocabulary/page1.tsx
"use client";
import React from "react";

interface Props {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export default function Sidebar({ topics, selectedTopic, onTopicChange }: Props) {
  return (
    <nav className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Topics</h4>
      <ul className="flex flex-col gap-2">
        {topics.map((topic) => {
          const active = topic === selectedTopic;
          return (
            <li key={topic}>
              <button
                onClick={() => onTopicChange(topic)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                    : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {topic}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
