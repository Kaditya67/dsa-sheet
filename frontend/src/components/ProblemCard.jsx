import { useState, useRef, useEffect } from "react";
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
  FiChevronUp,
  FiMoreVertical,
  FiPlus,
  FiTag
} from "react-icons/fi";

const STATUS_COLORS = {
  Todo: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  Attempted: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Understood: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  Solved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-semibold",
  "Must Revise": "bg-rose-500/15 text-rose-500 border-rose-500/30 font-bold",
  Mastered: "bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold",
};

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
  Medium: "text-amber-500 bg-amber-500/10 border-amber-500/25",
  Hard: "text-rose-500 bg-rose-500/10 border-rose-500/25",
};

export default function ProblemCard({
  problem,
  onStatusChange,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddSolution,
  onEditSolution,
  onDeleteSolution,
  darkMode,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const activeSolution = problem.solutions && problem.solutions[activeTab];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-xs hover:border-indigo-500/40 hover:shadow-md ${
        darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
      }`}
    >
      {/* Main Problem Header Row */}
      <div className="p-3 sm:px-4 sm:py-3 flex items-start sm:items-center justify-between gap-3">
        {/* Left Column: Star + Title + Interactive Tags below */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bookmark */}
            <button
              onClick={() => onToggleFavorite(problem._id)}
              className={`p-1 rounded-md transition shrink-0 ${
                problem.isFavorite
                  ? "text-amber-500"
                  : "text-neutral-400 hover:text-amber-500"
              }`}
              title="Bookmark"
            >
              <FiStar className={`w-3.5 h-3.5 ${problem.isFavorite ? "fill-amber-500" : ""}`} />
            </button>

            {/* Difficulty Badge */}
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                DIFFICULTY_COLORS[problem.difficulty]
              }`}
            >
              {problem.difficulty}
            </span>

            {/* Problem Title (Opens/Closes Solution Viewer) */}
            <h3
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white truncate cursor-pointer hover:text-indigo-500 transition"
              title="Click to view solutions & notes"
            >
              {problem.title}
            </h3>

            {/* Multiple Platform Direct Links Icons */}
            {problem.links && problem.links.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {problem.links.map((link, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLinkClick(link.url)}
                    className="p-1 rounded text-indigo-500 hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-[11px] font-medium"
                    title={`Open in ${link.platform}: ${link.url}`}
                  >
                    <span>{link.label || link.platform}</span>
                    <FiExternalLink className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description line if any */}
          {problem.description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate pl-6">
              {problem.description}
            </p>
          )}

          {/* Tags Mentioned Just Below Problem (Clicking navigates to link or filters) */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pl-6 pt-0.5">
              {problem.tags.map((tag) => (
                <span
                  key={tag._id}
                  style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}35`, color: tag.color }}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 select-none"
                >
                  <FiTag className="w-2.5 h-2.5" />
                  <span>{tag.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Status + Solution Drawer Pill + Three Dots Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown */}
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

          {/* Solutions Toggle Button / Quick Count */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-[10px] px-2 py-1 rounded-md border font-semibold transition flex items-center gap-1 ${
              isExpanded
                ? "bg-indigo-600 text-white border-indigo-600"
                : darkMode
                ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
            }`}
            title="View or add solutions"
          >
            <FiCode className="w-3 h-3 text-indigo-400" />
            <span>{problem.solutions?.length || 0}</span>
            {isExpanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
          </button>

          {/* Three-dots Menu for Problem & Add Solution */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Options"
            >
              <FiMoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-1 z-30 w-36 rounded-xl border shadow-xl p-1 space-y-0.5 text-xs ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onAddSolution(problem);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-indigo-500 font-semibold hover:bg-indigo-500/10 text-left transition"
                >
                  <FiPlus className="w-3 h-3" />
                  <span>Add Solution</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(problem);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left transition text-neutral-300"
                >
                  <FiEdit className="w-3 h-3" />
                  <span>Edit Problem</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(problem._id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-left transition"
                >
                  <FiTrash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compressed Accordion: Multi-Solutions Viewer & Quick Add Button */}
      {isExpanded && (
        <div className={`border-t p-3.5 space-y-3 ${darkMode ? "border-neutral-800 bg-neutral-950/70" : "border-neutral-100 bg-neutral-50/70"}`}>
          {/* Header Bar of Solution Drawer: Approaches Tabs + Add Approach Button */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {problem.solutions && problem.solutions.length > 0 ? (
                problem.solutions.map((sol, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition ${
                      activeTab === idx
                        ? "bg-indigo-600 text-white shadow-xs"
                        : darkMode
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-900"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200"
                    }`}
                  >
                    {sol.title || `Approach ${idx + 1}`}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-neutral-400 italic">No solution code added yet.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Add Solution button */}
              <button
                onClick={() => onAddSolution(problem)}
                className="text-[10px] font-semibold px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs flex items-center gap-1"
              >
                <FiPlus className="w-3 h-3" />
                <span>Add Solution</span>
              </button>

              {activeSolution && (
                <>
                  <button
                    onClick={() => onEditSolution(problem, activeTab)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Edit this approach"
                  >
                    <FiEdit className="w-3 h-3" />
                  </button>

                  {onDeleteSolution && (
                    <button
                      onClick={() => onDeleteSolution(problem, activeTab)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-500 transition"
                      title="Delete this approach"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyCode(activeSolution.code)}
                    className="text-[10px] px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold inline-flex items-center gap-1"
                  >
                    {copied ? <FiCheck className="w-2.5 h-2.5 text-emerald-500" /> : <FiCopy className="w-2.5 h-2.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active Solution Code & Intuition View */}
          {activeSolution ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                <span className="uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  {activeSolution.language}
                </span>

                {activeSolution.timeComplexity && (
                  <span className="inline-flex items-center gap-1">
                    <FiClock className="w-2.5 h-2.5" /> Time: {activeSolution.timeComplexity}
                  </span>
                )}

                {activeSolution.spaceComplexity && (
                  <span className="inline-flex items-center gap-1">
                    <FiCpu className="w-2.5 h-2.5" /> Space: {activeSolution.spaceComplexity}
                  </span>
                )}
              </div>

              {activeSolution.explanation && (
                <div className="text-[11px] text-neutral-300 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                  <span className="font-semibold text-neutral-400">Intuition: </span>
                  <span>{activeSolution.explanation}</span>
                </div>
              )}

              <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono overflow-x-auto max-h-72">
                <code>{activeSolution.code}</code>
              </pre>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-xs text-neutral-400 mb-2">No approaches saved for this problem.</p>
              <button
                onClick={() => onAddSolution(problem)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                + Add First Solution Approach
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
