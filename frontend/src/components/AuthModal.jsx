import { useState, useEffect } from "react";
import {
  FiLock,
  FiMail,
  FiUser,
  FiArrowRight,
  FiCode,
  FiXCircle,
  FiEye,
  FiEyeOff,
  FiShield,
  FiX
} from "react-icons/fi";
import { loginUser, registerUser } from "../api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess, darkMode }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  // Clean defaults: leave blank for clean manual entry
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore remembered credentials or session on modal open if available
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem("dsa_remember_email") || "";
      setEmail(savedEmail);
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        if (!name.trim()) throw new Error("Please enter your full name");
        data = await registerUser(name, email, password);
      } else {
        data = await loginUser(email, password);
      }

      // Store active session token and user profile
      localStorage.setItem("dsa_token", data.token);
      localStorage.setItem("dsa_user", JSON.stringify(data));

      if (rememberMe) {
        localStorage.setItem("dsa_remember_email", email);
      } else {
        localStorage.removeItem("dsa_remember_email");
      }

      // Immediate state update in App component
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill option for default account
  const handleQuickFillDefault = () => {
    setEmail("ojhaaditya913@gmail.com");
    setPassword("Kaditya@67");
    setIsRegister(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
          darkMode
            ? "bg-neutral-900/95 border-neutral-800 text-white shadow-indigo-500/10"
            : "bg-white border-neutral-200 text-neutral-900 shadow-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          title="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <FiCode className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-extrabold text-center tracking-tight mb-1">
          {isRegister ? "Create DSA Account" : "Sign In to DSA Sheet"}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-5">
          {isRegister
            ? "Track your personal problem solutions and multi-language approaches"
            : "Access your problem vault, solution code snippets, and revision logs"}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-shake">
            <FiXCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick fill shortcut badge */}
        {!isRegister && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleQuickFillDefault}
              className="text-[11px] font-semibold px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition inline-flex items-center gap-1.5"
            >
              <FiShield className="w-3 h-3 text-indigo-500" />
              <span>Use Default Admin Account</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Ojha"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500"
              />
              <span>Remember email on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Signing in..." : isRegister ? "Create Account" : "Sign In to Vault"}</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-indigo-500 font-semibold hover:underline ml-1"
          >
            {isRegister ? "Sign In" : "Register now"}
          </button>
        </div>
      </div>
    </div>
  );
}
