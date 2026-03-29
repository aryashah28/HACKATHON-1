import { useEffect, useState } from "react";
import { getCompanyUsers, changeUserRole, assignUserManager, deleteUser, createEmployee, getApprovalRules, createApprovalRule, deleteApprovalRule } from "../api";
import { Users, Shield, UserPlus, Trash2, Settings, Plus, Info, AlertCircle } from "lucide-react";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  
  // Create User Form State
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "employee" });
  
  // Create Rule Form State
  const [newRule, setNewRule] = useState({ 
    name: "", 
    rule_type: "percentage", 
    threshold_amount: 0,
    percentage_required: 1.0,
    approver_sequence: []
  });

  const company_id = localStorage.getItem("company_id");

  useEffect(() => {
    loadData();
  }, [company_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rulesRes] = await Promise.all([
        getCompanyUsers(company_id),
        getApprovalRules(company_id)
      ]);
      setUsers(usersRes.data.users || []);
      setRules(rulesRes.data.rules || []);
    } catch (err) {
      setError("Failed to load admin data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user_id, new_role) => {
    try {
      await changeUserRole(user_id, new_role);
      loadData();
    } catch (err) {
      setError("Failed to change role");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newUser.username, newUser.password, newUser.role);
      setNewUser({ username: "", password: "", role: "employee" });
      loadData();
    } catch (err) {
      setError("Failed to create user");
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await createApprovalRule({ ...newRule, company_id: parseInt(company_id) });
      setNewRule({ name: "", rule_type: "percentage", threshold_amount: 0, percentage_required: 1.0, approver_sequence: [] });
      loadData();
    } catch (err) {
      setError("Failed to create rule");
    }
  };

  const handleDeleteRule = async (rule_id) => {
    try {
      await deleteApprovalRule(rule_id);
      loadData();
    } catch (err) {
      setError("Failed to delete rule");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Admin Console...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="text-blue-400" /> Admin Console
          </h1>
          <p className="text-white/60">Manage your company's users and approval workflows</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'rules' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
          >
            Approval Rules
          </button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-8 flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "users" ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-400" /> Company Users
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="pb-3 px-2">Username</th>
                      <th className="pb-3 px-2">Role</th>
                      <th className="pb-3 px-2">Manager</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 group transition">
                        <td className="py-4 px-2 font-medium">{u.username}</td>
                        <td className="py-4 px-2">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-xs"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Employee</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <select 
                            value={u.manager_id || ""} 
                            onChange={(e) => assignUserManager(u.id, parseInt(e.target.value))}
                            className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-xs w-32"
                          >
                            <option value="">No Manager</option>
                            {users.filter(m => m.role === 'manager' && m.id !== u.id).map(m => (
                              <option key={m.id} value={m.id}>{m.username}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings size={20} className="text-purple-400" /> Approval Rules
              </h2>
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <p className="text-white/60">No rules configured. Expenses follow standard manager flow.</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{rule.name}</h3>
                        <p className="text-sm text-white/60 capitalize">Type: {rule.rule_type}</p>
                        <p className="text-xs text-blue-400 mt-1">
                          {rule.rule_type === 'percentage' && `${(rule.percentage_required * 100)}% approval required`}
                          {rule.threshold_amount > 0 && ` | Triggers above $${rule.threshold_amount}`}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          {/* Create User Form */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-green-400" /> Quick Invite
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Username</label>
                <input 
                  type="text" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Initial Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-bold transition">
                Create User
              </button>
            </form>
          </div>

          {/* Create Rule Form Info */}
          <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Info size={18} className="text-blue-400" /> Why use rules?
            </h2>
            <p className="text-sm text-white/70">
              Rules allow you to automate multi-step approvals. For example, any expense over $500 can be set to require 100% approval from all senior managers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
