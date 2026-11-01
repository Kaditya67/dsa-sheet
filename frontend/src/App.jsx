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

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("dsa_theme") === "dark";
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
    <div className={`min-h-screen transition-colors duration-200 text-[13px] ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      {/* Top Navbar with Multi Tabs */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${darkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-neutral-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <FiCode className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight hidden sm:inline">dsa_sheet</span>
          </div>

          {/* Navigation Tabs */}
          {user && (
            <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("problems")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "problems"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiList className="w-3.5 h-3.5" />
                <span>Problems</span>
                {stats && <span className="opacity-80 text-[11px]">({stats.total})</span>}
              </button>

              <button
                onClick={() => setActiveTab("mustRevise")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "mustRevise"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiBookmark className="w-3.5 h-3.5" />
                <span>Must Revise</span>
                {stats && stats.mustRevise > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
                    {stats.mustRevise}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("topics")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "topics"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiLayers className="w-3.5 h-3.5" />
                <span>Topic View</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FiSliders className="w-3.5 h-3.5" />
                <span>Settings</span>
                {(filterPreset.tagId || filterPreset.status !== "All" || filterPreset.difficulty !== "All" || filterPreset.favorite) && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400" title="Active Filter Preset" />
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                    darkMode
                      ? "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-indigo-500 hover:text-indigo-400"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-indigo-500 hover:text-indigo-600 shadow-xs"
                  }`}
                  title="Bulk Edit / Import JSON"
                >
                  <FiFileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">JSON Batch</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Problem
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className={`p-1.5 rounded-lg border text-rose-500 hover:bg-rose-500/10 transition ${
                    darkMode ? "border-neutral-800" : "border-neutral-200"
                  }`}
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className={`p-1.5 rounded-lg border transition ${
                darkMode ? "border-neutral-800 text-amber-400" : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {darkMode ? <FiSun className="w-3.5 h-3.5" /> : <FiMoon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Not Logged In Clean Welcome Card */}
        {!user ? (
          <div className="py-12 sm:py-20 flex justify-center">
            <div
              className={`relative max-w-lg w-full p-8 sm:p-10 rounded-3xl border shadow-2xl text-center overflow-hidden transition-all ${
                darkMode
                  ? "bg-neutral-900/90 border-neutral-800 shadow-indigo-500/5 text-white"
                  : "bg-white border-neutral-200/80 shadow-xl text-neutral-900"
              }`}
            >
              {/* Background Glow */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-500/30">
                <FiCode className="w-7 h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                DSA Problem Vault
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
                Track your data structures and algorithms mastery with multi-approach solutions, custom complexity metrics, and revision cycles.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Sign In / Quick Access</span>
                </button>
              </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Concept & Topic Groupings</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Problems organized by data structures and algorithmic patterns.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(topicGroupedProblems).map(([topicTitle, groupProblems]) => (
                <div
                  key={topicTitle}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    darkMode ? "bg-neutral-900/60 border-neutral-800" : "bg-white border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiLayers className="w-3.5 h-3.5" /> {topicTitle}
                    </h3>
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {groupProblems.length} problem{groupProblems.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
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
          <div className="space-y-4">
            {/* Header Toolbar: Active Filter Badge + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Active Filter Indicator */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  {activeTab === "mustRevise" ? "Must Revise Problems" : "Problem Directory"}
                </span>

                {/* Show active filter chip if preset is set */}
                {activeTab === "problems" && (filterPreset.tagId || filterPreset.status !== "All" || filterPreset.difficulty !== "All" || filterPreset.favorite) && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[11px] font-semibold inline-flex items-center gap-1">
                    <FiFilter className="w-3 h-3" /> Filter preset active
                  </span>
                )}
              </div>

              {/* Fast Search Input */}
              <div className="flex items-center gap-2 w-full sm:w-80">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, notes, or tags..."
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
                    darkMode ? "border-neutral-800 text-neutral-300" : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Problem List (Full Width, Zoomed Out & Compact) */}
            {displayedProblems.length > 0 ? (
              <div className="space-y-2">
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
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <FiCode className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">No problems found</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : activeTab === "mustRevise"
                    ? "No problems marked as Must Revise yet."
                    : "No problems match your current Settings filter preset."}
                </p>
                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
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
        initialData={editingProblem}
        tags={tags}
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
