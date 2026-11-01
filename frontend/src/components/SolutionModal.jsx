import { useState, useEffect } from "react";
import {
  FiX,
  FiCode,
  FiClock,
  FiCpu,
  FiPlus,
  FiTrash2,
  FiCheck
} from "react-icons/fi";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export default function SolutionModal({ isOpen, onClose, onSaveSolution, problem, editingSolutionIndex, darkMode }) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (
        problem &&
        problem.solutions &&
        editingSolutionIndex !== null &&
        editingSolutionIndex !== undefined &&
        problem.solutions[editingSolutionIndex]
      ) {
        const sol = problem.solutions[editingSolutionIndex];
        setTitle(sol.title || "");
        setLanguage(sol.language || "cpp");
        setCode(sol.code || "");
        setTimeComplexity(sol.timeComplexity || "");
        setSpaceComplexity(sol.spaceComplexity || "");
        setExplanation(sol.explanation || "");
      } else {
        // Defaults for new approach
        const nextNum = (problem?.solutions?.length || 0) + 1;
        setTitle(nextNum === 1 ? "Optimal Approach" : `Approach ${nextNum}`);
        setLanguage("cpp");
        setCode("");
        setTimeComplexity("O(N)");
        setSpaceComplexity("O(1)");
        setExplanation("");
      }
    }
  }, [isOpen, problem, editingSolutionIndex]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a title for this solution approach");
    if (!code.trim()) return alert("Please enter or paste your solution code");

    onSaveSolution({
      title: title.trim(),
      language,
      code,
      timeComplexity: timeComplexity.trim(),
      spaceComplexity: spaceComplexity.trim(),
      explanation: explanation.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <FiCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {editingSolutionIndex !== null ? "Edit Solution Approach" : "Add Solution Approach"}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Problem: <span className="font-semibold text-neutral-300">{problem?.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Approach Title & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Approach Title / Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Optimal - Monotonic Stack, Two Pointers, Dynamic Programming"
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-2.5 py-2 rounded-xl text-xs border outline-none font-semibold transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
                }`}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Space Complexity */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <FiClock className="w-3 h-3 text-neutral-400" />
                <span>Time Complexity</span>
              </label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="e.g. O(N), O(log N)"
                className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-mono ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <FiCpu className="w-3 h-3 text-neutral-400" />
                <span>Space Complexity</span>
              </label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="e.g. O(1), O(N)"
                className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-mono ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* Solution Code */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Solution Code *
              </label>
              <span className="text-[10px] text-neutral-400 uppercase font-mono">{language}</span>
            </div>
            <textarea
              rows={9}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className={`w-full p-3 rounded-xl text-xs font-mono outline-none border ${
                darkMode
                  ? "bg-neutral-950 border-neutral-800 text-emerald-400 focus:border-indigo-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
              }`}
            />
          </div>

          {/* Key Intuition / Explanation */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Key Intuition & Notes
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="e.g. Maintain increasing stack; pop smaller elements to calculate bounded water."
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                darkMode
                  ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500"
              }`}
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs"
            >
              Save Solution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
