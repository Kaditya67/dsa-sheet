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
  FiChevronDown,
  FiSearch,
  FiX,
  FiCode
} from "react-icons/fi";

const STATUS_ITEMS = [
  { value: "All", label: "All Statuses" },
  { value: "Todo", label: "Todo" },
  { value: "Attempted", label: "Attempted" },
  { value: "Understood", label: "Understood" },
  { value: "Solved", label: "Solved" },
  { value: "Must Revise", label: "Must Revise" },
  { value: "Mastered", label: "Mastered" },
];

const DIFFICULTY_ITEMS = [
  { value: "All", label: "All Difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
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

  // Topic search dropdown state
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [topicDropdownSearch, setTopicDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // New tag / category state
  const [newTagName, setNewTagName] = useState("");
  const [selectedParentGroup, setSelectedParentGroup] = useState("Data Structures");
  const [isCustomParent, setIsCustomParent] = useState(false);
  const [customParentName, setCustomParentName] = useState("");

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

  // Compute all unique parent categories from existing tags + defaults
  const availableParentCategories = useMemo(() => {
    const defaultCategories = ["Data Structures", "Algorithms", "Companies", "Custom Lists", "None"];
    const set = new Set(defaultCategories);
    (tags || []).forEach((t) => {
      if (t.parentGroup && t.parentGroup.trim()) {
        set.add(t.parentGroup.trim());
      }
    });
    return Array.from(set);
  }, [tags]);

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

    let finalParent = selectedParentGroup;
    if (isCustomParent) {
      if (!customParentName.trim()) {
        alert("Please enter the name of the new parent category.");
        return;
      }
      finalParent = customParentName.trim();
    } else if (finalParent === "None") {
      finalParent = null;
    }

    await onSaveNewTag({
      name: newTagName.trim(),
      parentGroup: finalParent,
      color: "#6366f1",
    });

    setNewTagName("");
    if (isCustomParent) {
      setIsCustomParent(false);
      setCustomParentName("");
    }
  };

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
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
            <FiSliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
            Settings
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 animate-fadeIn">
              <FiCheck className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {onOpenJsonEditor && (
            <button
              onClick={onOpenJsonEditor}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                darkMode
                  ? "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700"
                  : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 shadow-xs"
              }`}
            >
              <FiCode className="w-3.5 h-3.5 text-neutral-400" />
              <span>Bulk JSON Editor</span>
            </button>
          )}

          <button
            onClick={handleExportBackup}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition shadow-xs flex items-center gap-1.5"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN SPLIT SCREEN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: MINIMALIST FILTER PRESET RULES (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                <FiFilter className="w-3.5 h-3.5 text-neutral-400" /> Directory Filter Preset
              </h3>

              <button
                onClick={handleResetFilters}
                className="text-[11px] px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium inline-flex items-center gap-1 transition"
              >
                <FiRotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ITEMS.map((item) => {
                  const isSelected = selectedStatus === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedStatus(item.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTY_ITEMS.map((d) => {
                  const isSelected = selectedDifficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent"
                          : darkMode
                          ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Filter Dropdown */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Topic Tag Filter
                </label>
                {selectedTagId && (
                  <button
                    type="button"
                    onClick={() => setSelectedTagId(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>Clear Filter</span>
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium transition outline-none ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white hover:border-neutral-700"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <span className="truncate">
                    {selectedTagObj
                      ? `${selectedTagObj.parentGroup ? `${selectedTagObj.parentGroup} › ` : ""}${selectedTagObj.name}`
                      : "All Topics (No Filter)"}
                  </span>
                  <FiChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      isTopicDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTopicDropdownOpen && (
                  <div
                    className={`absolute left-0 right-0 top-full mt-1 z-40 rounded-xl border shadow-xl p-2 max-h-56 flex flex-col transition-all ${
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
                        className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none ${
                          darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        }`}
                      />
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTagId(null);
                          setIsTopicDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition text-left ${
                          !selectedTagId
                            ? "bg-neutral-100 dark:bg-neutral-800 font-semibold"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <span>All Topics (Default)</span>
                        {!selectedTagId && <FiCheck className="w-3.5 h-3.5" />}
                      </button>

                      {Object.entries(filteredDropdownGroups).map(([group, groupTags]) => (
                        <div key={group} className="space-y-0.5 pt-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block px-2">
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
                                className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition text-left ${
                                  isSelected
                                    ? "bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                }`}
                              >
                                <span>{tag.name}</span>
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

            {/* Bookmarks toggle + Save Button */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-neutral-900 dark:text-white border-neutral-300 focus:ring-neutral-500"
                />
                <span>Bookmarks Only</span>
              </label>

              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition shadow-xs flex items-center gap-1.5"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Save Preset</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CREATE PARENT CATEGORY / TAG & MANAGE TOPICS (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Create Topic or New Parent Category */}
          <div
            className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FiPlus className="w-3.5 h-3.5 text-neutral-400" />
                <span>Create Topic / Parent Category</span>
              </h3>
            </div>

            <form onSubmit={handleCreateTagSubmit} className="space-y-3">
              {/* Category selector + Custom Category option */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-neutral-500">Parent Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomParent(!isCustomParent)}
                    className="text-[11px] text-indigo-500 hover:underline font-medium"
                  >
                    {isCustomParent ? "Choose Existing" : "+ New Parent Category"}
                  </button>
                </div>

                {isCustomParent ? (
                  <input
                    type="text"
                    required
                    value={customParentName}
                    onChange={(e) => setCustomParentName(e.target.value)}
                    placeholder="Enter new parent category name (e.g. System Design, Math, DP)"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    }`}
                  />
                ) : (
                  <select
                    value={selectedParentGroup}
                    onChange={(e) => setSelectedParentGroup(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    }`}
                  >
                    {availableParentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tag Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-500">Tag Name *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g. Monotonic Queue, Dijkstra, Slotted LRU"
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    }`}
                  />

                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Configured Topics Directory */}
          <div
            className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FiFolder className="w-3.5 h-3.5 text-neutral-400" />
                <span>Configured Topics ({tags?.length || 0})</span>
              </h3>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3 h-3" />
              <input
                type="text"
                value={tagDirectorySearch}
                onChange={(e) => setTagDirectorySearch(e.target.value)}
                placeholder="Search topic tags..."
                className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none font-medium ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                }`}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {Object.entries(groupedTags).map(([group, groupTags]) => {
                const filtered = groupTags.filter((t) =>
                  t.name.toLowerCase().includes(tagDirectorySearch.toLowerCase().trim())
                );
                if (filtered.length === 0) return null;

                return (
                  <div key={group} className="space-y-1">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      {group}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {filtered.map((tag) => (
                        <span
                          key={tag._id}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${
                            darkMode ? "bg-neutral-950 border-neutral-800 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"
                          }`}
                        >
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => onDeleteTag(tag._id)}
                            className="text-neutral-400 hover:text-rose-500 transition"
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
        </div>
      </div>
    </div>
  );
}
