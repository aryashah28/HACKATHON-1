import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{ padding: 10, background: "#222", color: "white" }}>
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/submit">Submit</Link> |{" "}
      <Link to="/expenses">Expenses</Link> |{" "}
      <Link to="/approvals">Approvals</Link>
    </div>
  );
}