import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function AIGeneratePanel({ onQuestionsGenerated }) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (!topic) {
      toast.error("Please enter a topic for AI generation.");
      return;
    }
    setIsGenerating(true);
    try {
      // Previously this called Gemini directly from the browser with
      // VITE_GEMINI_API_KEY — that ships the key inside the JS bundle, where
      // anyone can read it from devtools' network/source tab. The key now
      // lives only in the backend's environment.
      const { data } = await axios.post("/api/exams/teacher/generate-ai", { topic, mcqCount: 3, trueFalseCount: 1 });
      const formatted = data.data.questions.map(q => ({
        ...q,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      }));
      onQuestionsGenerated(formatted);
      toast.success("AI generated questions successfully!");
      setTopic("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        className="border p-2 rounded-lg text-sm dark:bg-neutral-700 dark:border-neutral-600"
        placeholder="Topic (e.g. React.js)"
        value={topic}
        onChange={e => setTopic(e.target.value)}
      />
      <button
        onClick={generate}
        disabled={isGenerating}
        className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-3 py-2 rounded-lg font-medium text-sm hover:bg-green-200 disabled:opacity-50 flex items-center gap-1.5"
      >
        ✨ {isGenerating ? "Generating…" : "Generate with AI"}
      </button>
    </div>
  );
}