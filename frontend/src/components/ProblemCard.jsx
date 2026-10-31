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
  FiStar
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
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
        darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {/* Difficulty */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                  DIFFICULTY_COLORS[problem.difficulty]
                }`}
              >
                {problem.difficulty}
              </span>

              {/* Status Selector */}
              <select
                value={problem.status}
                onChange={(e) => onStatusChange(problem._id, e.target.value)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border outline-none cursor-pointer ${
                  STATUS_COLORS[problem.status]
                }`}
              >
                {["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"].map((s) => (
                  <option key={s} value={s} className="bg-neutral-900 text-white">
                    {s}
                  </option>
                ))}
              </select>

              {/* Revision count */}
              {problem.revisionCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md border border-neutral-500/20 text-neutral-400">
                  {problem.revisionCount}x revised
                </span>
              )}
            </div>

            {/* Problem Title */}
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white truncate">
              {problem.title}
            </h3>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(problem._id)}
              className={`p-1.5 rounded-lg border transition ${
                problem.isFavorite
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-amber-500"
              }`}
              title="Bookmark / Favorite"
            >
              <FiStar className={`w-3.5 h-3.5 ${problem.isFavorite ? "fill-amber-500" : ""}`} />
            </button>

            <button
              onClick={() => onEdit(problem)}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-indigo-500 transition"
              title="Edit Problem"
            >
              <FiEdit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(problem._id)}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-500 transition"
              title="Delete Problem"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {problem.tags.map((tag) => (
              <span
                key={tag._id}
                style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}40`, color: tag.color }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
              >
                {tag.parentGroup ? `${tag.parentGroup} › ${tag.name}` : tag.name}
              </span>
            ))}
          </div>
        )}

        {/* External Platform Links */}
        {problem.links && problem.links.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {problem.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition inline-flex items-center gap-1.5 ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-indigo-400 hover:border-neutral-700"
                    : "bg-neutral-50 border-neutral-200 text-indigo-600 hover:border-neutral-300"
                }`}
              >
                <span>{link.label || link.platform}</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}

        {/* Notes preview */}
        {problem.personalNotes && (
          <div className={`text-xs p-2.5 rounded-xl border ${darkMode ? "bg-neutral-950/50 border-neutral-800/80 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"}`}>
            <span className="font-semibold block text-[10px] uppercase text-neutral-500 mb-0.5">Notes & Pitfalls</span>
            <p className="line-clamp-2">{problem.personalNotes}</p>
          </div>
        )}
      </div>

      {/* Solutions Accordion / View */}
      {problem.solutions && problem.solutions.length > 0 && (
        <div className={`border-t ${darkMode ? "border-neutral-800 bg-neutral-950/40" : "border-neutral-100 bg-neutral-50/50"}`}>
          {/* Solution Tabs Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
                <FiCode className="w-3.5 h-3.5" /> Solutions:
              </span>
              {problem.solutions.map((sol, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx);
                    setIsExpanded(true);
                  }}
                  className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium transition ${
                    activeTab === idx && isExpanded
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {sol.title || `Sol ${idx + 1}`}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-semibold text-indigo-500 hover:underline shrink-0"
            >
              {isExpanded ? "Collapse" : "View Code"}
            </button>
          </div>

          {/* Active Solution Code */}
          {isExpanded && activeSolution && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">
                    {activeSolution.language}
                  </span>
                  {activeSolution.timeComplexity && (
                    <span className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
                      <FiClock className="w-3 h-3" /> {activeSolution.timeComplexity}
                    </span>
                  )}
                  {activeSolution.spaceComplexity && (
                    <span className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
                      <FiCpu className="w-3 h-3" /> {activeSolution.spaceComplexity}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleCopyCode(activeSolution.code)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition flex items-center gap-1"
                >
                  {copied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {activeSolution.explanation && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  💡 {activeSolution.explanation}
                </p>
              )}

              <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono overflow-x-auto max-h-72">
                <code>{activeSolution.code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
