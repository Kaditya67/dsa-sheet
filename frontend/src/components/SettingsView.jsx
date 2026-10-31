import { useState } from "react";
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
  FiBookmark
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

export default function SettingsView({
  tags,
  activeFilterPreset,
  onApplyPreset,
  onSaveNewTag,
  onDeleteTag,
  darkMode,
}) {
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

  // Group tags by category
  const groupedTags = tags.reduce((acc, tag) => {
    const group = tag.parentGroup || "Custom Lists";
    if (!acc[group]) acc[group] = [];
    acc[group].push(tag);
    return acc;
  }, {});

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

  const handleResetFilters = () => {
    setSelectedTagId(null);
    setSelectedStatus("All");
    setSelectedDifficulty("All");
    setFavoritesOnly(false);
    onApplyPreset({
      tagId: null,
      status: "All",
      difficulty: "All",
      favorite: false,
    });
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <FiSliders className="text-indigo-500" /> Settings & Category Configuration
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Configure default grouping filters and manage parent topic categories. Problems tab displays your configured view cleanly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Default View & Filter Configuration */}
        <section
          className={`p-6 rounded-2xl border space-y-5 ${
            darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiFilter className="text-indigo-500" /> Default Problem Filter Setting
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 font-medium"
            >
              <FiRotateCcw className="w-3 h-3" /> Reset View
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Set your current working focus (e.g. only Stack problems, or only Must Revise). This preference remains active until you change it here.
          </p>

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

          {/* Focus Topic / Tag */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Topic / Pattern Filter</label>
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
              <option value="">All Topics & Categories</option>
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

          {/* Bookmark checkbox */}
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

          {/* Apply button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {savedFeedback && (
                <span className="text-emerald-500 inline-flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5" /> Saved & Applied!
                </span>
              )}
            </span>
            <button
              onClick={handleApplyPreset}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm flex items-center gap-2"
            >
              <FiCheck className="w-3.5 h-3.5" /> Save View Settings
            </button>
          </div>
        </section>

        {/* Card 2: Create New Topic / Category */}
        <section
          className={`p-6 rounded-2xl border space-y-5 ${
            darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
          }`}
        >
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FiPlus className="text-indigo-500" /> Create Topic or Category
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Add data structures, algorithms, company tags, or custom list groups.
          </p>

          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                Topic / Tag Name *
              </label>
              <input
                type="text"
                required
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g. Monotonic Stack, Trie, Striver Sheet"
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                Parent Category
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
              <FiPlus className="w-3.5 h-3.5" /> Add Tag to Collection
            </button>
          </form>
        </section>
      </div>

      {/* Section 3: All Managed Categories List */}
      <section
        className={`p-6 rounded-2xl border space-y-4 ${
          darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FiLayers className="text-indigo-500" /> Managed Categories & Tags ({tags.length})
          </h3>
          <span className="text-xs text-neutral-400">Click red trash to remove tag</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedTags).map(([group, groupTags]) => (
            <div
              key={group}
              className={`p-3.5 rounded-xl border ${
                darkMode ? "bg-neutral-950/60 border-neutral-800" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FiFolder className="text-indigo-500" /> {group}
              </h4>
              <div className="space-y-1">
                {groupTags.map((tag) => (
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
                      title="Delete Tag"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
