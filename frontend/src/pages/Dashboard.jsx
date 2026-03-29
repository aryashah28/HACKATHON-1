import { useEffect, useState } from "react";
import API from "../api";
import { TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: "Total Expenses",
      value: data.total,
      icon: <TrendingUp className="w-6 h-6" />,
      bgColor: "bg-blue-500",
    },
    {
      title: "Approved",
      value: data.approved,
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: "bg-green-500",
    },
    {
      title: "Pending",
      value: data.pending,
      icon: <Clock className="w-6 h-6" />,
      bgColor: "bg-yellow-500",
    },
    {
      title: "Rejected",
      value: data.rejected,
      icon: <XCircle className="w-6 h-6" />,
      bgColor: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-slate-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-card-light shadow-lg hover:shadow-xl transition p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-50 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} text-white p-3 rounded-lg opacity-80`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 glass-card-light shadow-lg p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-gray-50 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="backdrop-blur-lg bg-slate-600/40 hover:bg-slate-600/60 text-white px-6 py-2 rounded-lg transition border border-white/20 hover:border-white/40">
            Submit Expense
          </button>
          <button className="backdrop-blur-lg bg-slate-600/40 hover:bg-slate-600/60 text-white px-6 py-2 rounded-lg transition border border-white/20 hover:border-white/40">
            View Approvals
          </button>
        </div>
      </div>
    </div>
  );
}