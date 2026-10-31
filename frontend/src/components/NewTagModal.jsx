import { useState } from "react";
import { FiX, FiTag } from "react-icons/fi";

const PARENT_GROUPS = ["Data Structures", "Algorithms", "Companies", "Custom Lists", "None"];

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

export default function NewTagModal({ isOpen, onClose, onSave, darkMode }) {
  const [name, setName] = useState("");
  const [parentGroup, setParentGroup] = useState("Data Structures");
  const [color, setColor] = useState("#6366f1");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter tag name");
    onSave({
      name: name.trim(),
      parentGroup: parentGroup === "None" ? null : parentGroup,
      color,
    });
    setName("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-sm font-bold flex items-center gap-2">
            <FiTag className="text-indigo-500" /> Create Topic / Tag
          </span>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Tag Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Segment Tree, Monotonic Queue, Striver 79"
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Parent Group
            </label>
            <select
              value={parentGroup}
              onChange={(e) => setParentGroup(e.target.value)}
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition transform ${
                    color === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md"
            >
              Save Tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

