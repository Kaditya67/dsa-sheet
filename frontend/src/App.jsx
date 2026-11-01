import { useState, useEffect, useMemo } from "react";
import {
  getProblems,
  getProblemStats,
  getTags,
  createProblem,
  updateProblem,
  deleteProblem,
  patchProblemStatus,
  toggleFavorite,
  createTag,
  deleteTag,
  getProfile
} from "./api";
import ProblemCard from "./components/ProblemCard";
import ProblemModal from "./components/ProblemModal";
import SolutionModal from "./components/SolutionModal";
import SettingsView from "./components/SettingsView";
import AuthModal from "./components/AuthModal";
import JsonEditorModal from "./components/JsonEditorModal";
import {
  FiCode,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiList,
  FiSliders,
  FiCheckCircle,
  FiFilter,
  FiBookmark,
  FiBarChart2,
  FiLayers,
  FiFileText
} from "react-icons/fi";

export default function App() {
  const [activeTab, setActiveTab] = useState("problems"); // 'problems' | 'mustRevise' | 'topics' | 'settings'
  const [problems, setProblems] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dsa_user")) || null;
    } catch {
      return null;
    }
  });

  // Persistent Filter settings saved in Settings
  const [filterPreset, setFilterPreset] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dsa_filter_preset")) || {
        tagId: null,
        status: "All",
        difficulty: "All",
        favorite: false,
      };
    } catch {
      return { tagId: null, status: "All", difficulty: "All", favorite: false };
    }
  });

  // Client search query
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dedicated Solution Modal State
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [activeSolutionProblem, setActiveSolutionProblem] = useState(null);
  const [editingSolutionIndex, setEditingSolutionIndex] = useState(null);

  // Dark mode (default to true for high quality dark theme)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("dsa_theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dsa_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dsa_theme", "light");
    }
  }, [darkMode]);

  // Auth verify
  useEffect(() => {
    const token = localStorage.getItem("dsa_token");
    if (token) {
      getProfile()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("dsa_user", JSON.stringify(userData));
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, []);

  // Fetch problems based on activeTab & filterPreset
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setProblems([]);
      setTags([]);
      setStats(null);
    }
  }, [user, activeTab, filterPreset]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};

      if (activeTab === "mustRevise") {
        params.status = "Must Revise";
      } else if (activeTab === "problems") {
        if (filterPreset.tagId) params.tagId = filterPreset.tagId;
        if (filterPreset.status !== "All") params.status = filterPreset.status;
        if (filterPreset.difficulty !== "All") params.difficulty = filterPreset.difficulty;
        if (filterPreset.favorite) params.favorite = "true";
      }

      const [problemList, tagList, statData] = await Promise.all([
        getProblems(params),
        getTags(),
        getProblemStats(),
      ]);

      setProblems(problemList);
      setTags(tagList);
      setStats(statData);
    } catch (error) {
      console.error("Load Data Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dsa_token");
    localStorage.removeItem("dsa_user");
    setUser(null);
  };

  // Save Filter Preset from Settings
  const handleApplyPreset = (newPreset) => {
    setFilterPreset(newPreset);
    localStorage.setItem("dsa_filter_preset", JSON.stringify(newPreset));
    loadData();
  };

  // Problem actions
  const handleSaveProblem = async (problemData) => {
    try {
      if (editingProblem) {
        await updateProblem(editingProblem._id, problemData);
      } else {
        await createProblem(problemData);
      }
      setIsProblemModalOpen(false);
      setEditingProblem(null);
      loadData();
    } catch (error) {
      alert(error.message || "Failed to save problem");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await patchProblemStatus(id, status);
      loadData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      loadData();
    } catch (error) {
      alert("Failed to toggle bookmark");
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await deleteProblem(id);
      loadData();
    } catch (error) {
      alert("Failed to delete problem");
    }
  };

  // Add / Edit / Delete Solution Approach directly on Problem
  const handleOpenAddSolution = (problem) => {
    setActiveSolutionProblem(problem);
    setEditingSolutionIndex(null);
    setIsSolutionModalOpen(true);
  };

  const handleOpenEditSolution = (problem, index) => {
    setActiveSolutionProblem(problem);
    setEditingSolutionIndex(index);
    setIsSolutionModalOpen(true);
  };

  const handleSaveSolution = async (solutionData) => {
    if (!activeSolutionProblem) return;
    try {
      const existingSolutions = activeSolutionProblem.solutions ? [...activeSolutionProblem.solutions] : [];
      if (editingSolutionIndex !== null && editingSolutionIndex !== undefined) {
        existingSolutions[editingSolutionIndex] = solutionData;
      } else {
        existingSolutions.push(solutionData);
      }

      await updateProblem(activeSolutionProblem._id, {
        solutions: existingSolutions,
      });

      setIsSolutionModalOpen(false);
      setActiveSolutionProblem(null);
      setEditingSolutionIndex(null);
      loadData();
    } catch (error) {
      alert(error.message || "Failed to save solution approach");
    }
  };

  const handleDeleteSolution = async (problem, index) => {
    if (!window.confirm("Delete this solution approach?")) return;
    try {
      const updatedSolutions = problem.solutions.filter((_, i) => i !== index);
      await updateProblem(problem._id, {
        solutions: updatedSolutions,
      });
      loadData();
    } catch (error) {
      alert("Failed to delete solution approach");
    }
  };

  const handleSaveTag = async (tagData) => {
    try {
      await createTag(tagData.name, tagData.parentGroup, tagData.color);
      const tagList = await getTags();
      setTags(tagList);
    } catch (error) {
      alert(error.message || "Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await deleteTag(tagId);
      const tagList = await getTags();
      setTags(tagList);
    } catch (error) {
      alert("Failed to delete tag");
    }
  };

  // Search filter
  const displayedProblems = useMemo(() => {
    if (!searchQuery.trim()) return problems;
    const q = searchQuery.toLowerCase();
    return problems.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchNotes = (p.personalNotes || "").toLowerCase().includes(q);
      const matchTags = (p.tags || []).some((t) => t.name.toLowerCase().includes(q));
      return matchTitle || matchNotes || matchTags;
    });
  }, [problems, searchQuery]);

  // Group problems for "Topics View" tab
  const topicGroupedProblems = useMemo(() => {
    const map = {};
    problems.forEach((p) => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach((t) => {
          const groupKey = t.parentGroup ? `${t.parentGroup} › ${t.name}` : t.name;
          if (!map[groupKey]) map[groupKey] = [];
          map[groupKey].push(p);
        });
      } else {
        if (!map["Uncategorized"]) map["Uncategorized"] = [];
        map["Uncategorized"].push(p);
      }
    });
    return map;
  }, [problems]);

  return (
    <div className={`min-h-screen transition-colors duration-150 text-[13px] ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${darkMode ? "bg-neutral-950/90 border-neutral-800" : "bg-white/90 border-neutral-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FiCode className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">DSA Sheet</span>
          </div>

          {/* Navigation Tabs */}
          {user && (
            <nav className={`flex items-center gap-1 p-1 rounded-xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100 border-neutral-200"}`}>
              <button
                onClick={() => setActiveTab("problems")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === "problems"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiList className="w-3.5 h-3.5" />
                <span>Problems</span>
                {stats && <span className="opacity-75 text-[11px]">({stats.total})</span>}
              </button>

              <button
                onClick={() => setActiveTab("mustRevise")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === "mustRevise"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiBookmark className="w-3.5 h-3.5" />
                <span>Must Revise</span>
                {stats && stats.mustRevise > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                    {stats.mustRevise}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("topics")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === "topics"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiLayers className="w-3.5 h-3.5" />
                <span>Topics</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiSliders className="w-3.5 h-3.5" />
                <span>Settings</span>
                {(filterPreset.tagId || filterPreset.status !== "All" || filterPreset.difficulty !== "All" || filterPreset.favorite) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setIsJsonModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                    darkMode
                      ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 shadow-xs"
                  }`}
                  title="Batch JSON"
                >
                  <FiFileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">JSON</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Problem</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className={`p-1.5 rounded-lg border text-neutral-400 hover:text-rose-500 transition ${
                    darkMode ? "border-neutral-800 hover:bg-neutral-900" : "border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className={`p-1.5 rounded-lg border transition ${
                darkMode
                  ? "border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {darkMode ? <FiSun className="w-3.5 h-3.5 text-amber-400" /> : <FiMoon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Not Logged In Clean Welcome Card */}
        {!user ? (
          <div className="py-16 sm:py-24 flex justify-center">
            <div
              className={`max-w-md w-full p-8 rounded-2xl border text-center transition-all ${
                darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900 shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3.5 text-white shadow-xs">
                <FiCode className="w-5 h-5" />
              </div>

              <h2 className="text-lg font-bold tracking-tight mb-1">
                DSA Sheet Tracker
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-5 leading-normal">
                Track your data structures and algorithms mastery with multi-approach solutions and revision cycles.
              </p>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs flex items-center justify-center gap-2"
              >
                <FiUser className="w-3.5 h-3.5" />
                <span>Sign In / Quick Access</span>
              </button>
            </div>
          </div>
        ) : activeTab === "settings" ? (
          /* TAB 4: SETTINGS VIEW */
          <SettingsView
            tags={tags}
            activeFilterPreset={filterPreset}
            onApplyPreset={handleApplyPreset}
            onSaveNewTag={handleSaveTag}
            onDeleteTag={handleDeleteTag}
            problems={problems}
            darkMode={darkMode}
            onOpenJsonEditor={() => setIsJsonModalOpen(true)}
          />
        ) : activeTab === "topics" ? (
          /* TAB 3: TOPIC GROUPED VIEW */
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">Topic Categories</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Problems grouped by algorithmic concept and data structure tags.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(topicGroupedProblems).map(([topicTitle, groupProblems]) => (
                <div
                  key={topicTitle}
                  className={`p-3.5 rounded-xl border space-y-2.5 ${
                    darkMode ? "bg-neutral-900/60 border-neutral-800" : "bg-white border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <h3 className="text-xs font-bold text-indigo-500 tracking-wider flex items-center gap-1.5">
                      <FiLayers className="w-3.5 h-3.5" /> {topicTitle}
                    </h3>
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {groupProblems.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {groupProblems.map((problem) => (
                      <ProblemCard
                        key={problem._id}
                        problem={problem}
                        onStatusChange={handleStatusChange}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={(p) => {
                          setEditingProblem(p);
                          setIsProblemModalOpen(true);
                        }}
                        onDelete={handleDeleteProblem}
                        onAddSolution={handleOpenAddSolution}
                        onEditSolution={handleOpenEditSolution}
                        onDeleteSolution={handleDeleteSolution}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TAB 1 & 2: PROBLEMS & MUST REVISE CLEAN FULL-WIDTH VIEW */
          <div className="space-y-3">
            {/* Header Toolbar: Active Filter Badge + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Active Filter Indicator */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  {activeTab === "mustRevise" ? "Must Revise" : "Problems"}
                </span>

                {/* Show active filter chip if preset is set */}
                {activeTab === "problems" && (filterPreset.tagId || filterPreset.status !== "All" || filterPreset.difficulty !== "All" || filterPreset.favorite) && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[11px] font-medium inline-flex items-center gap-1">
                    <FiFilter className="w-3 h-3" /> Filtered
                  </span>
                )}
              </div>

              {/* Fast Search Input */}
              <div className="flex items-center gap-2 w-full sm:w-72">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none font-medium transition ${
                      darkMode
                        ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                        : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 shadow-xs"
                    }`}
                  />
                </div>

                <button
                  onClick={loadData}
                  disabled={loading}
                  title="Refresh"
                  className={`p-2 rounded-xl border transition ${
                    darkMode ? "border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900" : "border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Problem List (Full Width, Zoomed Out & Compact) */}
            {displayedProblems.length > 0 ? (
              <div className="space-y-1.5">
                {displayedProblems.map((problem) => (
                  <ProblemCard
                    key={problem._id}
                    problem={problem}
                    onStatusChange={handleStatusChange}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={(p) => {
                      setEditingProblem(p);
                      setIsProblemModalOpen(true);
                    }}
                    onDelete={handleDeleteProblem}
                    onAddSolution={handleOpenAddSolution}
                    onEditSolution={handleOpenEditSolution}
                    onDeleteSolution={handleDeleteSolution}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-2 text-neutral-400">
                  <FiCode className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs mb-1">No problems found</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : activeTab === "mustRevise"
                    ? "No problems marked as Must Revise."
                    : "No problems match your current filter preset."}
                </p>
                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Add Problem
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Problem Add / Edit Modal */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => {
          setIsProblemModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveProblem}
        onSaveNewTag={handleSaveTag}
        initialData={editingProblem}
        tags={tags}
        darkMode={darkMode}
      />

      {/* Dedicated Solution Approach Modal */}
      <SolutionModal
        isOpen={isSolutionModalOpen}
        onClose={() => {
          setIsSolutionModalOpen(false);
          setActiveSolutionProblem(null);
          setEditingSolutionIndex(null);
        }}
        onSaveSolution={handleSaveSolution}
        problem={activeSolutionProblem}
        editingSolutionIndex={editingSolutionIndex}
        darkMode={darkMode}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          loadData();
        }}
        darkMode={darkMode}
      />

      {/* JSON Batch Editor Modal */}
      <JsonEditorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentProblems={problems}
        onSyncComplete={loadData}
        darkMode={darkMode}
      />
    </div>
  );
}
