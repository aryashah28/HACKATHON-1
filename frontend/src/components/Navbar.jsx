import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Send, Receipt, CheckCircle, ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!role || location.pathname === "/login" || location.pathname === "/register") return null;

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
            : 'hover:bg-white/5 text-white/70 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{children}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-white/10 text-white min-h-screen p-6 flex flex-col sticky top-0">
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Receipt size={24} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">ExpenseSys</h2>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
        
        <NavLink to="/submit" icon={Send}>Submit Expense</NavLink>

        <NavLink to="/expenses" icon={Receipt}>My Expenses</NavLink>

        {(role === "manager" || role === "admin") && (
          <NavLink to="/approvals" icon={CheckCircle}>Approvals</NavLink>
        )}

        {role === "admin" && (
          <NavLink to="/admin" icon={ShieldCheck}>Admin Panel</NavLink>
        )}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition border border-red-500/20 mt-auto"
      >
        <LogOut size={20} /> 
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}