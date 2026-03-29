import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ============= AUTH ENDPOINTS =============
export const signup = (username, password, role, country, company_name) =>
  API.post("/auth/signup", { username, password, role, country, company_name });

export const login = (username, password) =>
  API.post("/auth/login", { username, password });

export const createEmployee = (username, password, role, manager_id, company_id, admin_id) =>
  API.post("/auth/create_employee", { 
    username, 
    password, 
    role, 
    manager_id, 
    company_id, 
    admin_id 
  });

export const assignManager = (user_id, manager_id, company_id, admin_id) =>
  API.put(`/auth/assign_manager/${user_id}`, { 
    manager_id, 
    company_id, 
    admin_id 
  });

export const extractReceipt = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/auth/extract_receipt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ============= EXPENSE ENDPOINTS =============
export const submitExpense = (amount, currency, category, description, expense_date) => {
  const user_id = parseInt(localStorage.getItem("user_id"));
  const company_id = parseInt(localStorage.getItem("company_id"));
  return API.post("/expense/expense", {
    amount,
    currency,
    category,
    description,
    expense_date,
  }, {
    params: { user_id, company_id }
  });
};

export const getMyExpenses = () => {
  const user_id = parseInt(localStorage.getItem("user_id"));
  return API.get("/expense/my-expenses", { 
    params: { user_id } 
  });
};

export const getPendingApprovals = () => {
  const approver_id = parseInt(localStorage.getItem("user_id"));
  const company_id = parseInt(localStorage.getItem("company_id"));
  return API.get("/expense/pending_approvals", { 
    params: { approver_id, company_id } 
  });
};

export const approveExpense = (approval_id, decision, comments) => 
  API.post("/expense/approve", {}, { 
    params: { approval_id, decision, comments } 
  });

export const approveOverride = (expense_id, decision) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.post("/expense/approve-override", {}, { 
    params: { expense_id, decision, admin_id } 
  });
};

export const getTeamExpenses = () => {
  const manager_id = parseInt(localStorage.getItem("user_id"));
  return API.get("/expense/team-expenses", { 
    params: { manager_id } 
  });
};

export const getCompanyExpenses = () => {
  const company_id = parseInt(localStorage.getItem("company_id"));
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.get("/expense/company-expenses", { 
    params: { company_id, admin_id } 
  });
};

export const getExpenseDetail = (expense_id) =>
  API.get(`/expense/expense/${expense_id}`);

// ============= APPROVAL RULE ENDPOINTS =============
export const createApprovalRule = (rule_type, percentage_required, specific_approver_id, approver_sequence) => {
  const company_id = parseInt(localStorage.getItem("company_id"));
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.post("/rules/", {
    rule_type,
    percentage_required,
    specific_approver_id,
    approver_sequence,
  }, {
    params: { company_id, admin_id }
  });
};

export const getApprovalRules = () => {
  const company_id = parseInt(localStorage.getItem("company_id"));
  return API.get(`/rules/${company_id}`);
};

export const updateApprovalRule = (rule_id, rule_type, percentage_required, specific_approver_id, approver_sequence) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.put(`/rules/${rule_id}`, {
    rule_type,
    percentage_required,
    specific_approver_id,
    approver_sequence,
  }, {
    params: { admin_id }
  });
};

export const deleteApprovalRule = (rule_id) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.delete(`/rules/${rule_id}`, { 
    params: { admin_id } 
  });
};

// ============= USER MANAGEMENT ENDPOINTS =============
export const getCompanyUsers = () => {
  const company_id = parseInt(localStorage.getItem("company_id"));
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.get(`/users/company/${company_id}`, { 
    params: { admin_id } 
  });
};

export const changeUserRole = (user_id, new_role) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.put(`/users/${user_id}/change_role`, 
    { new_role }, 
    { params: { admin_id } }
  );
};

export const assignUserManager = (user_id, manager_id) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.put(`/users/${user_id}/assign_manager`, 
    { manager_id }, 
    { params: { admin_id } }
  );
};

export const deleteUser = (user_id) => {
  const admin_id = parseInt(localStorage.getItem("user_id"));
  return API.delete(`/users/${user_id}`, { 
    params: { admin_id } 
  });
};

export default API;