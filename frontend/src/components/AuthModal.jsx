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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[380px] rounded-2xl border p-6 shadow-xl transition-all ${
          darkMode
            ? "bg-neutral-900 border-neutral-800 text-white"
            : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="Close"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-2.5 shadow-xs">
            <FiCode className="w-5 h-5" />
          </div>

          <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            {isRegister ? "Create Account" : "Sign In"}
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <FiXCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick fill shortcut badge */}
        {!isRegister && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleQuickFillDefault}
              className="text-[11px] font-medium px-3 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/20 transition inline-flex items-center gap-1.5"
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Fill Default Account</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs border outline-none transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
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
              <span>Remember email</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
          >
            <span>{loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-indigo-500 font-semibold hover:underline ml-1"
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
