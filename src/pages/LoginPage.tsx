import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "../app/store";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const role = await login(username, password);
      if (!role) { setError("Invalid username or password"); return; }
      if (role === "superadmin") navigate({ to: "/super-admin", search: { tab: "live" } });
      else if (role === "manager") navigate({ to: "/manager", search: { tab: "overview" } });
      else navigate({ to: "/employee", search: { tab: "overview" } });
    } catch (err) {
      setError("Login failed. Please verify credentials or check connection.");
    }
  };

  return (
    <div className="sham-app">
      <div className="login-wrap" style={{ background: "#F6F7FC" }}>
        <form className="login-card" onSubmit={submit} style={{ background: "#FFFFFF", border: "1px solid #EEF0F8", borderRadius: "24px", boxShadow: "0 20px 50px rgba(124, 58, 237, 0.08)" }}>
          <div className="login-logo" style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", color: "#FFFFFF", boxShadow: "0 8px 20px rgba(124, 58, 237, 0.35)", borderRadius: "18px" }}>
            <ShieldCheck size={32} color="#FFFFFF" />
          </div>
          <h1 className="login-title" style={{ color: "#1E1B4B", fontWeight: 800, fontSize: "24px" }}>ElectroHub</h1>
          <p className="login-sub" style={{ color: "#64748B", fontSize: "14px", marginTop: "4px" }}>Smart Management System — Sign in to continue</p>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" style={{ color: "#1E1B4B", fontWeight: 700 }}>Username</label>
            <input
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: "#1E1B4B", fontWeight: 700 }}>Password</label>
            <div className="password-wrap">
              <input
                className="form-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              <button type="button" className="password-toggle" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 12, background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", color: "#FFFFFF", borderRadius: "999px", padding: "14px", fontWeight: 700, border: "none", boxShadow: "0 8px 22px rgba(124, 58, 237, 0.35)" }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
