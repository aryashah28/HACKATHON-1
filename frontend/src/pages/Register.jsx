import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import { UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    country: "US",
    company_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (form.role === "admin" && !form.company_name) {
      return setError("Admin must provide a company name");
    }

    setLoading(true);

    try {
      const res = await signup(
        form.username,
        form.password,
        form.role,
        form.country,
        form.role === "admin" ? form.company_name : null
      );

      // Store authentication data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("company_id", res.data.company_id);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-700/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-600/20 rounded-full filter blur-3xl opacity-20"></div>
      
      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-md relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="backdrop-blur-xl bg-slate-700/40 border border-white/20 p-3 rounded-full shadow-lg">
            <UserPlus className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mt-3 text-white">Create Account</h1>
          <p className="text-white/60 text-sm">Start managing your expenses easily</p>
        </div>

        {/* Error */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/40 text-red-200 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-white/60 hover:text-white/80 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2 text-white/60 hover:text-white/80 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white transition"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-800">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white transition"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company Name */}
          {form.role === "admin" && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="Enter company name"
                value={form.company_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-500/50 disabled:to-blue-600/50 text-white font-semibold py-2 rounded-lg transition border border-blue-400/30"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Role */}
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`p-2 rounded-xl border text-sm font-medium transition ${
                  form.role === r.value
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Company */}
          {form.role === "admin" && (
            <input
              name="company_name"
              placeholder="Company Name"
              value={form.company_name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Country */}
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Currency */}
          <div className="bg-gray-100 rounded-xl px-4 py-2 text-gray-600 font-medium">
            Currency: {currency}
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition shadow-lg"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {/* Login */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-200 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-200 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white transition"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-gray-800">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white transition"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-gray-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company Name */}
          {form.role === "admin" && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="Enter company name"
                value={form.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-xl bg-slate-600/40 hover:bg-slate-600/60 disabled:bg-slate-600/20 text-white font-semibold py-2 rounded-lg transition border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Creating...
              </>
            ) : (
              <>Register</>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-300 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-slate-300 hover:text-white font-semibold transition">
            Login here
          </a>
        </p>
      </div>
    </div>
  );