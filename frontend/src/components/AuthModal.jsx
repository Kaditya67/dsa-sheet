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
  FiX,
  FiCheckCircle
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[420px] rounded-3xl border p-7 sm:p-8 shadow-2xl transition-all overflow-hidden ${
          darkMode
            ? "bg-neutral-900/95 border-neutral-800 text-white shadow-indigo-500/10"
            : "bg-white/95 border-neutral-200/90 text-neutral-900 shadow-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="relative text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white mx-auto mb-3.5 shadow-lg shadow-indigo-500/30">
            <FiCode className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black tracking-tight mb-1 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
            {isRegister ? "Create DSA Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isRegister
              ? "Track your problem solutions, revision cycles & multi-language code"
              : "Access your personalized problem vault & revision tracker"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <FiXCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Quick fill shortcut badge */}
        {!isRegister && (
          <div className="mb-5 text-center">
            <button
              type="button"
              onClick={handleQuickFillDefault}
              className="group text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <FiShield className="w-3.5 h-3.5 text-indigo-500 transition-transform group-hover:scale-110" />
              <span>Autofill Default Account</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">Full Name</label>
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
                      ? "bg-neutral-950/80 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">Email Address</label>
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
                    ? "bg-neutral-950/80 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">Password</label>
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
                    ? "bg-neutral-950/80 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 border-neutral-300 focus:ring-indigo-500 dark:bg-neutral-900 dark:border-neutral-700"
              />
              <span>Remember email on this browser</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In to Vault"}</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-indigo-500 font-bold hover:underline ml-1"
          >
            {isRegister ? "Sign In" : "Register now"}
          </button>
        </div>
      </div>
    </div>
  );
}
