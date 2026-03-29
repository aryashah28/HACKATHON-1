import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      nav("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-700/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-600/20 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card-light shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-b from-slate-700/40 to-slate-800/30 px-8 py-8 text-center backdrop-blur-xl border-b border-white/10">
            <div className="mb-4 text-4xl">💰</div>
            <h1 className="text-3xl font-bold text-gray-50">ExpenseHub</h1>
            <p className="text-gray-300 text-sm mt-2">Manage expenses with ease</p>
          </div>

          {/* Form */}
          <form onSubmit={login} className="px-8 py-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/40 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white/40 text-white placeholder-gray-400 transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white/40 text-white placeholder-gray-400 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded cursor-pointer accent-slate-400"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full backdrop-blur-xl bg-slate-600/40 hover:bg-slate-600/60 disabled:bg-slate-600/20 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 border border-white/20 hover:border-white/40"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Links */}
            <div className="pt-4 border-t border-white/10 space-y-3 text-center text-sm">
              <p>
                <a href="#" className="text-slate-300 hover:text-white font-semibold transition">
                  Forgot password?
                </a>
              </p>
              <p className="text-gray-300">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => nav("/register")}
                  className="text-slate-300 hover:text-white font-semibold transition"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2026 ExpenseHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}