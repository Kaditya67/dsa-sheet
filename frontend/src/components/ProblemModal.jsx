import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiExternalLink,
  FiTrash2,
  FiCode,
  FiTag,
  FiClock,
  FiCpu,
  FiChevronDown,
  FiSearch,
  FiCheck,
  FiBookOpen
} from "react-icons/fi";

const PLATFORMS = ["LeetCode", "GeeksforGeeks", "Codeforces", "CodeChef", "HackerRank", "YouTube", "Other"];
const STATUSES = ["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const PARENT_GROUPS = ["Data Structures", "Algorithms", "Companies", "Custom Lists", "None"];

export default function ProblemModal({ isOpen, onClose, onSave, onSaveNewTag, initialData, tags, darkMode }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
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

  // Dedicated Tag Dropdown states
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState("All"); // 'All' | ParentGroup
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagGroup, setNewTagGroup] = useState("Data Structures");

  const tagDropdownRef = useRef(null);

  // Close tag dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!isOpen) return null;

  // Group tags by parentGroup
  const parentGroupsList = useMemo(() => {
    const groups = new Set();
    tags.forEach((t) => {
      if (t.parentGroup) groups.add(t.parentGroup);
    });
    return Array.from(groups);
  }, [tags]);

  // Filtered tags for dropdown
  const filteredTags = useMemo(() => {
    return tags.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(tagSearch.toLowerCase().trim());
      const matchParent =
        selectedParentFilter === "All"
          ? true
          : selectedParentFilter === "None"
          ? !t.parentGroup
          : t.parentGroup === selectedParentFilter;
      return matchSearch && matchParent;
    });
  }, [tags, tagSearch, selectedParentFilter]);

  // Tag helpers
  const handleToggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateNewTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      if (onSaveNewTag) {
        await onSaveNewTag({
          name: newTagName.trim(),
          parentGroup: newTagGroup === "None" ? null : newTagGroup,
          color: "#6366f1",
        });
      }
      setNewTagName("");
      setIsCreatingTag(false);
    } catch (err) {
      alert("Failed to create tag: " + err.message);
    }
  };

  // Links helpers
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter problem title");

    const cleanedLinks = links.filter((l) => l.url && l.url.trim());

    onSave({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      status,
      isFavorite,
      tags: selectedTagIds,
      links: cleanedLinks,
      solutions: initialData?.solutions || [],
      personalNotes: initialData?.personalNotes || "",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <FiBookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {initialData ? "Edit Problem" : "Add New Problem"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Trapping Rain Water, Two Sum"
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full px-2.5 py-2 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-indigo-500"
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

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or prompt constraints..."
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium transition ${
                darkMode
                  ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500"
              }`}
            />
          </div>

          {/* Status & Priority */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs border outline-none font-medium ${
                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                }`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
              />
              <span>⭐ Bookmark</span>
            </label>
          </div>

          {/* Multiple Platform Links */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FiExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>Problem Links</span>
              </label>

              <button
                type="button"
                onClick={handleAddLink}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => handleLinkChange(idx, "platform", e.target.value)}
                    className={`w-28 sm:w-32 px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium shrink-0 ${
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
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
                      darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    }`}
                  />

                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 transition"
                      title="Remove Link"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Clean Compact Hierarchical Tag Selector Dropdown */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800" ref={tagDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Attached Tags ({selectedTagIds.length})</span>
              </label>

              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1"
              >
                <span>{isTagDropdownOpen ? "Close Dropdown" : "+ Assign / Create Tags"}</span>
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${isTagDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Currently selected tags pills */}
            {selectedTagIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
                {selectedTagIds.map((id) => {
                  const tag = tags.find((t) => t._id === id);
                  if (!tag) return null;
                  return (
                    <span
                      key={id}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5"
                      style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}35`, color: tag.color }}
                    >
                      <span>{tag.parentGroup ? `${tag.parentGroup} › ${tag.name}` : tag.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(id)}
                        className="opacity-60 hover:opacity-100 hover:text-rose-500"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 italic">No tags attached yet.</p>
            )}

            {/* Compact Searchable Hierarchical Dropdown Popover */}
            {isTagDropdownOpen && (
              <div
                className={`p-3 rounded-2xl border shadow-xl space-y-2.5 transition-all mt-1 ${
                  darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
                }`}
              >
                {/* Search Bar + Create Tag Toggle */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3 h-3" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none ${
                        darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingTag(!isCreatingTag)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition shrink-0"
                  >
                    {isCreatingTag ? "Cancel" : "+ New Tag"}
                  </button>
                </div>

                {/* Inline Quick Tag Creator */}
                {isCreatingTag && (
                  <div className={`p-2.5 rounded-xl border space-y-2 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-0.5">Parent Category</label>
                        <select
                          value={newTagGroup}
                          onChange={(e) => setNewTagGroup(e.target.value)}
                          className={`w-full px-2 py-1 rounded-md text-[11px] border outline-none ${
                            darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                          }`}
                        >
                          {PARENT_GROUPS.map((pg) => (
                            <option key={pg} value={pg}>
                              {pg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-0.5">Tag Name</label>
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="e.g. Backtracking"
                          className={`w-full px-2 py-1 rounded-md text-[11px] border outline-none ${
                            darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateNewTag}
                      className="w-full py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition"
                    >
                      Save & Add Tag
                    </button>
                  </div>
                )}

                {/* Parent Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedParentFilter("All")}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition ${
                      selectedParentFilter === "All"
                        ? "bg-indigo-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {parentGroupsList.map((pg) => (
                    <button
                      type="button"
                      key={pg}
                      onClick={() => setSelectedParentFilter(pg)}
                      className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition ${
                        selectedParentFilter === pg
                          ? "bg-indigo-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedParentFilter("None")}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition ${
                      selectedParentFilter === "None"
                        ? "bg-indigo-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Standalone
                  </button>
                </div>

                {/* Tag Selection Grid */}
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((t) => {
                      const isSelected = selectedTagIds.includes(t._id);
                      return (
                        <button
                          type="button"
                          key={t._id}
                          onClick={() => handleToggleTag(t._id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : darkMode
                              ? "hover:bg-neutral-900 text-neutral-300"
                              : "hover:bg-neutral-200/70 text-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: isSelected ? "#fff" : t.color }}
                            />
                            <span className="opacity-60 text-[10px]">
                              {t.parentGroup ? `${t.parentGroup} › ` : ""}
                            </span>
                            <span className="truncate">{t.name}</span>
                          </div>
                          {isSelected && <FiCheck className="w-3.5 h-3.5 shrink-0 ml-1" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-neutral-400 p-2 text-center">No tags match search filter.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs"
            >
              Save Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
