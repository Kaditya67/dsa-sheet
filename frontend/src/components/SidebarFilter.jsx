import { useState } from "react";
import {
  FiFolder,
  FiTag,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiBookmark
} from "react-icons/fi";

export default function SidebarFilter({
  tags,
  selectedTagId,
  onSelectTag,
  selectedStatus,
  onSelectStatus,
  selectedDifficulty,
  onSelectDifficulty,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenNewTagModal,
  darkMode,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleCollapse = (groupName) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Group tags by parentGroup
  const groupedTags = tags.reduce((acc, tag) => {
    const group = tag.parentGroup || "Custom Lists";
    if (!acc[group]) acc[group] = [];
    acc[group].push(tag);
    return acc;
  }, {});

  const STATUSES = ["All", "Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"];
  const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Quick Filters */}
      <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Quick Filters
        </h3>

        {/* Favorites pill */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold mb-3 border transition ${
            showFavoritesOnly
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
              : darkMode
              ? "border-neutral-800 text-neutral-400 hover:text-white"
              : "border-neutral-200 text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <FiBookmark className="w-3.5 h-3.5" /> Bookmarks / Favorites
          </span>
          {showFavoritesOnly && <FiX className="w-3.5 h-3.5" />}
        </button>

        {/* Status Dropdown/Pills */}
        <div className="space-y-1 mb-4">
          <span className="text-[11px] font-semibold text-neutral-500">Status</span>
          <div className="flex flex-wrap gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onSelectStatus(s)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
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

        {/* Difficulty */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-neutral-500">Difficulty</span>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`flex-1 text-[11px] py-1 rounded-lg border font-medium transition text-center ${
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
      </div>

      {/* Topics & Groupings */}
      <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Topics & Patterns
          </h3>
          <button
            onClick={onOpenNewTagModal}
            className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <FiPlus className="w-3.5 h-3.5" /> New Tag
          </button>
        </div>

        {/* Clear Topic filter if one is selected */}
        {selectedTagId && (
          <button
            onClick={() => onSelectTag(null)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold mb-3"
          >
            <span>Showing filtered topic</span>
            <span className="flex items-center gap-1">Clear <FiX className="w-3 h-3" /></span>
          </button>
        )}

        <div className="space-y-3">
          {Object.entries(groupedTags).map(([groupName, groupTags]) => {
            const isCollapsed = collapsedGroups[groupName];
            return (
              <div key={groupName} className="space-y-1">
                <button
                  onClick={() => toggleCollapse(groupName)}
                  className="w-full flex items-center justify-between py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-indigo-500 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <FiFolder className="w-3.5 h-3.5 text-indigo-500" /> {groupName}
                  </span>
                  {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                </button>

                {!isCollapsed && (
                  <div className="pl-3 space-y-0.5 border-l-2 border-neutral-200 dark:border-neutral-800 ml-1.5">
                    {groupTags.map((tag) => {
                      const isSelected = selectedTagId === tag._id;
                      return (
                        <button
                          key={tag._id}
                          onClick={() => onSelectTag(isSelected ? null : tag._id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-sm font-semibold"
                              : darkMode
                              ? "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color || "#6366f1" }}
                            />
                            {tag.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

