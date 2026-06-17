import { ReactNode, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore, Role } from "./store";

export interface NavItem { key: string; label: string; icon: string; }

interface Props {
  role: Role;
  title: string;
  nav: NavItem[];
  active: string;
  onNav: (key: string) => void;
  children: ReactNode;
}

export function DashboardLayout({ role, title, nav, active, onNav, children }: Props) {
  const { currentUser, logout, notifications, orders, tasks } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const seen = new Set<string>();
  const filteredNotifications = notifications.filter((n) => {
    if (n.to !== role && n.to !== "all") return false;

    // Filter out duplicates
    const key = `${n.to}-${n.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    
    const msg = n.message.toLowerCase();
    if (msg.includes("pending")) {
      const match = n.message.match(/pending for\s+(.+)/i);
      if (match) {
        const customerName = match[1].trim().toLowerCase();
        const hasPending = orders.some(o => o.customerName.toLowerCase() === customerName && o.status === "Pending");
        if (!hasPending) return false;
      } else if (msg.includes("pending for approval")) {
        const hasPending = orders.some(o => o.status === "Pending");
        if (!hasPending) return false;
      }
    }
    return true;
  });

  const unread = filteredNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const getBadgeCount = (key: string): number => {
    if (key === "notifications") {
      return unread;
    }
    if (role === "superadmin" && key === "orders") {
      return orders.filter((o) => o.status === "Pending").length;
    }
    if (role === "employee" && key === "tasks" && currentUser) {
      return tasks.filter((t) => t.assignedTo === currentUser.id && t.status !== "Completed").length;
    }
    if (role === "employee" && key === "orders" && currentUser) {
      return orders.filter((o) => o.assignedTo === currentUser.id && o.sentToEmployee && o.status === "Approved").length;
    }
    return 0;
  };

  const initials = (currentUser?.name ?? "U").split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <div className="sham-app">
      <div className="dash">
        <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
        <aside className={`sidebar ${open ? "open" : ""}`}>
          <div className="sidebar-brand">
            <span className="logo-sq">SH</span>
            <span>Smart Home</span>
          </div>
          {nav.map((n) => {
            const badgeCount = getBadgeCount(n.key);
            return (
              <button
                key={n.key}
                className={`nav-item ${active === n.key ? "active" : ""}`}
                onClick={() => { onNav(n.key); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{n.icon}</span> {n.label}
                </div>
                {badgeCount > 0 && (
                  <span style={{
                    background: "var(--success)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "999px",
                    animation: "pulse 2s infinite"
                  }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
          <button className="nav-item" style={{ marginTop: "auto" }} onClick={handleLogout}>
            <span>↩</span> Logout
          </button>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
              <div className="topbar-search">
                <span>🔍</span>
                <input placeholder={`Search in ${title}...`} />
              </div>
            </div>
            <div className="topbar-right">
              {role !== "employee" && (
                <button 
                  className="icon-btn" 
                  title="Notifications"
                  onClick={() => onNav("notifications")}
                >
                  🔔{unread > 0 && (
                    <span 
                      className="badge-dot" 
                      style={{ 
                        background: "var(--success)", 
                        boxShadow: "0 0 6px var(--success)" 
                      }} 
                    />
                  )}
                </button>
              )}
              <div className="profile-chip">
                <span className="avatar">{initials}</span>
                <div style={{ fontSize: 12, lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700 }}>{currentUser?.name}</div>
                  <div style={{ color: "var(--brown)" }}>{title}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, onClick }: { icon: string; label: string; value: string | number; onClick?: () => void }) {
  return (
    <div className="stat-card" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export function Pill({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pending": "pending",
    "Approved": "approved",
    "Rejected": "rejected",
    "Active": "active",
    "Inactive": "inactive",
    "Completed": "completed",
    "In Progress": "progress",
    "Contacted": "progress",
  };
  const key = map[status] ?? "pending";
  return <span className={`pill pill-${key}`}>{status}</span>;
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <div className="bar" style={{ height: `${(d.value / max) * 100}%` }} />
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, className }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${className ?? ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}