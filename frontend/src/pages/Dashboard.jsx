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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
            Submit Expense
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
            View Approvals
          </button>
        </div>
      </div>
    </div>
  );
}