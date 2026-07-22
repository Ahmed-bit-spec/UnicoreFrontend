function formatAnswer(ans) {
  if (ans === undefined || ans === null || ans === "") {
    return "";
  }
  if (Array.isArray(ans)) {
    return ans.join(", ");
  }
  if (typeof ans === "object") {
    if (ans.code !== undefined) {
      return ans.code;
    }
    if (ans.html !== undefined) {
      return `<!-- HTML -->\n${ans.html}\n\n/* CSS */\n${ans.css || ""}\n\n// JavaScript\n${ans.javascript || ""}`;
    }
    if (ans.sql !== undefined) {
      return ans.sql;
    }
    if (ans.query !== undefined) {
      return ans.query;
    }
    if (ans.codeSolution !== undefined) {
      return ans.codeSolution;
    }
    return JSON.stringify(ans, null, 2);
  }
  return String(ans);
}

/**
 * QuestionsTab — shows every answer with score input, feedback, rubric, and AI assist.
 */
export default function QuestionsTab({ submission, grades, onUpdateGrade, examId, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [aiLoading, setAiLoading]   = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});

  const answers = submission?.answers || [];

  const requestAi = async (questionId) => {
    try {
      setAiLoading(questionId);
      const { data } = await axios.post(
        `/api/exams/teacher/${examId}/submissions/${submission._id}/ai-assist`,
        { questionId }
      );
      setAiSuggestions((prev) => ({ ...prev, [questionId]: data.data.suggestions }));
      toast.success("AI suggestions ready");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI assist failed");
    } finally {
      setAiLoading(null);
    }
  };

  const applyAiScore = (questionId, score) => {
    onUpdateGrade(questionId, "manualScore", score);
    toast.success("AI suggested score applied — review before saving");
  };

  const applyAiFeedback = (questionId, feedback) => {
    onUpdateGrade(questionId, "teacherFeedback", feedback);
    toast.success("AI feedback applied");
  };

  return (
    <div className="space-y-4">
      {answers.map((ans, idx) => {
        const qid = ans.questionId?.toString?.() || ans.questionId;
        const g   = grades[qid] || {};
        const isExpanded = expandedId === qid;
        const suggestions = aiSuggestions[qid];

        const scoreSet   = g.manualScore !== "" && g.manualScore !== null && g.manualScore !== undefined;
        const scoreVal   = scoreSet ? Number(g.manualScore) : null;
        const isFullMark = scoreSet && scoreVal >= (ans.maxMarks || 0);
        const isZero     = scoreSet && scoreVal === 0;

        return (
          <div
            key={qid}
            className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all
              ${isExpanded
                ? "border-[#2C2DE0] dark:border-[#4F51FF] dark:border-[#2C2DE0] dark:border-[#4F51FF]/40 shadow-md shadow-[#2C2DE0]/5"
                : "border-gray-200 dark:border-zinc-800"
              }`}
          >
            {/* Question header — always visible */}
            <button
              type="button"
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              onClick={() => setExpandedId(isExpanded ? null : qid)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-medium font-mono">Q{idx + 1}</span>
                  <TypeBadge type={ans.questionType || ans.type} />
                  {/* Score status icon */}
                  {!scoreSet   ? <AlertCircle className="w-3.5 h-3.5 text-zinc-400" title="Not graded" /> :
                   isFullMark  ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2C2DE0] dark:text-[#4F51FF]"  title="Full marks" /> :
                   isZero      ? <XCircle      className="w-3.5 h-3.5 text-zinc-500"    title="Zero" /> :
                                 <Award        className="w-3.5 h-3.5 text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF]"   title="Partial" />
                  }
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {ans.questionText || "(no question text)"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {scoreSet ? scoreVal : "—"}
                    <span className="text-gray-400 font-normal"> / {ans.maxMarks}</span>
                  </p>
                  {ans.autoScore !== undefined && (
                    <p className="text-[10px] text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF] font-mono">auto: {ans.autoScore}</p>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-zinc-800 p-4 space-y-4">

                {/* Student answer */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Student's Answer</p>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-48">
                    {ans.answer !== undefined && ans.answer !== null && ans.answer !== "" ? (
                      formatAnswer(ans.answer)
                    ) : (
                      <span className="text-gray-400 italic">No answer submitted</span>
                    )}
                  </div>
                </div>

                {/* Correct answer (for objective types) */}
                {ans.correctAnswer !== undefined && ans.correctAnswer !== null && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF] mb-2">Correct Answer</p>
                    <div className="p-3 bg-[#2C2DE0] dark:bg-[#1E1FAA]/5 rounded-xl border border-[#2C2DE0] dark:border-[#4F51FF]/20 text-sm text-[#0F0F55] dark:text-blue-200 dark:text-[#2C2DE0] font-mono">
                      {Array.isArray(ans.correctAnswer)
                        ? ans.correctAnswer.join(", ")
                        : String(ans.correctAnswer)}
                    </div>
                  </div>
                )}

                {/* Code output */}
                {ans.codeOutput && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Code Output</p>
                    <pre className="p-3 bg-zinc-950 text-[#4F51FF] border border-zinc-800 rounded-xl text-xs overflow-auto max-h-36 font-mono">
                      {ans.codeOutput}
                    </pre>
                  </div>
                )}

                {/* Options (for MCQ) */}
                {ans.options?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Options</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ans.options.map((opt, i) => {
                        const isChosen  = String(ans.answer) === opt;
                        const isCorrect = String(ans.correctAnswer) === opt;
                        return (
                          <div
                            key={i}
                            className={`px-3 py-2 rounded-lg text-sm border font-medium
                              ${isCorrect ? "bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 border-[#2C2DE0] dark:border-[#4F51FF]/30 text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF]" :
                                isChosen  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-gray-800 dark:text-gray-200" :
                                            "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400"}`}
                          >
                            {opt}
                            {isCorrect && " ✓"}
                            {isChosen && !isCorrect && " ✗"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grading row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  {/* Score input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                      Manual Score <span className="text-gray-400 font-normal">(max {ans.maxMarks})</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={ans.maxMarks}
                      step={0.5}
                      value={g.manualScore ?? ""}
                      onChange={(e) => onUpdateGrade(qid, "manualScore", e.target.value)}
                      placeholder={`Auto: ${ans.autoScore ?? 0}`}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:border-[#2C2DE0] dark:border-[#4F51FF] focus:ring-1 focus:ring-[#2C2DE0] dark:ring-[#4F51FF] outline-none font-bold"
                    />
                  </div>

                  {/* Feedback */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                      Feedback to Student
                    </label>
                    <textarea
                      rows={2}
                      value={g.teacherFeedback ?? ""}
                      onChange={(e) => onUpdateGrade(qid, "teacherFeedback", e.target.value)}
                      placeholder="Add constructive feedback..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:border-[#2C2DE0] dark:border-[#4F51FF] focus:ring-1 focus:ring-[#2C2DE0] dark:ring-[#4F51FF] outline-none resize-y"
                    />
                  </div>
                </div>

                {/* AI assist button */}
                <div className="flex justify-end gap-2">
                  <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                    type="button"
                    onClick={() => requestAi(qid)}
                    disabled={aiLoading === qid}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 border border-[#2C2DE0] dark:border-[#4F51FF]/20 text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF] rounded-lg hover:bg-[#2C2DE0] dark:bg-[#1E1FAA]/20 transition-colors disabled:opacity-50"
                  >
                    {aiLoading === qid
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5" />
                    }
                    AI Assist
                  </button>
                </div>

                {/* AI suggestions panel */}
                {suggestions && (
                  <AiAssistPanel
                    suggestions={suggestions}
                    maxMarks={ans.maxMarks}
                    onApplyScore={(s) => applyAiScore(qid, s)}
                    onApplyFeedback={(f) => applyAiFeedback(qid, f)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {answers.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No answers in this submission.</p>
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 text-[#0F0F55] dark:text-blue-300 dark:text-[#4F51FF] border border-[#2C2DE0] dark:border-[#4F51FF]/20">
      {type?.replace(/_/g, " ") || "—"}
    </span>
  );
}
