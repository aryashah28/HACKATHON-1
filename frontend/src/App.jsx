import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Approvals from "./pages/Approvals";
import Admin from "./pages/Admin";
import SubmitExpense from "./pages/SubmitExpense";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <div className="flex bg-slate-900 min-h-screen">
        <Navbar />
        <main className="flex-1 w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/submit" element={<SubmitExpense />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}