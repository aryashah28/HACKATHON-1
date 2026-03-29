import { useEffect, useState } from "react";
import API from "../api";
import { FileText, TrendingUp, Calendar } from "lucide-react";

const statusConfig = {
  pending: { color: "bg-yellow-100", textColor: "text-yellow-800", label: "Pending" },
  approved: { color: "bg-green-100", textColor: "text-green-800", label: "Approved" },
  rejected: { color: "bg-red-100", textColor: "text-red-800", label: "Rejected" },
};

export default function Expenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/expenses/1")
      .then((res) => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Expenses</h1>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No expenses submitted yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((e) => {
            const config = statusConfig[e.status] || statusConfig.pending;
            return (
              <div
                key={e.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm">{e.category}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {e.currency} {e.amount}
                    </p>
                  </div>
                  <span className={`${config.color} ${config.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                    {config.label}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{e.description}</p>

                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Calendar className="w-4 h-4" />
                  {new Date(e.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}