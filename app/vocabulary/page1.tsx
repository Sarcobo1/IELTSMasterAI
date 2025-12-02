interface SidebarProps {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export default function Sidebar({ topics, selectedTopic, onTopicChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Topic</h3>
      <nav className="space-y-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopicChange(topic)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              selectedTopic === topic
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {topic}
          </button>
        ))}
      </nav>
    </aside>
  );
}
