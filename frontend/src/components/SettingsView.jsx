import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiFolder,
  FiPlus,
  FiTrash2,
  FiFilter,
  FiCheck,
  FiRotateCcw,
  FiSliders,
  FiDownload,
  FiServer,
  FiChevronDown,
  FiSearch,
  FiX,
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

const QUICK_PRESETS = [
  { label: "Show All", preset: { tagId: null, status: "All", difficulty: "All", favorite: false } },
  { label: "Must Revise", preset: { tagId: null, status: "Must Revise", difficulty: "All", favorite: false } },
  { label: "Unsolved", preset: { tagId: null, status: "Todo", difficulty: "All", favorite: false } },
  { label: "Bookmarks", preset: { tagId: null, status: "All", difficulty: "All", favorite: true } },
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
  onOpenJsonEditor,
}) {
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
    return (tags || []).reduce((acc, tag) => {
      const group = tag.parentGroup || "Custom Lists";
      if (!acc[group]) acc[group] = [];
      acc[group].push(tag);
      return acc;
    }, {});
  }, [tags]);

  // Selected tag object
  const selectedTagObj = useMemo(() => {
    if (!selectedTagId || !tags) return null;
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
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleQuickPresetClick = (preset) => {
    setSelectedTagId(preset.tagId);
    setSelectedStatus(preset.status);
    setSelectedDifficulty(preset.difficulty);
    setFavoritesOnly(Boolean(preset.favorite));

    onApplyPreset(preset);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleResetFilters = () => {
    const defaultPreset = { tagId: null, status: "All", difficulty: "All", favorite: false };
    setSelectedTagId(null);
    setSelectedStatus("All");
    setSelectedDifficulty("All");
    setFavoritesOnly(false);
    onApplyPreset(defaultPreset);
  };

  const handleCreateTagSubmit = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    await onSaveNewTag({
      name: newTagName.trim(),
      parentGroup: newTagGroup === "None" ? null : newTagGroup,
      color: newTagColor,
    });

    setNewTagName("");
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      problemsCount: problems.length,
      tagsCount: tags.length,
      tags,
      problems,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
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
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      {/* Top Header Row with Feedback & JSON trigger */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <FiSliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Workspace Settings
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-fadeIn">
              <FiCheck className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {onOpenJsonEditor && (
            <button
              onClick={onOpenJsonEditor}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                darkMode
                  ? "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700 hover:text-white"
                  : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 shadow-xs"
              }`}
            >
              <FiCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bulk JSON Editor</span>
            </button>
          )}

          <button
            onClick={handleExportBackup}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs flex items-center gap-1.5"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN SPLIT SCREEN LAYOUT ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: FILTER PRESETS & DIRECTORY RULES (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Presets */}
          <div
            className={`p-4 rounded-xl border ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Instant Focus Presets
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
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

          {/* Detailed Custom Preset Controls */}
          <div
            className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <FiFilter className="text-indigo-500" /> Directory Filter Rules
              </h3>

              <button
                onClick={handleResetFilters}
                className="text-[11px] px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium inline-flex items-center gap-1 transition"
              >
                <FiRotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Status Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                Target Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                {STATUS_ITEMS.map((item) => {
                  const isSelected = selectedStatus === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedStatus(item.value)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition text-center flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {item.color && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                Difficulty Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DIFFICULTY_ITEMS.map((d) => {
                  const isSelected = selectedDifficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {d.color && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? "#fff" : d.color }}
                        />
                      )}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Searchable Topic Filter Dropdown */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Concept / Topic Filter
                </label>
                {selectedTagId && (
                  <button
                    type="button"
                    onClick={() => setSelectedTagId(null)}
                    className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Clear</span>
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition outline-none ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white hover:border-neutral-700"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedTagObj ? (
                      <>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: selectedTagObj.color }}
                        />
                        <span className="text-neutral-400 font-normal">
                          {selectedTagObj.parentGroup ? `${selectedTagObj.parentGroup} › ` : ""}
                        </span>
                        <span>{selectedTagObj.name}</span>
                      </>
                    ) : (
                      <span className="text-neutral-400">All Topics & Categories (No Filter)</span>
                    )}
                  </div>
                  <FiChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${
                      isTopicDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTopicDropdownOpen && (
                  <div
                    className={`absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl border shadow-xl p-2 max-h-60 flex flex-col transition-all ${
                      darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                    }`}
                  >
                    <div className="relative mb-2 px-1">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3 h-3" />
                      <input
                        type="text"
                        value={topicDropdownSearch}
                        onChange={(e) => setTopicDropdownSearch(e.target.value)}
                        placeholder="Search topic..."
                        className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none font-medium ${
                          darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        }`}
                      />
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTagId(null);
                          setIsTopicDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
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

                      {Object.entries(filteredDropdownGroups).map(([group, groupTags]) => (
                        <div key={group} className="space-y-0.5 pt-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-2 mb-0.5">
                            {group}
                          </span>
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
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : darkMode
                                    ? "hover:bg-neutral-800 text-neutral-300"
                                    : "hover:bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span>{tag.name}</span>
                                </span>
                                {isSelected && <FiCheck className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Favorite toggle + Save Preset Button */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
                />
                <span>⭐ Bookmarked Problems Only</span>
              </label>

              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs flex items-center gap-1.5"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Save Preset</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOPICS DIRECTORY, QUICK CREATE & SYSTEM STATUS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Add New Tag */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FiPlus className="text-indigo-500" /> Create Custom Topic Tag
            </h3>

            <form onSubmit={handleCreateTagSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Parent Category</label>
                  <select
                    value={newTagGroup}
                    onChange={(e) => setNewTagGroup(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
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
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Tag Name</label>
                  <input
                    type="text"
                    required
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g. Monotonic Stack"
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  title="Tag color"
                />

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>
            </form>
          </div>

          {/* Manage Tags Directory */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FiFolder className="text-indigo-500" />
                <span>Configured Topics ({tags?.length || 0})</span>
              </h3>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3 h-3" />
              <input
                type="text"
                value={tagDirectorySearch}
                onChange={(e) => setTagDirectorySearch(e.target.value)}
                placeholder="Filter tag directory..."
                className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none font-medium ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                }`}
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {Object.entries(groupedTags).map(([group, groupTags]) => {
                const filtered = groupTags.filter((t) =>
                  t.name.toLowerCase().includes(tagDirectorySearch.toLowerCase().trim())
                );
                if (filtered.length === 0) return null;

                return (
                  <div key={group} className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {group}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {filtered.map((tag) => (
                        <span
                          key={tag._id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            borderColor: `${tag.color}35`,
                            color: tag.color,
                          }}
                        >
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => onDeleteTag(tag._id)}
                            className="opacity-50 hover:opacity-100 hover:text-rose-500 transition"
                            title="Delete"
                          >
                            <FiTrash2 className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System & API connection status */}
          <div
            className={`p-3.5 rounded-xl border font-mono text-[11px] space-y-1.5 ${
              darkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-sans">API Endpoint:</span>
              <span className="text-indigo-500 font-semibold">{import.meta.env.API_BASE_URL || "http://localhost:5001"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-sans">Database:</span>
              <span className="text-emerald-500 font-semibold">dsa_sheet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
