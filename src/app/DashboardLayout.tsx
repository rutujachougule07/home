import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  const initials = (currentUser?.name ?? "Vaishnavi Bhosale").split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <div className="sham-app">
      <div className="dash">
        <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
        {/* LIGHT SIDEBAR (NO DARK BACKGROUND) */}
        <aside className={`sidebar ${open ? "open" : ""}`} style={{ background: "linear-gradient(180deg, #EAE6D2 0%, #DFDAC5 100%)", borderRight: "1px solid #D5CFB6" }}>
          {/* Brand Logo Header */}
          <div className="sidebar-brand" style={{ borderBottom: "1px solid #D5CFB6" }}>
            <span className="logo-sq" style={{ background: "linear-gradient(135deg, #121A1B, #505039)", boxShadow: "0 4px 12px rgba(18, 26, 27, 0.3)", color: "#EAE6D2" }}>🍷</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#121A1B", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Star Home</span>
              <span style={{ fontSize: "12px", color: "#505039", fontWeight: 600 }}>Appliances</span>
            </div>
          </div>

          {/* Navigation items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {nav.map((n) => {
              const badgeCount = getBadgeCount(n.key);
              const isActive = active === n.key;
              return (
                <button
                  key={n.key}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => { onNav(n.key); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isActive ? "linear-gradient(135deg, #121A1B, #505039)" : "transparent",
                    color: isActive ? "#EAE6D2" : "#505039"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "16px", display: "inline-flex", alignItems: "center" }}>{n.icon}</span>
                    <span style={{ fontWeight: isActive ? 700 : 600 }}>{n.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span style={{
                      background: isActive ? "#A7AA63" : "#505039",
                      color: isActive ? "#121A1B" : "#EAE6D2",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "999px"
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User profile & Promo Section at Bottom */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "16px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              background: "#F4F2E6",
              border: "1px solid #D5CFB6",
              borderRadius: "14px",
              color: "#121A1B"
            }}>
              <span style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #121A1B, #505039)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
                color: "#EAE6D2",
                boxShadow: "0 2px 6px rgba(18, 26, 27, 0.3)"
              }}>{initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#121A1B" }}>
                  {currentUser?.name || "Vaishnavi B."}
                </div>
                <div style={{ fontSize: "11px", color: "#505039", fontWeight: 600 }}>Super Admin</div>
              </div>
              <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#505039", cursor: "pointer", fontSize: "16px" }} title="Logout">
                ↩
              </button>
            </div>

            <div style={{ fontSize: "10px", color: "#505039", opacity: 0.8, textAlign: "center" }}>
              © 2025 Star Home Appliances.
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="content" style={{ padding: "20px 28px" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  onClick,
  variant,
  trend,
  isNegative
}: {
  icon: string;
  label: string;
  value: string | number;
  onClick?: () => void;
  variant?: "pink" | "purple" | "orange" | "rose" | "coral" | "default";
  trend?: string;
  isNegative?: boolean;
}) {
  if (variant && variant !== "default") {
    // Rich Dark Card Variants for High Impact
    const gradients: Record<string, string> = {
      pink: "linear-gradient(135deg, #121A1B 0%, #253335 100%)",
      purple: "linear-gradient(135deg, #505039 0%, #383827 100%)",
      orange: "linear-gradient(135deg, #A7AA63 0%, #76793B 100%)",
      rose: "linear-gradient(135deg, #2D3A3C 0%, #121A1B 100%)",
      coral: "linear-gradient(135deg, #505039 0%, #121A1B 100%)",
    };

    const sparklines: Record<string, string> = {
      pink: "M 0 30 Q 30 38 60 20 T 120 28 T 180 10 T 220 5",
      purple: "M 0 35 Q 35 15 70 28 T 140 18 T 220 8",
      orange: "M 0 28 Q 40 36 80 20 T 150 25 T 220 12",
      rose: "M 0 32 Q 40 18 80 28 T 150 12 T 220 6",
      coral: "M 0 8 Q 45 18 90 28 T 160 32 T 220 38",
    };
    const path = sparklines[variant] || sparklines.pink;
    const bgGradient = gradients[variant] || gradients.pink;

    return (
      <div
        className="stat-card-gradient"
        onClick={onClick}
        style={{
          background: bgGradient,
          cursor: onClick ? "pointer" : "default",
          color: "#F7F4ED"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", zIndex: 2 }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "rgba(247, 244, 237, 0.25)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: "inset 0 0 0 1px rgba(247, 244, 237, 0.4)"
          }}>
            {icon}
          </div>
        </div>

        <div style={{ zIndex: 2 }}>
          <div style={{ fontSize: "12px", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600, marginBottom: "4px" }}>
            {label}
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: "6px" }}>
            {value}
          </div>
          {trend && (
            <div style={{ fontSize: "11px", fontWeight: 600, opacity: 0.95, display: "flex", alignItems: "center", gap: "4px" }}>
              <span>{isNegative ? "↘" : "↗"}</span> {trend}
            </div>
          )}
        </div>

        {/* Mini SVG Sparkline at Bottom */}
        <svg
          viewBox="0 0 220 40"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "45px",
            opacity: 0.6,
            pointerEvents: "none"
          }}
        >
          <path d={path} fill="none" stroke="#F7F4ED" strokeWidth="3" strokeLinecap="round" />
          <path d={`${path} L 220 40 L 0 40 Z`} fill="rgba(247, 244, 237, 0.15)" />
        </svg>
      </div>
    );
  }

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

export function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--brown)", fontSize: "13px" }}>
        📊 No work activity data recorded yet.
      </div>
    );
  }

  let accumulatedAngle = 0;
  const radius = 70;
  const cx = 100;
  const cy = 100;

  const slices = data.map((d) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = angle >= 359.9
      ? `M ${cx - radius},${cy} A ${radius},${radius} 0 1,0 ${cx + radius},${cy} A ${radius},${radius} 0 1,0 ${cx - radius},${cy}`
      : `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

    return {
      ...d,
      percentage: Math.round(percentage * 100),
      pathData,
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
      <div style={{ position: "relative", width: "160px", height: "160px" }}>
        <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              stroke="#E0D8C8"
              strokeWidth="2"
              style={{ transition: "all 0.3s ease", cursor: "pointer" }}
            >
              <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
            </path>
          ))}
          <circle cx="100" cy="100" r="40" fill="#F7F4ED" />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--brown-dark)" }}>{total}</div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--brown)", textTransform: "uppercase" }}>Total Work</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "160px" }}>
        {slices.map((slice, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: slice.color, display: "inline-block" }} />
              <span style={{ fontWeight: 600, color: "#2C352B" }}>{slice.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 700, color: "var(--brown-dark)" }}>{slice.value}</span>
              <span style={{ fontSize: "11px", color: "var(--brown)", fontWeight: 600 }}>({slice.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, className }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${className ?? ""}`} onClick={(e) => e.stopPropagation()} style={{ background: "#F7F4ED" }}>
        <div className="modal-head" style={{ borderBottom: "1px dashed #E0D8C8" }}>
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}