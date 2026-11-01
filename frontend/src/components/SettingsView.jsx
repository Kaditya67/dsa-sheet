import { useState, useMemo, useRef, useEffect } from "react";
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
  FiServer,
  FiChevronDown,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiDatabase,
  FiActivity,
  FiEdit3,
  FiCode
} from "react-icons/fi";

const STATUS_ITEMS = [
  { value: "All", label: "All Statuses", color: "#64748b" },
  { value: "Todo", label: "Todo", color: "#94a3b8" },
  { value: "Attempted", label: "Attempted", color: "#f59e0b" },
  { value: "Understood", label: "Understood", color: "#3b82f6" },
  { value: "Solved", label: "Solved", color: "#10b981" },
  { value: "Must Revise", label: "Must Revise", color: "#f43f5e" },
  { value: "Mastered", label: "Mastered", color: "#a855f7" },
];

const DIFFICULTY_ITEMS = [
  { value: "All", label: "All Difficulties" },
  { value: "Easy", label: "Easy", color: "#10b981" },
  { value: "Medium", label: "Medium", color: "#f59e0b" },
  { value: "Hard", label: "Hard", color: "#f43f5e" },
];

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

const QUICK_PRESETS = [
  { label: "Show All", preset: { tagId: null, status: "All", difficulty: "All", favorite: false } },
  { label: "Must Revise Only", preset: { tagId: null, status: "Must Revise", difficulty: "All", favorite: false } },
  { label: "Unsolved Problems", preset: { tagId: null, status: "Todo", difficulty: "All", favorite: false } },
  { label: "Starred / Bookmarks", preset: { tagId: null, status: "All", difficulty: "All", favorite: true } },
  { label: "Hard Challenges", preset: { tagId: null, status: "All", difficulty: "Hard", favorite: false } },
];

export default function SettingsView({
  tags,
  activeFilterPreset,
  onApplyPreset,
  onSaveNewTag,
  onDeleteTag,
  problems,
  darkMode,
  onOpenJsonEditor,
}) {
  const [activeSection, setActiveSection] = useState("presets"); // 'presets' | 'tags' | 'data' | 'system'

  // Presets state
  const [selectedTagId, setSelectedTagId] = useState(activeFilterPreset?.tagId || null);
  const [selectedStatus, setSelectedStatus] = useState(activeFilterPreset?.status || "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState(activeFilterPreset?.difficulty || "All");
  const [favoritesOnly, setFavoritesOnly] = useState(Boolean(activeFilterPreset?.favorite));
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Custom Topic Dropdown Search & State
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [topicDropdownSearch, setTopicDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // Category Dropdown for new tag
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // New tag form state
  const [newTagName, setNewTagName] = useState("");
  const [newTagGroup, setNewTagGroup] = useState("Data Structures");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  // Tag search in directory
  const [tagDirectorySearch, setTagDirectorySearch] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsTopicDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Group tags by parentGroup
  const groupedTags = useMemo(() => {
    return tags.reduce((acc, tag) => {
      const group = tag.parentGroup || "Custom Lists";
      if (!acc[group]) acc[group] = [];
      acc[group].push(tag);
      return acc;
    }, {});
  }, [tags]);

  // Selected tag object
  const selectedTagObj = useMemo(() => {
    if (!selectedTagId) return null;
    return tags.find((t) => t._id === selectedTagId) || null;
  }, [tags, selectedTagId]);

  // Filtered grouped tags in dropdown search
  const filteredDropdownGroups = useMemo(() => {
    const q = topicDropdownSearch.toLowerCase().trim();
    if (!q) return groupedTags;

    const result = {};
    Object.entries(groupedTags).forEach(([groupName, groupTags]) => {
      const matchingTags = groupTags.filter(
        (t) => t.name.toLowerCase().includes(q) || groupName.toLowerCase().includes(q)
      );
      if (matchingTags.length > 0) {
        result[groupName] = matchingTags;
      }
    });
    return result;
  }, [groupedTags, topicDropdownSearch]);

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
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-neutral-900 dark:text-white">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400">
              <FiSliders className="w-5 h-5" />
            </span>
            <span>Settings & Preferences</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Configure default problem views, manage custom topics, and export backups.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/60 dark:border-neutral-800">
          <button
            onClick={() => setActiveSection("presets")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === "presets"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            View Presets
          </button>
          <button
            onClick={() => setActiveSection("tags")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === "tags"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Topics ({tags.length})
          </button>
          <button
            onClick={() => setActiveSection("data")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === "data"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Backup
          </button>
          <button
            onClick={() => setActiveSection("system")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === "system"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Connection
          </button>
        </div>
      </div>

      {/* SECTION 1: FILTER PRESETS */}
      {activeSection === "presets" && (
        <div className="space-y-6">
          {/* Quick Preset Buttons */}
          <div
            className={`p-5 rounded-3xl border shadow-xs ${
              darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Instant Quick-Focus Presets
              </span>
              <span className="text-[11px] text-neutral-400">Click to activate immediately</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((qp, idx) => {
                const isActive =
                  selectedStatus === qp.preset.status &&
                  selectedDifficulty === qp.preset.difficulty &&
                  favoritesOnly === qp.preset.favorite &&
                  selectedTagId === qp.preset.tagId;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickPresetClick(qp.preset)}
                    className={`text-xs px-3.5 py-2 rounded-xl border font-semibold transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                        : darkMode
                        ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{qp.label}</span>
                    {isActive && <FiCheck className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Filter Setting */}
          <div
            className={`p-6 sm:p-7 rounded-3xl border shadow-xs space-y-6 ${
              darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FiFilter className="text-indigo-500" /> Custom Problem Directory Filter
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Set the default view parameters. The main Problems tab will display according to these rules.
                </p>
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium inline-flex items-center gap-1.5 transition"
              >
                <FiRotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Status Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Target Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {STATUS_ITEMS.map((item) => {
                  const isSelected = selectedStatus === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedStatus(item.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {item.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? "#fff" : item.color }}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Difficulty Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTY_ITEMS.map((d) => {
                  const isSelected = selectedDifficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {d.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? "#fff" : d.color }}
                        />
                      )}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Modern Topic Select Dropdown */}
            <div className="space-y-2" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Topic / Concept Filter
                </label>
                {selectedTagId && (
                  <button
                    type="button"
                    onClick={() => setSelectedTagId(null)}
                    className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Clear Topic Selection</span>
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-semibold transition outline-none ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white hover:border-neutral-700"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedTagObj ? (
                      <>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: selectedTagObj.color }}
                        />
                        <span className="text-neutral-400 font-normal">
                          {selectedTagObj.parentGroup ? `${selectedTagObj.parentGroup} › ` : ""}
                        </span>
                        <span>{selectedTagObj.name}</span>
                      </>
                    ) : (
                      <span className="text-neutral-500">All Topics & Categories (No Filter)</span>
                    )}
                  </div>
                  <FiChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                      isTopicDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popover */}
                {isTopicDropdownOpen && (
                  <div
                    className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl p-2 max-h-72 flex flex-col transition-all ${
                      darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                    }`}
                  >
                    {/* Search inside dropdown */}
                    <div className="relative mb-2 px-1">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={topicDropdownSearch}
                        onChange={(e) => setTopicDropdownSearch(e.target.value)}
                        placeholder="Search topic or category..."
                        className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none font-medium ${
                          darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        }`}
                      />
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                      {/* Option for All */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTagId(null);
                          setIsTopicDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                          !selectedTagId
                            ? "bg-indigo-600 text-white"
                            : darkMode
                            ? "hover:bg-neutral-800 text-neutral-300"
                            : "hover:bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        <span>All Topics (Default)</span>
                        {!selectedTagId && <FiCheck className="w-3.5 h-3.5" />}
                      </button>

                      {/* Grouped tags */}
                      {Object.entries(filteredDropdownGroups).map(([group, groupTags]) => (
                        <div key={group} className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 block">
                            {group}
                          </span>
                          <div className="space-y-0.5">
                            {groupTags.map((tag) => {
                              const isSelected = selectedTagId === tag._id;
                              return (
                                <button
                                  key={tag._id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTagId(tag._id);
                                    setIsTopicDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition text-left ${
                                    isSelected
                                      ? "bg-indigo-600 text-white font-semibold"
                                      : darkMode
                                      ? "hover:bg-neutral-800 text-neutral-300"
                                      : "hover:bg-neutral-100 text-neutral-700"
                                  }`}
                                >
                                  <span className="flex items-center gap-2 truncate">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: tag.color }}
                                    />
                                    <span>{tag.name}</span>
                                  </span>
                                  {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bookmark Toggle */}
            <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition ${
              darkMode ? "border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
            }`}>
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <span className="text-xs font-bold block flex items-center gap-1.5">
                  <FiStar className="text-amber-500 fill-amber-500 w-3.5 h-3.5" /> Only show Bookmarked Problems
                </span>
                <span className="text-[11px] text-neutral-400">
                  Focus solely on high-priority starred problems
                </span>
              </div>
            </label>

            {/* Save Action Footer */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                {savedFeedback && (
                  <span className="text-emerald-500 text-xs inline-flex items-center gap-1.5 font-bold animate-fadeIn">
                    <FiCheckCircle className="w-4 h-4" /> View settings saved!
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" /> Apply & Save View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TOPICS & TAGS MANAGEMENT */}
      {activeSection === "tags" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Topic Form Card */}
          <div
            className={`p-6 rounded-3xl border shadow-xs space-y-5 ${
              darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiPlus className="text-indigo-500" /> Create Topic or Tag
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Add concept tags under Data Structures or Algorithms.
              </p>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Disjoint Set Union, Segment Tree"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Parent Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PARENT_GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewTagGroup(g)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                        newTagGroup === g
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                  Color Tag
                </label>
                <div className="flex items-center gap-2 flex-wrap">
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
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Topic to Collection
              </button>
            </form>
          </div>

          {/* Tag Directory */}
          <div
            className={`lg:col-span-2 p-6 rounded-3xl border shadow-xs space-y-4 ${
              darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Topic Directory ({tags.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Organized by parent category.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  value={tagDirectorySearch}
                  onChange={(e) => setTagDirectorySearch(e.target.value)}
                  placeholder="Filter topics..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none font-medium ${
                    darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {Object.entries(groupedTags).map(([group, groupTags]) => {
                const visibleInGroup = groupTags.filter((t) =>
                  tagDirectorySearch.trim()
                    ? t.name.toLowerCase().includes(tagDirectorySearch.toLowerCase())
                    : true
                );

                if (visibleInGroup.length === 0) return null;

                return (
                  <div
                    key={group}
                    className={`p-3.5 rounded-2xl border ${
                      darkMode ? "bg-neutral-950/70 border-neutral-800" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FiFolder className="text-indigo-500" /> {group}
                    </span>
                    <div className="space-y-1">
                      {visibleInGroup.map((tag) => (
                        <div
                          key={tag._id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {tag.name}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteTag(tag._id)}
                            className="text-neutral-400 hover:text-rose-500 p-1 transition"
                            title="Delete Tag"
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
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-xs space-y-6 ${
            darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiDownload className="text-indigo-500" /> Backup, Export & Bulk JSON
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Download an offline backup, or bulk edit and import problems and structures using the JSON Editor.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenJsonEditor && (
                <button
                  onClick={onOpenJsonEditor}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 ${
                    darkMode
                      ? "border-neutral-700 bg-neutral-800 text-white hover:border-indigo-500 hover:text-indigo-400"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-indigo-500 hover:text-indigo-600 shadow-sm"
                  }`}
                >
                  <FiCode className="w-4 h-4 text-indigo-500" /> Bulk JSON Editor
                </button>
              )}

              <button
                onClick={handleExportBackup}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" /> Download Backup
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Problems Stored
              </span>
              <span className="text-2xl font-black text-indigo-500">{problems?.length || 0}</span>
              <p className="text-[11px] text-neutral-400 mt-2">
                Includes all approach variations, time/space complexities, and personal edge case notes.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Topic Tags Configured
              </span>
              <span className="text-2xl font-black text-emerald-500">{tags?.length || 0}</span>
              <p className="text-[11px] text-neutral-400 mt-2">
                Includes all categorized Data Structures, Algorithms, and standalone tags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SYSTEM & ENDPOINTS */}
      {activeSection === "system" && (
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-xs space-y-5 ${
            darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200"
          }`}
        >
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiServer className="text-indigo-500" /> Connection & Environment Status
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Current API host and database connection.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <span className="text-neutral-400">Backend API URL:</span>
              <span className="text-indigo-500 font-bold">{import.meta.env.API_BASE_URL || "http://localhost:5001"}</span>
            </div>

            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <span className="text-neutral-400">MongoDB Database:</span>
              <span className="text-emerald-500 font-bold">dsa_sheet (Atlas Cluster0)</span>
            </div>

            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <span className="text-neutral-400">App Mode:</span>
              <span className="text-neutral-300 font-semibold">{import.meta.env.MODE || "development"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
