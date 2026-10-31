import { useState, useMemo } from "react";
import {
  FiFolder,
  FiTag,
  FiPlus,
  FiTrash2,
  FiFilter,
  FiCheck,
  FiLayers,
  FiRotateCcw,
  FiSliders,
  FiBookmark,
  FiDownload,
  FiUpload,
  FiServer,
  FiActivity,
  FiCpu,
  FiGrid,
  FiCheckCircle,
  FiAlertTriangle,
  FiEdit2
} from "react-icons/fi";

const STATUSES = ["All", "Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const PARENT_GROUPS = ["Data Structures", "Algorithms", "Companies", "Custom Lists", "None"];

const PRESET_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#64748b",
];

// Common quick preset shortcuts
const QUICK_PRESETS = [
  { label: "Show All", preset: { tagId: null, status: "All", difficulty: "All", favorite: false } },
  { label: "Must Revise Only", preset: { tagId: null, status: "Must Revise", difficulty: "All", favorite: false } },
  { label: "Unsolved (Todo / Attempted)", preset: { tagId: null, status: "Todo", difficulty: "All", favorite: false } },
  { label: "Starred / Bookmarks", preset: { tagId: null, status: "All", difficulty: "All", favorite: true } },
  { label: "Hard Problems", preset: { tagId: null, status: "All", difficulty: "Hard", favorite: false } },
];

export default function SettingsView({
  tags,
  activeFilterPreset,
  onApplyPreset,
  onSaveNewTag,
  onDeleteTag,
  problems,
  darkMode,
}) {
  const [activeSection, setActiveSection] = useState("presets"); // 'presets' | 'tags' | 'data' | 'system'

  // Local active preset state
  const [selectedTagId, setSelectedTagId] = useState(activeFilterPreset?.tagId || null);
  const [selectedStatus, setSelectedStatus] = useState(activeFilterPreset?.status || "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState(activeFilterPreset?.difficulty || "All");
  const [favoritesOnly, setFavoritesOnly] = useState(Boolean(activeFilterPreset?.favorite));
  const [savedFeedback, setSavedFeedback] = useState(false);

  // New tag form state
  const [newTagName, setNewTagName] = useState("");
  const [newTagGroup, setNewTagGroup] = useState("Data Structures");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  // Tag search/filter in manager
  const [tagSearch, setTagSearch] = useState("");

  // Group tags by category
  const groupedTags = useMemo(() => {
    return tags.reduce((acc, tag) => {
      const group = tag.parentGroup || "Custom Lists";
      if (!acc[group]) acc[group] = [];
      acc[group].push(tag);
      return acc;
    }, {});
  }, [tags]);

  // Filtered tags for manager search
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags;
    const q = tagSearch.toLowerCase();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.parentGroup && t.parentGroup.toLowerCase().includes(q))
    );
  }, [tags, tagSearch]);

  const handleApplyPreset = () => {
    const preset = {
      tagId: selectedTagId,
      status: selectedStatus,
      difficulty: selectedDifficulty,
      favorite: favoritesOnly,
    };
    onApplyPreset(preset);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleQuickPresetClick = (preset) => {
    setSelectedTagId(preset.tagId);
    setSelectedStatus(preset.status);
    setSelectedDifficulty(preset.difficulty);
    setFavoritesOnly(preset.favorite);
    onApplyPreset(preset);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleResetFilters = () => {
    const reset = { tagId: null, status: "All", difficulty: "All", favorite: false };
    setSelectedTagId(null);
    setSelectedStatus("All");
    setSelectedDifficulty("All");
    setFavoritesOnly(false);
    onApplyPreset(reset);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onSaveNewTag({
      name: newTagName.trim(),
      parentGroup: newTagGroup === "None" ? null : newTagGroup,
      color: newTagColor,
    });
    setNewTagName("");
  };

  // Export JSON backup of all problems and tags
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      problemsCount: problems?.length || 0,
      tagsCount: tags?.length || 0,
      tags,
      problems,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa_sheet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <FiSliders className="text-indigo-500 w-5 h-5" /> Workspace Settings
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Control default view presets, tag hierarchies, backups, and backend server endpoints.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveSection("presets")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeSection === "presets"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Filter Presets
          </button>
          <button
            onClick={() => setActiveSection("tags")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeSection === "tags"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Manage Topics ({tags.length})
          </button>
          <button
            onClick={() => setActiveSection("data")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeSection === "data"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Backup & Export
          </button>
          <button
            onClick={() => setActiveSection("system")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeSection === "system"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Connection
          </button>
        </div>
      </div>

      {/* SECTION 1: FILTER PRESETS */}
      {activeSection === "presets" && (
        <div className="space-y-6">
          {/* Quick Preset Badges */}
          <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Quick Focus Presets (One-Click)
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPresetClick(qp.preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                    selectedStatus === qp.preset.status &&
                    selectedDifficulty === qp.preset.difficulty &&
                    favoritesOnly === qp.preset.favorite &&
                    selectedTagId === qp.preset.tagId
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : darkMode
                      ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                      : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Filter Configuration Card */}
          <div className={`p-6 rounded-2xl border space-y-5 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FiFilter className="text-indigo-500" /> Custom Problem View Configuration
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select your current target. The main Problems screen stays clean and strictly displays this selection.
                </p>
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 font-medium"
              >
                <FiRotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Problem Status Filter</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                      selectedStatus === s
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : darkMode
                        ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Difficulty Focus</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition text-center ${
                      selectedDifficulty === d
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : darkMode
                        ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Target Concept / Topic</label>
                {selectedTagId && (
                  <button
                    onClick={() => setSelectedTagId(null)}
                    className="text-[11px] text-indigo-500 hover:underline"
                  >
                    Show All Topics
                  </button>
                )}
              </div>
              <select
                value={selectedTagId || ""}
                onChange={(e) => setSelectedTagId(e.target.value ? e.target.value : null)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
              >
                <option value="">All Topics & Categories (Default)</option>
                {Object.entries(groupedTags).map(([group, groupTags]) => (
                  <optgroup key={group} label={group}>
                    {groupTags.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Bookmark Filter */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-700 dark:text-neutral-300 pt-1">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1.5">
                <FiBookmark className="text-amber-500" /> Only show Bookmarked / Starred Problems
              </span>
            </label>

            {/* Save Button */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                {savedFeedback && (
                  <span className="text-emerald-500 text-xs inline-flex items-center gap-1 font-semibold">
                    <FiCheck className="w-3.5 h-3.5" /> Preset saved & active!
                  </span>
                )}
              </div>
              <button
                onClick={handleApplyPreset}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm flex items-center gap-2"
              >
                <FiCheck className="w-3.5 h-3.5" /> Apply & Save View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TOPICS & TAGS MANAGEMENT */}
      {activeSection === "tags" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Tag Card */}
          <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiPlus className="text-indigo-500" /> Add New Topic / Tag
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Create sub-topics under Data Structures, Algorithms, or standalone lists.
            </p>

            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Monotonic Stack, Disjoint Set, Top 150"
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                    darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Parent Category Group
                </label>
                <select
                  value={newTagGroup}
                  onChange={(e) => setNewTagGroup(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                    darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                  }`}
                >
                  {PARENT_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-2">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewTagColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition transform ${
                        newTagColor === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm flex items-center justify-center gap-2"
              >
                <FiPlus className="w-3.5 h-3.5" /> Create Topic
              </button>
            </form>
          </div>

          {/* Tag List & Hierarchy */}
          <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Topic Directory ({tags.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Organized by parent group. Delete any tag anytime.
                </p>
              </div>

              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search topics..."
                className={`px-3 py-1.5 rounded-xl text-xs border outline-none font-medium w-full sm:w-56 ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {Object.entries(groupedTags).map(([group, groupTags]) => {
                const visibleInGroup = groupTags.filter((t) =>
                  tagSearch.trim() ? t.name.toLowerCase().includes(tagSearch.toLowerCase()) : true
                );

                if (visibleInGroup.length === 0) return null;

                return (
                  <div
                    key={group}
                    className={`p-3.5 rounded-xl border ${
                      darkMode ? "bg-neutral-950/60 border-neutral-800" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FiFolder className="text-indigo-500" /> {group}
                    </span>
                    <div className="space-y-1">
                      {visibleInGroup.map((tag) => (
                        <div
                          key={tag._id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">{tag.name}</span>
                          </span>
                          <button
                            onClick={() => onDeleteTag(tag._id)}
                            className="text-neutral-400 hover:text-rose-500 p-1"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: BACKUP & DATA EXPORT */}
      {activeSection === "data" && (
        <div className={`p-6 rounded-2xl border space-y-5 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiDownload className="text-indigo-500" /> Data Export & Backup
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Safely export all your problems, code solutions, time complexities, and categories as an offline JSON backup.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm flex items-center gap-2"
            >
              <FiDownload className="w-3.5 h-3.5" /> Download JSON Backup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-xl border ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
              <span className="text-xs font-bold block mb-1">Total Stored Problems</span>
              <span className="text-xl font-black text-indigo-500">{problems?.length || 0}</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Includes all solutions, links, and tricky edge case notes.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
              <span className="text-xs font-bold block mb-1">Total Categorized Tags</span>
              <span className="text-xl font-black text-emerald-500">{tags?.length || 0}</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Data structures, algorithms, and custom tags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SYSTEM & ENDPOINTS */}
      {activeSection === "system" && (
        <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FiServer className="text-indigo-500" /> Backend API & Environment Status
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Details of active services running for this instance.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
              <span>Active API Base URL:</span>
              <span className="text-indigo-500 font-bold">{import.meta.env.API_BASE_URL || "http://localhost:5001"}</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
              <span>MongoDB Database:</span>
              <span className="text-emerald-500 font-bold">dsa_sheet (Atlas Cluster0)</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
              <span>Mode:</span>
              <span className="text-neutral-400">{import.meta.env.MODE || "development"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
