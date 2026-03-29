import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Submit from "./pages/SubmitExpense";
import Expenses from "./pages/Expenses";
import Approvals from "./pages/Approvals";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Navbar />
        <div className="p-6 w-full bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/approvals" element={<Approvals />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}