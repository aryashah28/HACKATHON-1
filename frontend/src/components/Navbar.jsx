import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">💼 ExpenseSys</h2>

      <nav className="flex flex-col gap-4 text-lg">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/submit" className="hover:text-blue-400">Submit Expense</Link>
        <Link to="/expenses" className="hover:text-blue-400">My Expenses</Link>
        <Link to="/approvals" className="hover:text-blue-400">Approvals</Link>
      </nav>
    </aside>
  );
}