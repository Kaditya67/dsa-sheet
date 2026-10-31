import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiExternalLink,
  FiCode,
  FiTag,
  FiBookOpen,
  FiClock,
  FiCpu
} from "react-icons/fi";

const PLATFORMS = ["LeetCode", "GeeksforGeeks", "Codeforces", "CodeChef", "HackerRank", "YouTube", "Other"];
const STATUSES = ["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "go", label: "Go" },
];

export default function ProblemModal({ isOpen, onClose, onSave, initialData, tags, darkMode }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Medium");
  const [status, setStatus] = useState(initialData?.status || "Todo");
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false);
  const [selectedTagIds, setSelectedTagIds] = useState(
    initialData?.tags ? initialData.tags.map((t) => (typeof t === "object" ? t._id : t)) : []
  );

  const [links, setLinks] = useState(
    initialData?.links && initialData.links.length > 0
      ? initialData.links
      : [{ platform: "LeetCode", url: "", label: "" }]
  );

  const [solutions, setSolutions] = useState(
    initialData?.solutions && initialData.solutions.length > 0
      ? initialData.solutions
      : [
          {
            title: "Optimal Approach",
            language: "cpp",
            code: "",
            timeComplexity: "O(N)",
            spaceComplexity: "O(1)",
            explanation: "",
          },
        ]
  );

  const [personalNotes, setPersonalNotes] = useState(initialData?.personalNotes || "");
  const [activeSolutionTab, setActiveSolutionTab] = useState(0);

  if (!isOpen) return null;

  // Link helpers
  const handleAddLink = () => {
    setLinks([...links, { platform: "LeetCode", url: "", label: "" }]);
  };
  const handleRemoveLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };
  const handleLinkChange = (idx, field, value) => {
    const updated = [...links];
    updated[idx] = { ...updated[idx], [field]: value };
    setLinks(updated);
  };

  // Solution helpers
  const handleAddSolution = () => {
    const newIdx = solutions.length;
    setSolutions([
      ...solutions,
      {
        title: `Approach ${newIdx + 1}`,
        language: "cpp",
        code: "",
        timeComplexity: "",
        spaceComplexity: "",
        explanation: "",
      },
    ]);
    setActiveSolutionTab(newIdx);
  };

  const handleRemoveSolution = (idx) => {
    if (solutions.length === 1) return;
    const updated = solutions.filter((_, i) => i !== idx);
    setSolutions(updated);
    setActiveSolutionTab(Math.max(0, idx - 1));
  };

  const handleSolutionChange = (idx, field, value) => {
    const updated = [...solutions];
    updated[idx] = { ...updated[idx], [field]: value };
    setSolutions(updated);
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter problem title");

    const cleanedLinks = links.filter((l) => l.url && l.url.trim());
    const cleanedSolutions = solutions.filter((s) => s.code && s.code.trim());

    onSave({
      title,
      difficulty,
      status,
      isFavorite,
      tags: selectedTagIds,
      links: cleanedLinks,
      solutions: cleanedSolutions,
      personalNotes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400">
              <FiBookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold">{initialData ? "Edit DSA Problem" : "Add New DSA Problem"}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Record solutions, platforms, patterns, and notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Problem Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Trapping Rain Water, 3Sum, Course Schedule"
                className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                }`}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                }`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
                />
                <span>⭐ Bookmark as High Priority / Favorite</span>
              </label>
            </div>
          </div>

          {/* Section 2: Tags & Groups */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5 text-indigo-500" /> Topic & Pattern Tags
              </label>
              <span className="text-[11px] text-neutral-400">Click to attach/detach tags</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t._id);
                return (
                  <button
                    type="button"
                    key={t._id}
                    onClick={() => toggleTag(t._id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : darkMode
                        ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {t.parentGroup ? `${t.parentGroup} › ${t.name}` : t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Multi-Platform Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FiExternalLink className="w-3.5 h-3.5 text-indigo-500" /> Problem Links
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => handleLinkChange(idx, "platform", e.target.value)}
                    className={`w-36 px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                    }`}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                    }`}
                  />
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                    placeholder="Label (optional)"
                    className={`w-32 px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium hidden sm:block ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                    }`}
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Multi-Approach Solutions */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FiCode className="w-3.5 h-3.5 text-indigo-500" /> Solution Code Approaches
              </label>
              <button
                type="button"
                onClick={handleAddSolution}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Another Approach
              </button>
            </div>

            {/* Approach Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {solutions.map((sol, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveSolutionTab(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border shrink-0 ${
                    activeSolutionTab === idx
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : darkMode
                      ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                      : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {sol.title || `Approach ${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Active Approach Fields */}
            {solutions[activeSolutionTab] && (
              <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <input
                      type="text"
                      value={solutions[activeSolutionTab].title}
                      onChange={(e) => handleSolutionChange(activeSolutionTab, "title", e.target.value)}
                      placeholder="e.g. Brute Force, Two Pointers, Monotonic Stack"
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none font-semibold ${
                        darkMode ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-300 text-neutral-900"
                      }`}
                    />
                    <select
                      value={solutions[activeSolutionTab].language}
                      onChange={(e) => handleSolutionChange(activeSolutionTab, "language", e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border outline-none font-semibold ${
                        darkMode ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-300 text-neutral-900"
                      }`}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px]">
                      <FiClock className="w-3 h-3 text-neutral-400" />
                      <input
                        type="text"
                        value={solutions[activeSolutionTab].timeComplexity}
                        onChange={(e) => handleSolutionChange(activeSolutionTab, "timeComplexity", e.target.value)}
                        placeholder="Time: O(N)"
                        className={`w-20 px-2 py-1 rounded text-[11px] border outline-none ${
                          darkMode ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-300 text-neutral-900"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <FiCpu className="w-3 h-3 text-neutral-400" />
                      <input
                        type="text"
                        value={solutions[activeSolutionTab].spaceComplexity}
                        onChange={(e) => handleSolutionChange(activeSolutionTab, "spaceComplexity", e.target.value)}
                        placeholder="Space: O(1)"
                        className={`w-20 px-2 py-1 rounded text-[11px] border outline-none ${
                          darkMode ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-300 text-neutral-900"
                        }`}
                      />
                    </div>

                    {solutions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSolution(activeSolutionTab)}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Delete this approach"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={solutions[activeSolutionTab].code}
                  onChange={(e) => handleSolutionChange(activeSolutionTab, "code", e.target.value)}
                  placeholder="// Paste your code here..."
                  className={`w-full p-3 rounded-lg text-xs font-mono outline-none border ${
                    darkMode ? "bg-neutral-900 border-neutral-800 text-green-400" : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                />

                <input
                  type="text"
                  value={solutions[activeSolutionTab].explanation}
                  onChange={(e) => handleSolutionChange(activeSolutionTab, "explanation", e.target.value)}
                  placeholder="Key intuition / notes for this approach..."
                  className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none ${
                    darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Section 5: Tricky Edge Cases & General Notes */}
          <div className="space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Tricky Test Cases, Pitfalls & Quick Revision Notes
            </label>
            <textarea
              rows={3}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="e.g. Remember empty string case, negative numbers, overflow if sum exceeds INT_MAX..."
              className={`w-full p-3 rounded-xl text-xs border outline-none font-medium ${
                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20"
            >
              Save Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
