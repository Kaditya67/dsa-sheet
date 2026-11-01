import { useState, useEffect } from "react";
import {
  FiCode,
  FiX,
  FiUpload,
  FiCheck,
  FiAlertTriangle,
  FiCopy,
  FiRotateCcw,
  FiFileText,
  FiHelpCircle
} from "react-icons/fi";
import { bulkSyncProblems } from "../api";

const SAMPLE_JSON = [
  {
    "title": "Two Sum",
    "difficulty": "Easy",
    "status": "Solved",
    "isFavorite": true,
    "links": [
      {
        "platform": "LeetCode",
        "url": "https://leetcode.com/problems/two-sum/",
        "label": "LC 1"
      }
    ],
    "solutions": [
      {
        "title": "Hash Map Single Pass",
        "language": "cpp",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "explanation": "Store elements in unordered_map while scanning for complement target - nums[i].",
        "code": "vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (seen.count(comp)) return {seen[comp], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}"
      }
    ],
    "personalNotes": "Edge cases: duplicate values, negative numbers."
  }
];

export default function JsonEditorModal({ isOpen, onClose, currentProblems, onSyncComplete, darkMode }) {
  const [jsonText, setJsonText] = useState("");
  const [mode, setMode] = useState("upsert"); // 'upsert' | 'replace'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Initialize editor with current problems on open
  useEffect(() => {
    if (isOpen) {
      if (currentProblems && currentProblems.length > 0) {
        // Strip __v and clean formatting for readable editing
        const cleanProblems = currentProblems.map(({ __v, createdAt, updatedAt, ...rest }) => rest);
        setJsonText(JSON.stringify(cleanProblems, null, 2));
      } else {
        setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
      }
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen, currentProblems]);

  if (!isOpen) return null;

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError(`Invalid JSON syntax: ${err.message}`);
    }
  };

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setError("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplySync = async () => {
    setError("");
    setSuccessMessage("");

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setError(`Invalid JSON syntax: ${err.message}`);
      return;
    }

    if (!Array.isArray(parsed)) {
      setError("Top-level JSON must be an array of problem objects: [ { title: '...' } ]");
      return;
    }

    if (mode === "replace") {
      const confirmed = window.confirm(
        "⚠️ WARNING: 'Replace Entire Vault' will delete all existing problems and replace them with this JSON. Are you sure?"
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const res = await bulkSyncProblems(parsed, mode);
      setSuccessMessage(res.message || "Bulk sync completed successfully!");
      onSyncComplete();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to sync JSON problems.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400">
              <FiCode className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Bulk JSON Problem Editor & Importer</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                View, batch-edit, or import multiple problems, solutions, and links directly via JSON.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
            >
              <FiCopy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>

            <button
              onClick={handleFormatJson}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Validate and reformat JSON indentation"
            >
              Format JSON
            </button>

            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Insert sample structure"
            >
              Insert Sample
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Mode Selector */}
        <div className={`px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          darkMode ? "bg-neutral-950/70 border-neutral-800" : "bg-neutral-50/80 border-neutral-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-500">Sync Mode:</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                name="syncMode"
                value="upsert"
                checked={mode === "upsert"}
                onChange={() => setMode("upsert")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Smart Merge / Upsert (Update existing + add new)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-rose-500">
              <input
                type="radio"
                name="syncMode"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span>Replace Entire Vault</span>
            </label>
          </div>

          <div className="text-[11px] text-neutral-400">
            Tip: Keep <code className="text-indigo-400 font-mono">_id</code> to update existing problems in-place.
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <FiCheck className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Code / JSON Textarea */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck="false"
            className={`w-full flex-1 p-4 rounded-2xl font-mono text-xs leading-relaxed outline-none border resize-none overflow-y-auto ${
              darkMode
                ? "bg-neutral-950 border-neutral-800 text-emerald-400 focus:border-indigo-500"
                : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
            }`}
            placeholder="// Paste or edit problem JSON array here..."
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-400">
            Array of problem objects with <code className="text-indigo-400 font-mono">title</code>, <code className="text-indigo-400 font-mono">solutions</code>, <code className="text-indigo-400 font-mono">links</code>, <code className="text-indigo-400 font-mono">difficulty</code>, <code className="text-indigo-400 font-mono">status</code>.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApplySync}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              <FiUpload className="w-3.5 h-3.5" />
              <span>{loading ? "Applying Sync..." : "Save & Sync Problems"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
