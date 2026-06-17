import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "../app/store";

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
      <div className="login-wrap">
        <form className="login-card" onSubmit={submit}>
          <div className="login-logo">🏠</div>
          <h1 className="login-title">Smart Home Appliances</h1>
          <p className="login-sub">Management System — Sign in to continue</p>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrap">
              <input
                className="form-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button type="button" className="password-toggle" onClick={() => setShow((s) => !s)}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 6 }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
