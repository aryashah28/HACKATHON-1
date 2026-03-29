import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Send, Receipt, CheckSquare } from "lucide-react";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/submit", label: "Submit Expense", icon: <Send className="w-5 h-5" /> },
    { path: "/expenses", label: "My Expenses", icon: <Receipt className="w-5 h-5" /> },
    { path: "/approvals", label: "Approvals", icon: <CheckSquare className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="text-3xl font-bold flex items-center gap-2 mb-2">
          <span className="bg-blue-600 rounded-lg p-2">💰</span>
          ExpenseHub
        </div>
        <p className="text-gray-400 text-sm">Reimbursement Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}