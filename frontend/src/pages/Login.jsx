import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = async () => {
    const res = await API.post("/login", null, {
      params: { username, password },
    });
    localStorage.setItem("token", res.data.token);
    nav("/dashboard");
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" onChange={e=>setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}