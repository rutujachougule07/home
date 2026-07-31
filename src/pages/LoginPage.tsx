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
      <div className="login-wrap" style={{ background: "#FAF8F3" }}>
        <form className="login-card" onSubmit={submit} style={{ background: "#FFFFFF", border: "1px solid #EFECE4", borderRadius: "24px", boxShadow: "0 20px 50px rgba(18, 58, 34, 0.08)" }}>
          <div className="login-logo" style={{ background: "#123A22", color: "#FFFFFF", boxShadow: "0 8px 20px rgba(18, 58, 34, 0.25)", borderRadius: "18px" }}>
            <ShieldCheck size={32} color="#FFFFFF" />
          </div>
          <h1 className="login-title" style={{ color: "#1F2937", fontWeight: 800, fontSize: "24px" }}>ElectroHub</h1>
          <p className="login-sub" style={{ color: "#556052", fontSize: "14px", marginTop: "4px" }}>Smart Management System — Sign in to continue</p>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" style={{ color: "#1F2937", fontWeight: 700 }}>Username</label>
            <input
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: "#1F2937", fontWeight: 700 }}>Password</label>
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

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 12, background: "#123A22", color: "#FFFFFF", borderRadius: "999px", padding: "14px", fontWeight: 700, border: "none", boxShadow: "0 8px 22px rgba(18, 58, 34, 0.25)" }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
