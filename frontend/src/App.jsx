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
  getProfile
} from "./api";
import ProblemCard from "./components/ProblemCard";
import ProblemModal from "./components/ProblemModal";
import SidebarFilter from "./components/SidebarFilter";
import AuthModal from "./components/AuthModal";
import NewTagModal from "./components/NewTagModal";
import {
  FiCode,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiBookmark,
  FiCheck,
  FiClock,
  FiZap
} from "react-icons/fi";

export default function App() {
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

  // Filter states
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);

  // Theme
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

  // Fetch data
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setProblems([]);
      setTags([]);
      setStats(null);
    }
  }, [user, selectedTagId, selectedStatus, selectedDifficulty, showFavoritesOnly]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTagId) params.tagId = selectedTagId;
      if (selectedStatus !== "All") params.status = selectedStatus;
      if (selectedDifficulty !== "All") params.difficulty = selectedDifficulty;
      if (showFavoritesOnly) params.favorite = "true";

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
      setIsNewTagModalOpen(false);
      const tagList = await getTags();
      setTags(tagList);
    } catch (error) {
      alert(error.message || "Failed to create tag");
    }
  };

  // Client-side search filtering
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${darkMode ? "bg-neutral-900/80 border-neutral-800" : "bg-white/80 border-neutral-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FiCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">dsa_sheet</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Multi-Approach Problem Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm flex items-center gap-1.5"
                >
                  <FiPlus className="w-4 h-4" /> Add Problem
                </button>

                <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                  <span className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium ${darkMode ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-neutral-100"}`}>
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className={`p-2 rounded-lg border text-rose-500 hover:bg-rose-500/10 transition ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className={`p-2 rounded-xl border transition ${darkMode ? "border-neutral-800 hover:bg-neutral-800 text-amber-400" : "border-neutral-200 hover:bg-neutral-100 text-neutral-700"}`}
            >
              {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Dashboard */}
        {user && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Total Problems</span>
              <span className="text-2xl font-black text-indigo-500">{stats.total}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Solved / Mastered</span>
              <span className="text-2xl font-black text-emerald-500">{stats.solved}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Must Revise</span>
              <span className="text-2xl font-black text-rose-500">{stats.mustRevise}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Understood</span>
              <span className="text-2xl font-black text-blue-500">{stats.understood}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Bookmarks</span>
              <span className="text-2xl font-black text-amber-500">{stats.favorites}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Difficulty Split</span>
              <div className="flex items-center gap-1.5 text-xs font-bold pt-1">
                <span className="text-emerald-500">{stats.byDifficulty.easy}E</span>
                <span className="text-neutral-400">/</span>
                <span className="text-amber-500">{stats.byDifficulty.medium}M</span>
                <span className="text-neutral-400">/</span>
                <span className="text-rose-500">{stats.byDifficulty.hard}H</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Area: Sidebar + Problems Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          {user && (
            <SidebarFilter
              tags={tags}
              selectedTagId={selectedTagId}
              onSelectTag={setSelectedTagId}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
              onOpenNewTagModal={() => setIsNewTagModalOpen(true)}
              darkMode={darkMode}
            />
          )}

          {/* Right Problems Feed */}
          <div className="flex-1 w-full space-y-4">
            {/* Search Bar & Quick Controls */}
            {user && (
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems by name, notes, or tags..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                      darkMode
                        ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                        : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 shadow-sm"
                    }`}
                  />
                </div>

                <button
                  onClick={loadData}
                  disabled={loading}
                  title="Refresh Problems"
                  className={`p-2.5 rounded-xl border transition ${darkMode ? "border-neutral-800 hover:bg-neutral-800 text-neutral-300" : "border-neutral-200 hover:bg-neutral-100 text-neutral-700"}`}
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
                </button>
              </div>
            )}

            {/* Problem Cards List */}
            {!user ? (
              <div className={`text-center py-20 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                  <FiCode className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base mb-1">DSA Sheet Tracker</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
                  Log in to track your personal problem solutions, multiple approaches, time/space complexities, and revision cycles.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
                >
                  Sign In with Default Account
                </button>
              </div>
            ) : displayedProblems.length > 0 ? (
              <div className="space-y-4">
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
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <FiCode className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">No problems found</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  {searchQuery || selectedTagId || selectedStatus !== "All"
                    ? "Try adjusting your filters or search keywords."
                    : "Add your first DSA problem to get started."}
                </p>
                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setIsProblemModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Add Problem
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => loadData()}
        darkMode={darkMode}
      />

      <NewTagModal
        isOpen={isNewTagModalOpen}
        onClose={() => setIsNewTagModalOpen(false)}
        onSave={handleSaveTag}
        darkMode={darkMode}
      />
    </div>
  );
}
