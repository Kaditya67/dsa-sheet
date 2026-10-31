import { useState } from "react";
import {
  FiExternalLink,
  FiCode,
  FiCopy,
  FiCheck,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCpu,
  FiStar,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";

const STATUS_COLORS = {
  Todo: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  Attempted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Understood: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Solved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Must Revise": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold",
  Mastered: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function ProblemCard({
  problem,
  onStatusChange,
  onToggleFavorite,
  onEdit,
  onDelete,
  darkMode,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeSolution = problem.solutions && problem.solutions[activeTab];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 ${
        darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
      }`}
    >
      {/* Compact Main Row */}
      <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Star + Title + Badges */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => onToggleFavorite(problem._id)}
            className={`p-1 rounded-md transition shrink-0 ${
              problem.isFavorite
                ? "text-amber-500"
                : "text-neutral-300 dark:text-neutral-700 hover:text-amber-500"
            }`}
            title="Bookmark"
          >
            <FiStar className={`w-3.5 h-3.5 ${problem.isFavorite ? "fill-amber-500" : ""}`} />
          </button>

          {/* Difficulty pill */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
              DIFFICULTY_COLORS[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </span>

          {/* Title */}
          <h3
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white truncate cursor-pointer hover:text-indigo-500 transition"
            title={problem.title}
          >
            {problem.title}
          </h3>

          {/* Tags (zoom-out compact) */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {problem.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag._id}
                  style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}35`, color: tag.color }}
                  className="text-[9px] font-semibold px-1.5 py-0.2 rounded border truncate max-w-[110px]"
                >
                  {tag.name}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-[9px] text-neutral-400 font-medium">+{problem.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Links icons */}
          {problem.links && problem.links.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {problem.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-indigo-500 hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title={`${link.platform}: ${link.url}`}
                >
                  <FiExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: Status selector + Quick controls */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={problem.status}
            onChange={(e) => onStatusChange(problem._id, e.target.value)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border outline-none cursor-pointer ${
              STATUS_COLORS[problem.status]
            }`}
          >
            {["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"].map((s) => (
              <option key={s} value={s} className="bg-neutral-900 text-white">
                {s}
              </option>
            ))}
          </select>

          {problem.solutions && problem.solutions.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1"
            >
              <FiCode className="w-3 h-3" />
              <span>{problem.solutions.length}</span>
              {isExpanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={() => onEdit(problem)}
            className="p-1 text-neutral-400 hover:text-indigo-500 transition"
            title="Edit"
          >
            <FiEdit className="w-3 h-3" />
          </button>

          <button
            onClick={() => onDelete(problem._id)}
            className="p-1 text-neutral-400 hover:text-rose-500 transition"
            title="Delete"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded Accordion: Code approaches & Personal Notes */}
      {isExpanded && (
        <div className={`border-t p-3 space-y-3 ${darkMode ? "border-neutral-800 bg-neutral-950/60" : "border-neutral-100 bg-neutral-50/70"}`}>
          {/* External links for mobile or smaller view */}
          {problem.links && problem.links.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Platform Links:</span>
              {problem.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-medium text-indigo-500 hover:underline inline-flex items-center gap-1"
                >
                  <span>{link.label || link.platform}</span>
                  <FiExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}

          {/* Notes */}
          {problem.personalNotes && (
            <div className={`p-2.5 rounded-lg border text-xs ${darkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"}`}>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">Key Intuition & Edge Cases:</span>
              <p className="whitespace-pre-wrap">{problem.personalNotes}</p>
            </div>
          )}

          {/* Solution Tabs */}
          {problem.solutions && problem.solutions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {problem.solutions.map((sol, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`text-[10px] px-2.5 py-0.5 rounded font-semibold transition ${
                        activeTab === idx
                          ? "bg-indigo-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {sol.title || `Solution ${idx + 1}`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyCode(activeSolution.code)}
                  className="text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold inline-flex items-center gap-1"
                >
                  {copied ? <FiCheck className="w-2.5 h-2.5 text-emerald-500" /> : <FiCopy className="w-2.5 h-2.5" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              {activeSolution && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                    <span className="uppercase font-bold text-neutral-300">{activeSolution.language}</span>
                    {activeSolution.timeComplexity && (
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="w-2.5 h-2.5" /> {activeSolution.timeComplexity}
                      </span>
                    )}
                    {activeSolution.spaceComplexity && (
                      <span className="inline-flex items-center gap-1">
                        <FiCpu className="w-2.5 h-2.5" /> {activeSolution.spaceComplexity}
                      </span>
                    )}
                  </div>

                  {activeSolution.explanation && (
                    <p className="text-[11px] text-neutral-400 italic">💡 {activeSolution.explanation}</p>
                  )}

                  <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono overflow-x-auto max-h-64">
                    <code>{activeSolution.code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
