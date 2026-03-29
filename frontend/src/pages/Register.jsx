import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "UK", name: "United Kingdom", currency: "GBP" },
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

  const currency =
    COUNTRIES.find((c) => c.code === form.country)?.currency || "USD";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/signup", {
        username: form.username,
        password: form.password,
        role: form.role,
        country: form.country,
        currency,
        company_name: form.role === "admin" ? form.company_name : null,
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-700/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-600/20 rounded-full filter blur-3xl opacity-20"></div>
      
      {/* Glass Card */}
      <div className="glass-card-light shadow-2xl p-8 w-full max-w-md relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="backdrop-blur-xl bg-slate-700/40 border border-white/20 p-3 rounded-full shadow-lg">
            <UserPlus className="text-gray-100 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mt-3 text-gray-50">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Start managing your expenses easily
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/40 text-red-300 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition"
            />
          </div>

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

          {/* Currency Display */}
          <div className="backdrop-blur-lg bg-slate-700/30 border border-white/20 rounded-lg px-3 py-2 text-gray-200 text-sm font-medium">
            Currency: {currency}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-xl bg-slate-600/40 hover:bg-slate-600/60 disabled:bg-slate-600/20 text-white font-semibold py-2 rounded-lg transition border border-white/20 hover:border-white/40"
          >
            {loading ? "Creating..." : "Create Account"}
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
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-700/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-600/20 rounded-full filter blur-3xl opacity-20"></div>
      
      {/* Glass Card */}
      <div className="glass-card-light shadow-2xl p-8 w-full max-w-md relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="backdrop-blur-xl bg-slate-700/40 border border-white/20 p-3 rounded-full shadow-lg">
            <UserPlus className="text-gray-100 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mt-3 text-gray-50">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Start managing your expenses easily
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/40 text-red-300 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition"
            />
          </div>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
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