import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useStore, Product, User, Order, Lead, Task } from "../app/store";
import { UnifiedEmployeeCard } from "../components/UnifiedEmployeeCard";
import { DashboardLayout, StatCard, Pill, BarChart, Modal, NavItem } from "../app/DashboardLayout";
import { AlertCircle, Snowflake, Clock, Flame, CheckCircle2, XCircle, MessageSquare, Briefcase, Calendar, Phone, User as UserIcon, Trash2, Mail, Key } from "lucide-react";

const NAV: NavItem[] = [
  { key: "live", label: "Live Status", icon: "📡" },
  { key: "products", label: "Stocking Inventory", icon: "📦" },
  { key: "godown", label: "Godowns", icon: "🏭" },
  { key: "leads", label: "Lead Generation", icon: "🧲" },
  { key: "assign", label: "Add Employee / manager", icon: "📋" },
  { key: "task-assign", label: "Task Assign", icon: "📝" },
  { key: "orders", label: "Order Approvals", icon: "✅" },
  { key: "incentive", label: "Incentive", icon: "💰" },
];

interface SuperAdminPageProps {
  tab?: string;
}

export function SuperAdminPage({ tab = "live" }: SuperAdminPageProps) {
  const store = useStore();
  const active = tab || "live";
  const navigate = useNavigate();
  const setActive = (tab: string) => {
    navigate({ to: "/super-admin", search: { tab } });
  };

  if (!store.currentUser || store.currentUser.role !== "superadmin") return <Navigate to="/login" />;

  return (
    <DashboardLayout role="superadmin" title="Super Admin" nav={NAV} active={active} onNav={setActive}>
      {active === "live" && <LiveDashboard />}
      {active === "leads" && <LeadsSection />}
      {active === "assign" && <TasksAssignSection />}
      {active === "task-assign" && <TaskAssignmentSection />}
      {active === "managers" && <ManagersSection />}
      {active === "employees" && <EmployeesSection />}
      {active === "products" && <ProductsSection />}
      {active === "godown" && <SuperAdminGodownSection />}
      {active === "orders" && <OrderApprovalSection />}
      {active === "incentive" && <SuperAdminIncentiveSection />}
      {active === "notifications" && <NotificationsSection role="superadmin" />}
    </DashboardLayout>
  );
}

interface SmartDevice {
  id: string;
  name: string;
  type: string;
  status: "ON" | "OFF";
  consumption: number; // in Watts
  location: string;
  icon: string;
}

interface AlertLog {
  id: string;
  time: string;
  device: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

const INITIAL_DEVICES: SmartDevice[] = [
  { id: "d1", name: "Smart AC", type: "Climate", status: "ON", consumption: 1200, location: "Main Hall", icon: "❄️" },
  { id: "d2", name: "Living Room Lights", type: "Lighting", status: "ON", consumption: 60, location: "Living Room", icon: "💡" },
  { id: "d3", name: "Security Cameras", type: "Security", status: "ON", consumption: 15, location: "Outdoor", icon: "📹" },
  { id: "d4", name: "Water Heater", type: "Appliance", status: "OFF", consumption: 0, location: "Bathroom", icon: "♨️" },
  { id: "d5", name: "Smart Refrigerator", type: "Appliance", status: "ON", consumption: 180, location: "Kitchen", icon: "🧊" },
  { id: "d6", name: "Main IoT Gateway", type: "Network", status: "ON", consumption: 12, location: "Server Closet", icon: "📡" },
];

const INITIAL_ALERTS: AlertLog[] = [
  { id: "a1", time: "14:52", device: "Security Cameras", message: "Motion detected in Backyard", severity: "info" },
  { id: "a2", time: "14:45", device: "Smart AC", message: "Filter clean warning (runtime > 200 hrs)", severity: "warning" },
  { id: "a3", time: "13:20", device: "Power Grid", message: "Voltage fluctuation detected (245V)", severity: "warning" },
];

function LiveDashboard() {
  const [devices, setDevices] = useState<SmartDevice[]>(INITIAL_DEVICES);
  const [alerts, setAlerts] = useState<AlertLog[]>(INITIAL_ALERTS);
  const [temp, setTemp] = useState(23.8);
  const [humidity, setHumidity] = useState(52);
  const [energyHistory, setEnergyHistory] = useState<number[]>([1450, 1420, 1480, 1460, 1490, 1430, 1450, 1470, 1480, 1450]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Fluctuate temp/humidity
      setTemp(t => +(t + (Math.random() - 0.5) * 0.2).toFixed(1));
      setHumidity(h => Math.max(30, Math.min(80, Math.round(h + (Math.random() - 0.5) * 2))));

      // 2. Calculate power draw
      setDevices(prevDevices => {
        let currentDraw = 80; // baseline
        const updated = prevDevices.map(d => {
          if (d.status === "ON") {
            let activeConsumption = d.consumption;
            if (d.id === "d1") activeConsumption = 1100 + Math.floor(Math.random() * 200); // AC
            else if (d.id === "d2") activeConsumption = 55 + Math.floor(Math.random() * 10); // Lights
            else if (d.id === "d5") activeConsumption = 150 + Math.floor(Math.random() * 60); // Fridge
            else if (d.id === "d4") activeConsumption = 1950 + Math.floor(Math.random() * 100); // Heater
            currentDraw += activeConsumption;
            return { ...d, consumption: activeConsumption };
          }
          return d;
        });

        // Update history
        setEnergyHistory(prev => [...prev.slice(1), currentDraw]);
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      const randomAlerts = [
        { device: "Smart Lock", message: "Front Door unlocked by Rohan Patil", severity: "info" as const },
        { device: "Kitchen Sensor", message: "Kitchen Refrigerator door left open", severity: "warning" as const },
        { device: "Main Gateway", message: "IoT Gateway: Automated daily backup complete", severity: "info" as const },
        { device: "Smart AC", message: "Compressor optimization mode initiated", severity: "info" as const },
        { device: "Living Room Lights", message: "Smart Scene 'Relax' activated", severity: "info" as const },
      ];

      const chosen = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
      const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const newAlert: AlertLog = {
        id: `a-${Math.random()}`,
        time,
        device: chosen.device,
        message: chosen.message,
        severity: chosen.severity
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 7)]);
    }, 20000);

    return () => clearInterval(alertInterval);
  }, []);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === "ON" ? "OFF" : "ON";
        let defaultConsumption = 0;
        if (newStatus === "ON") {
          if (d.id === "d1") defaultConsumption = 1200;
          else if (d.id === "d2") defaultConsumption = 60;
          else if (d.id === "d3") defaultConsumption = 15;
          else if (d.id === "d4") defaultConsumption = 2000;
          else if (d.id === "d5") defaultConsumption = 180;
          else if (d.id === "d6") defaultConsumption = 12;
        }

        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const newAlert: AlertLog = {
          id: `a-${Math.random()}`,
          time,
          device: d.name,
          message: `${d.name} turned ${newStatus}`,
          severity: "info"
        };
        setAlerts(prev => [newAlert, ...prev]);

        return { ...d, status: newStatus, consumption: defaultConsumption };
      }
      return d;
    }));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerMockAlert = () => {
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const mockAlerts = [
      { device: "Kitchen Appliance", message: "Microwave: Power surge detected!", severity: "critical" as const },
      { device: "Security System", message: "Intruder Alert: Motion detected in garage area!", severity: "critical" as const },
      { device: "Climate Control", message: "High Humidity alert in Server Closet (85%)!", severity: "warning" as const },
      { device: "Water Heater", message: "Water Heater: Element over-temperature warning!", severity: "warning" as const }
    ];
    const chosen = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    setAlerts(prev => [{ id: `a-${Math.random()}`, time, ...chosen }, ...prev]);
  };

  const totalPower = devices.reduce((sum, d) => sum + (d.status === "ON" ? d.consumption : 0), 80);
  const activeCount = devices.filter(d => d.status === "ON").length;

  const chartWidth = 560;
  const chartHeight = 130;
  const maxVal = Math.max(...energyHistory, 1500) * 1.15;
  const points = energyHistory.map((val, idx) => {
    const x = (idx / (energyHistory.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = points.length ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : "";

  return (
    <div className="live-dash-container">
      <style>{`
        .live-dash-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .live-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .live-beacon-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fdf3f2;
          border: 1px solid #ecc2bd;
          padding: 6px 14px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 12px;
          color: var(--danger);
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--danger);
          animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(192, 71, 59, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(192, 71, 59, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(192, 71, 59, 0); }
        }
        
        .live-row-top {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .live-row-top {
            grid-template-columns: 1fr;
          }
        }
        
        .telemetry-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .telemetry-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        .telemetry-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--accent), var(--light-brown));
        }
        .telemetry-card-full {
          grid-column: span 2;
        }
        .telemetry-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--brown);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px;
        }
        .telemetry-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--brown-dark);
          margin: 4px 0;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .telemetry-unit {
          font-size: 14px;
          font-weight: 600;
          color: var(--brown);
        }
        .telemetry-status {
          font-size: 11px;
          color: var(--success);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
        }
        .telemetry-status.fluctuating::after {
          content: '●';
          font-size: 8px;
          color: var(--success);
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }

        .chart-panel {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .live-grid-bottom {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .live-grid-bottom {
            grid-template-columns: 1fr;
          }
        }
        
        .devices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-top: 10px;
        }
        .device-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .device-card.on {
          border-color: var(--accent);
          box-shadow: 0 0 12px rgba(201, 138, 63, 0.1);
        }
        .device-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .device-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .device-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--biscuit-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .device-card.on .device-icon-box {
          background: var(--biscuit);
        }
        .device-card-body {
          margin-bottom: 12px;
        }
        .device-name {
          font-weight: 700;
          font-size: 13px;
          margin: 0;
        }
        .device-meta {
          font-size: 11px;
          color: var(--brown);
          margin: 2px 0 0;
        }
        .device-power {
          font-size: 11px;
          font-weight: 600;
          color: var(--brown-dark);
          margin-top: 6px;
        }
        
        .switch-toggle {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }
        .switch-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          }
        .slider-round {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border);
          transition: .3s;
          border-radius: 20px;
        }
        .slider-round:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .slider-round {
          background-color: var(--success);
        }
        input:checked + .slider-round:before {
          transform: translateX(16px);
        }
        
        .alerts-feed-panel {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          max-height: 480px;
        }
        .alerts-scroll {
          overflow-y: auto;
          flex: 1;
          margin-top: 10px;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .alert-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--biscuit-light);
          position: relative;
          transition: opacity 0.2s, transform 0.2s;
        }
        .alert-item.critical {
          background: #fdf3f2;
          border-color: #ecc2bd;
        }
        .alert-item.warning {
          background: #fef9e8;
          border-color: #f6e3b5;
        }
        .alert-item-body {
          flex: 1;
          font-size: 12px;
        }
        .alert-item-title {
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alert-time {
          font-size: 10px;
          color: var(--brown);
          font-weight: normal;
        }
        .alert-message {
          margin: 3px 0 0;
          color: var(--brown-dark);
        }
        .alert-dismiss-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--brown);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .alert-dismiss-btn:hover {
          background: rgba(122, 90, 50, 0.1);
        }
      `}</style>

      <div className="live-header">
        <div>
          <h2 className="page-title">📡 Live Home System Status</h2>
          <p className="page-sub" style={{ margin: 0 }}>Real-time smart appliance telemetry and device control</p>
        </div>
        <div className="live-beacon-wrap">
          <span className="live-dot" />
          <span>LIVE MONITORING ACTIVE</span>
        </div>
      </div>

      <DashboardLeadPipelineOverview />
      <UpcomingFollowUps />

      <div className="live-row-top">
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <h4 className="telemetry-title">🌡️ Indoor Temperature</h4>
            <div className="telemetry-value">
              {temp.toFixed(1)} <span className="telemetry-unit">°C</span>
            </div>
            <div className="telemetry-status fluctuating">Ambient Sensor · Active</div>
          </div>
          <div className="telemetry-card">
            <h4 className="telemetry-title">💧 Room Humidity</h4>
            <div className="telemetry-value">
              {humidity} <span className="telemetry-unit">%</span>
            </div>
            <div className="telemetry-status fluctuating">Optimal comfort range</div>
          </div>
          <div className="telemetry-card telemetry-card-full">
            <h4 className="telemetry-title">⚡ Total Power Draw</h4>
            <div className="telemetry-value">
              {totalPower.toLocaleString()} <span className="telemetry-unit">W</span>
            </div>
            <div className="telemetry-status">
              🟢 {activeCount} of {devices.length} smart devices active · Baseline 80W included
            </div>
          </div>
        </div>

        <div className="chart-panel">
          <div className="panel-head" style={{ marginBottom: 4 }}>
            <h3 className="panel-title">⚡ Energy Consumption Graph</h3>
            <span style={{ fontSize: 11, color: "var(--brown)", fontWeight: 600 }}>Updates live every 2s</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 130 }}>
            <svg width="100%" height="130" viewBox="0 0 560 130" preserveAspectRatio="none" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="32.5" x2="560" y2="32.5" stroke="rgba(122, 90, 50, 0.08)" strokeDasharray="3,3" />
              <line x1="0" y1="65" x2="560" y2="65" stroke="rgba(122, 90, 50, 0.08)" strokeDasharray="3,3" />
              <line x1="0" y1="97.5" x2="560" y2="97.5" stroke="rgba(122, 90, 50, 0.08)" strokeDasharray="3,3" />
              {fillD && <path d={fillD} fill="url(#energyGrad)" opacity="0.12" style={{ transition: "d 0.3s ease-out" }} />}
              {pathD && <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "d 0.3s ease-out" }} />}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={idx === points.length - 1 ? "5" : "3.5"}
                  fill={idx === points.length - 1 ? "var(--accent)" : "var(--warm-white)"}
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  style={{ transition: "cx 0.3s ease-out, cy 0.3s ease-out" }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="live-grid-bottom">
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h3 className="panel-title">🔌 Active Devices Control Panel</h3>
            <span style={{ fontSize: 11, color: "var(--brown)" }}>Interactive controls</span>
          </div>
          <div className="devices-grid">
            {devices.map(d => (
              <div key={d.id} className={`device-card ${d.status === "ON" ? "on" : ""}`}>
                <div className="device-card-head">
                  <div className="device-icon-box">{d.icon}</div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={d.status === "ON"}
                      onChange={() => toggleDevice(d.id)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
                <div className="device-card-body">
                  <h4 className="device-name">{d.name}</h4>
                  <p className="device-meta">{d.location}</p>
                  <p className="device-power" style={{ color: d.status === "ON" ? "var(--accent-dark)" : "var(--brown)" }}>
                    {d.status === "ON" ? `Draw: ${d.consumption}W` : "Standby (0W)"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="alerts-feed-panel">
          <div className="panel-head" style={{ marginBottom: 4 }}>
            <h3 className="panel-title">🚨 System Alerts log</h3>
            <button className="btn btn-ghost btn-sm" onClick={triggerMockAlert}>+ Simulate Alert</button>
          </div>
          <div className="alerts-scroll">
            {alerts.map(a => (
              <div key={a.id} className={`alert-item ${a.severity}`}>
                <div style={{ fontSize: 16 }}>
                  {a.severity === "critical" ? "🚨" : a.severity === "warning" ? "⚠️" : "ℹ️"}
                </div>
                <div className="alert-item-body">
                  <div className="alert-item-title">
                    <span>{a.device}</span>
                    <span className="alert-time">{a.time}</span>
                  </div>
                  <p className="alert-message">{a.message}</p>
                </div>
                <button className="alert-dismiss-btn" onClick={() => dismissAlert(a.id)}>✕</button>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="empty" style={{ margin: "auto" }}>No active alerts. All systems nominal.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const { users, products, customers, orders, notifications } = useStore();
  const totalEmp = users.filter((u) => u.role === "employee").length;
  const totalPage = users.filter((u) => u.role === "manager").length;
  const revenue = orders.filter((o) => o.status === "Approved").reduce((s, o) => s + o.total, 0);

  const chartData = useMemo(() => {
    const byStatus = { Pending: 0, Approved: 0, Rejected: 0, Delivered: 0 };
    orders.forEach((o) => { byStatus[o.status]++; });
    return [
      { label: "Pending", value: byStatus.Pending },
      { label: "Approved", value: byStatus.Approved },
      { label: "Rejected", value: byStatus.Rejected },
      { label: "Delivered", value: byStatus.Delivered },
      { label: "Products", value: products.length },
      { label: "Customers", value: customers.length },
    ];
  }, [orders, products, customers]);

  return (
    <>
      <h2 className="page-title">Dashboard Overview</h2>
      <p className="page-sub">Full system snapshot across managers, employees, products & orders.</p>
      <div className="stat-grid">
        <StatCard icon="👥" label="Employees" value={totalEmp} />
        <StatCard icon="👔" label="Managers" value={totalPage} />
        <StatCard icon="🧑‍💼" label="Customers" value={customers.length} />
        <StatCard icon="🧾" label="Orders" value={orders.length} />
        <StatCard icon="📦" label="Products" value={products.length} />
        <StatCard icon="💰" label="Revenue" value={`₹${revenue.toLocaleString()}`} />
      </div>

      <div className="row-2">
        <div className="panel">
          <div className="panel-head"><h3 className="panel-title">Activity Snapshot</h3></div>
          <BarChart data={chartData} />
        </div>
        <div className="panel">
          <div className="panel-head"><h3 className="panel-title">Recent Activities</h3></div>
          <ul className="notif-list">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id}>
                <span className="notif-from">{n.from}</span> — {n.message}
                <span className="notif-date">{n.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function ManagersSection() {
  const { users, setState, uid } = useStore();
  const managers = users.filter((u) => u.role === "manager");
  const [editing, setEditing] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const remove = (id: string) => {
    if (!confirm("Delete this manager?")) return;
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
  };

  return (
    <>
      <h2 className="page-title">Manage Managers</h2>
      <p className="page-sub">Add, edit, or remove managers in the system.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">All Managers ({managers.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Manager</button>
        </div>
        <div className={managers.length > 0 ? "card-grid" : ""}>
          {managers.map((m) => (
            <div key={m.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <h4 className="data-card-title">{m.name}</h4>
                  <span className="data-card-subtitle">{m.email}</span>
                </div>
                <div className="actions-row">
                  <button className="btn btn-circle" onClick={() => setEditing(m)} title="Edit Manager" style={{ width: 32, height: 32, fontSize: 14 }}>✏️</button>
                  <button className="btn btn-circle btn-circle-danger" onClick={() => remove(m.id)} title="Delete Manager" style={{ width: 32, height: 32, fontSize: 14 }}>🗑️</button>
                </div>
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">ID / Username</span><span className="data-value">{m.username}</span></div>
                <div className="data-row"><span className="data-label">Password</span><span className="data-value">{m.password ?? "—"}</span></div>
                <div className="data-row"><span className="data-label">Phone</span><span className="data-value">{m.phone ?? "—"}</span></div>
              </div>
            </div>
          ))}
          {managers.length === 0 && <div className="empty">No managers yet.</div>}
        </div>
      </div>

      {showAdd && (
        <UserForm
          title="Add Manager"
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            const nextId = uid("u");
            setState((s) => ({ ...s, users: [...s.users, { id: nextId, role: "manager", ...data }] }));
            setShowAdd(false);
          }}
        />
      )}
      {editing && (
        <UserForm
          title="Edit Manager"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            setState((s) => ({ ...s, users: s.users.map((u) => u.id === editing.id ? { ...u, ...data } : u) }));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function UserForm({ title, initial, onSave, onClose }: { title: string; initial?: User; onSave: (d: Omit<User, "id" | "role">) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  return (
    <Modal title={title} onClose={onClose}>
      <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">ID / Username</label><input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => name && username && onSave({ name, username, password, email, phone })}>Save</button>
      </div>
    </Modal>
  );
}

export function EmployeeForm({
  title,
  initial,
  onSave,
  onClose
}: {
  title: string;
  initial?: User;
  onSave: (d: Omit<User, "id" | "role">) => void;
  onClose: () => void;
}) {
  const { users } = useStore();
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "Sales Associate");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Verified");
  const [isPasswordEdited, setIsPasswordEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate employeeId (EMP00x) if it is a new employee
  useEffect(() => {
    if (!initial && !employeeId) {
      const employees = users.filter((u) => u.role === "employee");
      let maxNum = 0;
      employees.forEach(e => {
        if (e.employeeId) {
          const match = e.employeeId.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      });
      setEmployeeId(`EMP${String(maxNum + 1).padStart(3, "0")}`);
    }
  }, [users, initial]);

  // Auto-generate password from Name or Email (e.g. first_name + '123')
  useEffect(() => {
    if (initial) return;
    if (isPasswordEdited) return;

    let generatedPass = "";
    if (name.trim()) {
      const firstName = name.trim().split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (firstName) {
        generatedPass = `${firstName}123`;
      }
    } else if (email.trim()) {
      const prefix = email.split("@")[0].toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      if (prefix) {
        generatedPass = `${prefix}123`;
      }
    }
    setPassword(generatedPass);
  }, [name, email, isPasswordEdited, initial]);

  const handleSave = () => {
    if (!name || isSaving) return;
    setIsSaving(true);
    const username = email ? email.toLowerCase().trim() : name.toLowerCase().replace(/\s+/g, "") + "@smarthome.com";
    onSave({
      name,
      username,
      email: email || undefined,
      phone: phone || undefined,
      employeeId: employeeId || undefined,
      jobTitle,
      password: password || undefined,
      address: address || undefined,
      status
    });
  };

  const modalTitle = initial ? "Edit Employee" : "+ Register New Employee";

  return (
    <Modal title={modalTitle} onClose={onClose} className="modal-lg">
      <div className="form-row-2-3" style={{ gridTemplateColumns: "1fr 2.2fr" }}>
        <div className="form-group">
          <label className="form-label">EMPLOYEE ID</label>
          <input
            className="form-input"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="EMP001"
          />
        </div>
        <div className="form-group">
          <label className="form-label">FULL NAME</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">PHONE NUMBER</label>
          <input
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
          />
        </div>
        <div className="form-group">
          <label className="form-label">ROLE</label>
          <select
            className="form-select"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          >
            <option value="Sales Associate">Sales Associate</option>
            <option value="Technician">Technician</option>
            <option value="Support Specialist">Support Specialist</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Delivery Agent">Delivery Agent</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">LOGIN PASSWORD</label>
          <input
            type="text"
            className="form-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setIsPasswordEdited(true);
            }}
            placeholder="Set password"
          />
        </div>
        <div className="form-group">
          <label className="form-label">STATUS</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Verified">Verified</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">ADDRESS</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Residential Address"
        />
      </div>

      <div className="form-group">
        <label className="form-label">EMAIL ADDRESS (OPTIONAL)</label>
        <input
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="modal-actions" style={{ justifyContent: "flex-start", gap: 12 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ background: "linear-gradient(135deg, var(--accent), var(--light-brown))", borderColor: "var(--accent)", color: "#fff", opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? "Saving..." : "💾 Save Employee"}
        </button>
        <button className="btn btn-ghost" onClick={onClose} style={{ background: "var(--biscuit-light)" }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function EmployeeWorkDetailsModal({ employee, onClose }: { employee: User; onClose: () => void }) {
  const { tasks, orders, products } = useStore();
  const empTasks = tasks.filter((t) => t.assignedTo === employee.id);
  const empOrders = orders.filter((o) => o.assignedTo === employee.id);

  const completedTasks = empTasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = empTasks.filter((t) => t.status !== "Completed").length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 850, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 className="modal-title">📊 Work Details: {employee.name}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 15 }}>
            <div style={{ background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div style={{ fontSize: 12, color: "var(--brown)", marginTop: 4 }}>Total Tasks</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--brown-dark)" }}>{empTasks.length}</div>
            </div>
            <div style={{ background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div style={{ fontSize: 12, color: "var(--brown)", marginTop: 4 }}>Completed Tasks</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>{completedTasks}</div>
            </div>
            <div style={{ background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <div style={{ fontSize: 12, color: "var(--brown)", marginTop: 4 }}>Pending Tasks</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{pendingTasks}</div>
            </div>
            <div style={{ background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <span style={{ fontSize: 20 }}>🚚</span>
              <div style={{ fontSize: 12, color: "var(--brown)", marginTop: 4 }}>Assigned Orders</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--brown-dark)" }}>{empOrders.length}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Tasks Panel */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 15 }}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--brown-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                📝 Task List
              </h4>
              <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 5 }}>
                {empTasks.map((t) => (
                  <div key={t.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--warm-white)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <strong style={{ color: "var(--brown-dark)", fontSize: 13 }}>{t.title}</strong>
                      <span className={`pill pill-${t.status === "Completed" ? "completed" : t.status === "In Progress" ? "progress" : "pending"}`} style={{ fontSize: 10 }}>
                        {t.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--light-brown)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> {t.date}
                    </div>
                  </div>
                ))}
                {empTasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--light-brown)", fontSize: 12 }}>
                    No tasks assigned.
                  </div>
                )}
              </div>
            </div>

            {/* Orders Panel */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 15 }}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--brown-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                📦 Assigned Orders
              </h4>
              <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 5 }}>
                {empOrders.map((o) => {
                  const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
                  const brandStr = product?.brand ? ` (${product.brand})` : "";
                  return (
                    <div key={o.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--warm-white)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <strong style={{ color: "var(--brown-dark)", fontSize: 13 }}>{o.id}</strong>
                        <span className={`pill pill-${o.status.toLowerCase()}`} style={{ fontSize: 10 }}>
                          {o.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--brown-dark)", marginBottom: 4 }}>
                        {o.customerName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--light-brown)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Briefcase size={12} /> {o.qty}x {o.productName}{brandStr}
                      </div>
                    </div>
                  );
                })}
                {empOrders.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--light-brown)", fontSize: 12 }}>
                    No orders assigned.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeesSection() {
  const { users, tasks, setState, uid } = useStore();
  const employees = users.filter((u) => u.role === "employee");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [viewingWork, setViewingWork] = useState<User | null>(null);

  const remove = (id: string) => {
    if (!confirm("Delete this employee?")) return;
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
  };

  return (
    <>
      <h2 className="page-title">Employee Details</h2>
      <p className="page-sub">Manage employees and view their workload.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">All Employees ({employees.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Employee</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginTop: 15 }}>
          {employees.map((e) => {
            const list = tasks.filter((t) => t.assignedTo === e.id);
            const comp = list.filter((t) => t.status === "Completed").length;
            const total = list.length;
            const score = total ? Math.round((comp / total) * 100) : 0;

            return (
              <div key={e.id} style={{ background: "var(--warm-white)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 15 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", color: "var(--brown-dark)", fontSize: 16 }}>{e.name}</h4>
                    <span style={{ fontSize: 12, color: "var(--brown)", fontWeight: 500 }}>ID: {e.employeeId ?? "—"}</span>
                  </div>
                  <span className={`pill ${e.status === "Inactive" ? "pill-rejected" : "pill-approved"}`} style={{ fontSize: 10 }}>
                    {e.status ?? "Verified"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: "var(--brown)", fontSize: 11, display: "block" }}>ROLE</span>
                    <strong style={{ color: "var(--brown-dark)" }}>{e.jobTitle ?? "—"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--brown)", fontSize: 11, display: "block" }}>PHONE</span>
                    <strong style={{ color: "var(--brown-dark)" }}>{e.phone ?? "—"}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--brown)", fontSize: 11, display: "block" }}>CREDENTIALS</span>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <code style={{ fontSize: 11, background: "var(--biscuit-light)", padding: "2px 6px", borderRadius: 4, color: "var(--brown-dark)" }}>{e.username ?? "—"}</code>
                      <code style={{ fontSize: 11, background: "var(--biscuit-light)", padding: "2px 6px", borderRadius: 4, color: "var(--brown-dark)" }}>{e.password ?? "—"}</code>
                    </div>
                  </div>
                </div>

                <div style={{ background: "var(--biscuit-light)", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "var(--brown)", fontSize: 11, display: "block" }}>TASKS</span>
                    <strong style={{ color: "var(--brown-dark)", fontSize: 14 }}>{comp} / {total}</strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "var(--brown)", fontSize: 11, display: "block" }}>SCORE</span>
                    <strong style={{ color: "var(--success)", fontSize: 14 }}>{score}%</strong>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "auto" }}>
                  <button className="btn btn-circle" onClick={() => setViewingWork(e)} title="View Work Details" style={{ background: "var(--biscuit-light)", color: "var(--brown-dark)" }}>📊</button>
                  <button className="btn btn-circle" onClick={() => setEditing(e)} title="Edit Employee" style={{ background: "var(--biscuit-light)", color: "var(--accent)" }}>✏️</button>
                  <button className="btn btn-circle btn-circle-danger" onClick={() => remove(e.id)} title="Delete Employee" style={{ background: "#fef2f2", color: "#ef4444" }}>🗑️</button>
                </div>
              </div>
            );
          })}
          {employees.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--light-brown)" }}>
              No employees yet.
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <EmployeeForm
          title="Register New Employee"
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            const nextId = uid("u");
            setState((s) => ({ ...s, users: [...s.users, { id: nextId, role: "employee", ...data }] }));
            setShowAdd(false);
          }}
        />
      )}
      {editing && (
        <EmployeeForm
          title="Edit Employee"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            setState((s) => ({ ...s, users: s.users.map((u) => u.id === editing.id ? { ...u, ...data } : u) }));
            setEditing(null);
          }}
        />
      )}
      {viewingWork && (
        <EmployeeWorkDetailsModal
          employee={viewingWork}
          onClose={() => setViewingWork(null)}
        />
      )}
    </>
  );
}

function ProductsSection() {
  const { products, setState, uid } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  // Calculations for cards
  const locProducts = locationFilter === "All" ? products : products.filter(p => (p.location || "Unassigned") === locationFilter);
  const totalProducts = locProducts.length;
  const lowStockCount = locProducts.filter((p) => (p.qty ?? p.stock ?? 0) < 20).length;
  const highStockCount = locProducts.filter((p) => (p.qty ?? p.stock ?? 0) >= 50).length;

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const oldProductsForIncentive = locProducts.filter(p => p.date && new Date(p.date) < fifteenDaysAgo);
  const totalIncentive = oldProductsForIncentive.reduce((acc, p) => acc + ((p.qty ?? p.stock ?? 0) * (p.incentive || 0)), 0);

  // Gather unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  // Filter products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      let matchStock = true;
      if (stockFilter === "Low") {
        matchStock = (p.qty ?? p.stock ?? 0) < 20;
      } else if (stockFilter === "High") {
        matchStock = (p.qty ?? p.stock ?? 0) >= 50;
      } else if (stockFilter === "Incentive") {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        matchStock = !!p.date && new Date(p.date) < fifteenDaysAgo;
      }
      const matchLoc = locationFilter === "All" || (p.location || "Unassigned") === locationFilter;
      return matchCat && matchStock && matchLoc;
    });
  }, [products, categoryFilter, stockFilter, locationFilter]);

  const remove = (id: string) => {
    if (!confirm("Delete this product?")) return;
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  };

  return (
    <>
      <h2 className="page-title">Product Management</h2>
      <p className="page-sub">Maintain catalog, stock, and status.</p>


      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="📦" label="Total Products" value={totalProducts} onClick={() => setStockFilter("All")} />
        <StatCard icon="⚠️" label="Low Stock (< 20)" value={lowStockCount} onClick={() => setStockFilter("Low")} />
        <StatCard icon="📈" label="High Stock (≥ 50)" value={highStockCount} onClick={() => setStockFilter("High")} />
        <StatCard icon="💰" label="INCENTIVE (> 15 DAYS)" value={oldProductsForIncentive.length} onClick={() => setStockFilter("Incentive")} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">📋 Full Inventory Register</h3>
          <div className="actions-row" style={{ alignItems: "center", gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>QTY</th>
                <th>COST</th>
                <th style={{ whiteSpace: "nowrap" }}>INCENTIVE/UNIT</th>
                <th style={{ whiteSpace: "nowrap" }}>TOTAL VALUE</th>
                <th>SUPPLIER</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const totalValue = (p.qty ?? p.stock ?? 0) * p.cost;
                const formattedDate = p.date ? new Date(p.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                }) : "—";
                return (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} className="product-image-cell" alt={p.name} />
                      ) : (
                        <div className="product-image-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--biscuit-light)", fontSize: 20 }}>📦</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--brown)", marginTop: 2 }}>
                        <span>Brand: {p.brand || "—"}</span>
                        {p.warranty && <span> · Warranty: {p.warranty}</span>}
                      </div>
                    </td>
                    <td>{p.sku}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.category}</div>
                      <div style={{ marginTop: 6 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontWeight: 600,
                            background: "#faf6f0",
                            border: "1px solid #e8e2d9",
                            color: "#735c47",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {p.location === "Shop" ? "🏪 In Stock" : p.location === "Godown 1" ? "🏭 Godown 1" : p.location === "Godown 2" ? "🏭 Godown 2" : p.location === "Display" ? "📺 Display" : "🚫 Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td>{p.qty ?? p.stock}</td>
                    <td>₹{p.cost.toLocaleString()}</td>
                    <td>₹{p.incentive.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{totalValue.toLocaleString()}</td>
                    <td>{p.supplier}</td>
                    <td>{formattedDate}</td>
                    <td><span style={{ fontWeight: 600 }}>{p.status}</span></td>
                    <td className="text-right">
                      <div className="actions-row" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-circle" onClick={() => setEditing(p)} title="Edit Product">✏️</button>
                        <button className="btn btn-circle btn-circle-danger" onClick={() => remove(p.id)} title="Delete Product">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={12} className="empty">No products found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <ProductForm title="Add Product" onClose={() => setShowAdd(false)} onSave={(d) => { const nextId = uid("p"); setState((s) => ({ ...s, products: [...s.products, { id: nextId, ...d }] })); setShowAdd(false); }} />}
      {editing && <ProductForm title="Edit Product" initial={editing} onClose={() => setEditing(null)} onSave={(d) => { setState((s) => ({ ...s, products: s.products.map((p) => p.id === editing.id ? { ...p, ...d } : p) })); setEditing(null); }} />}
    </>
  );
}

const PRODUCT_BRAND_MAP: { keywords: string[]; brands: string[] }[] = [
  {
    keywords: ["refrigerator", "fridge", "freezer"],
    brands: ["Samsung", "LG", "Whirlpool", "Haier", "Godrej", "Panasonic", "Bosch", "Electrolux"]
  },
  {
    keywords: ["washing", "machine", "dryer", "washer"],
    brands: ["Samsung", "LG", "Whirlpool", "Bosch", "IFB", "Haier", "Godrej", "Panasonic"]
  },
  {
    keywords: ["ac", "air conditioner", "aircon", "split ac"],
    brands: ["Voltas", "Daikin", "LG", "Samsung", "Blue Star", "Lloyd", "Panasonic", "Hitachi", "Carrier"]
  },
  {
    keywords: ["microwave", "oven", "microwave oven"],
    brands: ["IFB", "LG", "Samsung", "Bajaj", "Morphy Richards", "Panasonic", "Haier"]
  },
  {
    keywords: ["air purifier"],
    brands: ["Philips", "Dyson", "Coway", "Honeywell", "Sharp", "Xiaomi", "Levoit", "Blueair", "Kent", "Eureka Forbes"]
  },
  {
    keywords: ["water purifier", "purifier", "aquaguard", "pureit", "livpure"],
    brands: ["Kent", "Eureka Forbes", "Pureit", "Livpure", "Blue Star", "AO Smith"]
  },
  {
    keywords: ["kettle", "electric kettle"],
    brands: ["Prestige", "Butterfly", "Pigeon", "Kent", "Bajaj", "Havells", "Morphy Richards", "Philips"]
  },
  {
    keywords: ["mixer", "grinder", "juicer", "blender", "mixer grinder"],
    brands: ["Philips", "Sujata", "Preethi", "Bajaj", "Prestige", "Morphy Richards", "Maharaja Whiteline", "Bosch"]
  },
  {
    keywords: ["vacuum", "cleaner", "vacuum cleaner"],
    brands: ["Dyson", "Eureka Forbes", "Philips", "Kent", "Panasonic", "Karcher", "Black + Decker", "Agaro"]
  },
  {
    keywords: ["fan", "ceiling fan", "table fan"],
    brands: ["Crompton", "Usha", "Orient", "Havells", "Bajaj", "Luminous", "Atomberg"]
  },
  {
    keywords: ["geyser", "heater", "water heater"],
    brands: ["AO Smith", "Racold", "V-Guard", "Havells", "Bajaj", "Venus", "Crompton", "Hindware"]
  },
  {
    keywords: ["bulb", "smart bulb", "led bulb", "lamp"],
    brands: ["Philips Hue", "Wipro", "Syska", "Xiaomi", "Halonix", "TP-Link", "Havells", "Realme"]
  },
  {
    keywords: ["switch", "smart switch"],
    brands: ["Wipro", "Anchor", "Schneider Electric", "Legrand", "Crabtree", "Oakter"]
  },
  {
    keywords: ["door lock", "smart lock", "smart door lock"],
    brands: ["Yale", "Godrej", "Ozone", "Lavna", "Qubo", "Valencia"]
  },
  {
    keywords: ["cctv", "camera", "cctv camera", "ip camera"],
    brands: ["CP Plus", "Hikvision", "Dahua", "Qubo", "Xiaomi", "TP-Link", "Imou", "EZVIZ"]
  },
  {
    keywords: ["tv", "television", "smart tv", "led tv"],
    brands: ["Sony", "LG", "Samsung", "OnePlus", "Xiaomi", "Realme", "TCL", "VU"]
  },
  {
    keywords: ["speaker", "smart speaker", "echo", "alexa", "nest mini"],
    brands: ["Amazon Echo", "Google Nest", "Apple HomePod", "JBL", "Bose", "Sony"]
  },
  {
    keywords: ["doorbell", "video doorbell", "smart doorbell"],
    brands: ["Qubo", "Ring", "Yale", "CP Plus", "Hikvision", "Tapo", "Arlo"]
  },
  {
    keywords: ["sensor", "motion sensor", "motion"],
    brands: ["Philips Hue", "Oakter", "Tapo", "Xiaomi", "Sonoff", "Tuya", "Qubo"]
  },
  {
    keywords: ["plug", "smart plug"],
    brands: ["Wipro", "TP-Link", "Oakter", "Syska", "Realme", "Xiaomi"]
  }
];

function CustomSelect({
  value,
  options,
  onChange,
  onDelete,
  placeholder,
  hasOther = true
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onDelete: (val: string) => void;
  placeholder: string;
  hasOther?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        className="form-input"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--warm-white)" }}
      >
        <span style={{ color: value ? "inherit" : "#aaa" }}>{value || placeholder}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, minWidth: "100%", width: options.length > 6 ? "220%" : "100%", background: "var(--warm-white)", border: "1px solid var(--border)", zIndex: 100, boxShadow: "var(--shadow-md)", borderRadius: 8, marginTop: 6, padding: 6 }}>
          {hasOther && (
            <div
              style={{ padding: "8px 12px", cursor: "pointer", color: "var(--accent-dark)", fontWeight: 600, background: "var(--biscuit-light)", borderRadius: 6, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
              onClick={() => { onChange("Other"); setOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--biscuit)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--biscuit-light)")}
            >
              <span style={{ fontSize: 16 }}>+</span> Other (Type Custom)
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: options.length > 6 ? "1fr 1fr" : "1fr", gap: 4 }}>
            {options.map(opt => (
              <div
                key={opt}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", cursor: "pointer", borderRadius: 6, transition: "background 0.2s" }}
                onClick={() => { onChange(opt); setOpen(false); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ flex: 1, fontWeight: value === opt ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: value === opt ? "var(--accent-dark)" : "var(--brown-dark)" }}>{opt}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(opt); }}
                  style={{ background: "transparent", border: "none", color: "#bbb", cursor: "pointer", padding: "2px 6px", fontSize: 12, flexShrink: 0, borderRadius: 4, transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "#f4d6d2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.background = "transparent"; }}
                  title="Delete Option"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export function ProductForm({ title, initial, onSave, onClose, isIncentiveMode }: { title: string; initial?: Product; onSave: (d: Omit<Product, "id">) => void; onClose: () => void; isIncentiveMode?: boolean }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [warranty, setWarranty] = useState(initial?.warranty ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Electronics");
  const [qty, setQty] = useState(initial?.qty ?? 0);
  const [cost, setCost] = useState(initial?.cost ?? 0);
  const [incentive, setIncentive] = useState(initial?.incentive ?? 0);
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");
  const [location, setLocation] = useState<"Shop" | "Godown 1" | "Godown 2" | "Display">(initial?.location ?? "Shop");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(initial?.status ?? "Verified");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageName, setImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [totalCost, setTotalCost] = useState(initial ? parseFloat((initial.qty * initial.cost).toFixed(2)) : 0);
  const { products, users } = useStore();
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(initial?.assignedEmployeeId ?? "");
  const [incentivePercent, setIncentivePercent] = useState(() => {
    if (initial && initial.cost > 0 && initial.incentive) {
      const pct = Math.round((initial.incentive / initial.cost) * 100);
      return pct.toString();
    }
    return "0";
  });

  const [isCustomBrand, setIsCustomBrand] = useState(() => {
    if (initial?.brand) {
      const initialName = (initial?.name ?? "").toLowerCase();
      const match = PRODUCT_BRAND_MAP.find((item) =>
        item.keywords.some((kw) => initialName.includes(kw))
      );
      if (match) {
        const customBrands = products
          .filter((p) => p.brand && match.keywords.some((kw) => p.name.toLowerCase().includes(kw)))
          .map((p) => p.brand);
        return !match.brands.includes(initial.brand) && !customBrands.includes(initial.brand);
      }
    }
    return false;
  });

  const [localCustomBrands, setLocalCustomBrands] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sham_custom_brands") || "[]"); } catch { return []; }
  });
  const [localCustomCategories, setLocalCustomCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sham_custom_categories") || "[]"); } catch { return []; }
  });
  const [localDeletedBrands, setLocalDeletedBrands] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sham_deleted_brands") || "[]"); } catch { return []; }
  });
  const [localDeletedCategories, setLocalDeletedCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sham_deleted_categories") || "[]"); } catch { return []; }
  });

  const addLocalBrand = (b: string) => {
    if (!b || b === "Other") return;
    setLocalCustomBrands(prev => {
      if (prev.includes(b)) return prev;
      const next = [...prev, b];
      localStorage.setItem("sham_custom_brands", JSON.stringify(next));
      return next;
    });
  };

  const hideBrand = (b: string) => {
    setLocalDeletedBrands(prev => {
      if (prev.includes(b)) return prev;
      const next = [...prev, b];
      localStorage.setItem("sham_deleted_brands", JSON.stringify(next));
      return next;
    });
    setLocalCustomBrands(prev => {
      const next = prev.filter(x => x !== b);
      localStorage.setItem("sham_custom_brands", JSON.stringify(next));
      return next;
    });
  };

  const addLocalCategory = (c: string) => {
    if (!c || c === "Other") return;
    setLocalCustomCategories(prev => {
      if (prev.includes(c)) return prev;
      const next = [...prev, c];
      localStorage.setItem("sham_custom_categories", JSON.stringify(next));
      return next;
    });
  };

  const hideCategory = (c: string) => {
    setLocalDeletedCategories(prev => {
      if (prev.includes(c)) return prev;
      const next = [...prev, c];
      localStorage.setItem("sham_deleted_categories", JSON.stringify(next));
      return next;
    });
    setLocalCustomCategories(prev => {
      const next = prev.filter(x => x !== c);
      localStorage.setItem("sham_custom_categories", JSON.stringify(next));
      return next;
    });
  };

  const lowercaseName = name.toLowerCase().trim();

  const brandOptions = useMemo(() => {
    if (!lowercaseName) return null;
    const match = PRODUCT_BRAND_MAP.find((item) =>
      item.keywords.some((kw) => lowercaseName.includes(kw))
    );
    if (!match) return null;

    const customBrands = products
      .filter((p) => p.brand && match.keywords.some((kw) => p.name.toLowerCase().includes(kw)))
      .map((p) => p.brand as string)
      .filter((b) => b && !match.brands.includes(b));

    const uniqueCustomBrands = Array.from(new Set([...customBrands, ...localCustomBrands]));

    return ([...match.brands, ...uniqueCustomBrands].filter((b): b is string => !!b && !localDeletedBrands.includes(b)));
  }, [lowercaseName, products, localCustomBrands, localDeletedBrands]);

  useEffect(() => {
    setIsCustomBrand(false);
  }, [brandOptions]);

  const defaultCategories = useMemo(() => ["Electronics", "Lighting", "Climate", "Cleaning", "Security", "Hub"], []);
  const [isCustomCategory, setIsCustomCategory] = useState(() => {
    if (initial?.category) {
      const customCategories = products
        .map((p) => p.category)
        .filter((c) => c && !defaultCategories.includes(c));
      return !defaultCategories.includes(initial.category) && !customCategories.includes(initial.category) && !localCustomCategories.includes(initial.category);
    }
    return false;
  });

  const categoryOptions = useMemo(() => {
    const customCategories = products
      .map(p => p.category)
      .filter(c => c && !defaultCategories.includes(c));
    const uniqueCustomCategories = Array.from(new Set([...customCategories, ...localCustomCategories]));
    return [...defaultCategories, ...uniqueCustomCategories].filter(c => !localDeletedCategories.includes(c));
  }, [products, defaultCategories, localCustomCategories, localDeletedCategories]);

  const processFile = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // 1. Immediately set the original image as a fallback and for instant UI feedback
      setImage(base64);

      // 2. Attempt to compress the image asynchronously in the background
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            setImage(compressedBase64);
          }
        } catch (err) {
          console.error("Canvas compression failed, keeping original:", err);
        }
      };
      img.onerror = (err) => {
        console.error("Failed to load image for compression, keeping original:", err);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const save = () => {
    if (!name) return;
    onSave({
      name,
      sku,
      brand,
      warranty,
      category,
      qty,
      stock: qty,
      cost,
      price: cost,
      incentive,
      supplier,
      location: location as any,
      date,
      status,
      image,
      assignedEmployeeId
    });
  };

  const modalTitle = initial ? "Edit Stock Entry" : "+ New Stock Entry";

  return (
    <Modal title={modalTitle} onClose={onClose} className="modal-lg">
      <div className="form-row-2-3" style={{ marginBottom: 10 }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>PRODUCT NAME</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wireless Headset X200"
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>SKU</label>
          <input
            className="form-input"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="WH-X200-BLK"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16, marginBottom: 10 }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>BRAND</label>
          {brandOptions && !isCustomBrand ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <CustomSelect
                value={brandOptions.includes(brand) || (brand && brand !== "Other") ? brand : ""}
                options={brandOptions}
                placeholder="Select Brand"
                onChange={(val) => {
                  if (val === "Other") {
                    setIsCustomBrand(true);
                    setBrand("");
                  } else {
                    setBrand(val);
                  }
                }}
                onDelete={hideBrand}
              />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, width: "100%" }}>
              <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                <input
                  className="form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Type brand name..."
                  style={{ width: "100%" }}
                />
              </div>
              {brandOptions && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { addLocalBrand(brand); setIsCustomBrand(false); }}
                  style={{ padding: "4px 8px", fontSize: 11, background: "#f6ede2", height: "36px", alignSelf: "center", border: "1px solid var(--border)" }}
                  title="Show suggestions list"
                >
                  📋 List
                </button>
              )}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>WARRANTY</label>
          <input
            className="form-input"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            placeholder="e.g. 1 Year, 6 Months"
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>CATEGORY</label>
          {categoryOptions && !isCustomCategory ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <CustomSelect
                value={categoryOptions.includes(category) || (category && category !== "Other") ? category : ""}
                options={categoryOptions}
                placeholder="Select Category"
                onChange={(val) => {
                  if (val === "Other") {
                    setIsCustomCategory(true);
                    setCategory("");
                  } else {
                    setCategory(val);
                  }
                }}
                onDelete={hideCategory}
              />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, width: "100%" }}>
              <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                <input
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Type category name..."
                  style={{ width: "100%" }}
                />
              </div>
              {categoryOptions && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { addLocalCategory(category); setIsCustomCategory(false); }}
                  style={{ padding: "4px 8px", fontSize: 11, background: "#f6ede2", height: "36px", alignSelf: "center", border: "1px solid var(--border)" }}
                  title="Show suggestions list"
                >
                  📋 List
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isIncentiveMode && (
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>UPLOAD PHOTO</label>
          <div
            className={`form-file-input ${isDragging ? "dragging" : ""}`}
            style={{
              border: isDragging ? "2px dashed var(--accent)" : "1px dashed var(--border)",
              background: isDragging ? "var(--biscuit-light)" : "var(--cream)",
              transition: "all 0.25s ease-in-out",
              padding: "8px 14px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              borderRadius: "6px",
              gap: "12px"
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <span style={{ fontSize: 12, color: isDragging ? "var(--accent)" : "var(--brown)", fontWeight: 500, flex: 1, textAlign: "left" }}>
              {isDragging
                ? "Drop photo here..."
                : imageName
                  ? imageName
                  : (initial?.image ? "Change Photo" : "Choose File or Drag & Drop here")}
            </span>
            {image && <img src={image} className="image-preview-thumbnail" style={{ width: 36, height: 36 }} alt="Preview" />}
          </div>
        </div>
      )}

      {isIncentiveMode ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>INCENTIVE (%)</label>
            <select
              className="form-input"
              value={incentivePercent}
              onChange={(e) => {
                const pct = e.target.value;
                setIncentivePercent(pct);
                const pctVal = parseFloat(pct) || 0;
                setIncentive(parseFloat((cost * pctVal / 100).toFixed(2)));
              }}
              style={{ appearance: "auto" }}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="25">25%</option>
              <option value="30">30%</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>ASSIGN EMPLOYEE</label>
            <select
              className="form-input"
              value={assignedEmployeeId}
              onChange={(e) => setAssignedEmployeeId(e.target.value)}
              style={{ appearance: "auto" }}
            >
              <option value="">-- Select Employee --</option>
              <option value="all">All Employees</option>
              {users.filter(u => u.role === "employee").map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1.2fr", gap: 16, marginBottom: 10 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>QUANTITY</label>
              <input
                type="number"
                className="form-input"
                value={qty || ""}
                onChange={(e) => {
                  const val = +e.target.value;
                  setQty(val);
                  setTotalCost(parseFloat((val * cost).toFixed(2)));
                }}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>UNIT COST (₹)</label>
              <input
                type="number"
                className="form-input"
                value={cost || ""}
                onChange={(e) => {
                  const val = +e.target.value;
                  setCost(val);
                  setTotalCost(parseFloat((val * qty).toFixed(2)));
                  const pctVal = parseFloat(incentivePercent) || 0;
                  setIncentive(parseFloat((val * pctVal / 100).toFixed(2)));
                }}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>TOTAL COST (₹)</label>
              <input
                type="number"
                className="form-input"
                value={totalCost || ""}
                onChange={(e) => {
                  const val = +e.target.value;
                  setTotalCost(val);
                  const calculatedCost = qty > 0 ? parseFloat((val / qty).toFixed(2)) : 0;
                  setCost(calculatedCost);
                  const pctVal = parseFloat(incentivePercent) || 0;
                  setIncentive(parseFloat((calculatedCost * pctVal / 100).toFixed(2)));
                }}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>INCENTIVE (%)</label>
              <select
                className="form-input"
                value={incentivePercent}
                onChange={(e) => {
                  const pct = e.target.value;
                  setIncentivePercent(pct);
                  const pctVal = parseFloat(pct) || 0;
                  setIncentive(parseFloat((cost * pctVal / 100).toFixed(2)));
                }}
                style={{ appearance: "auto" }}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
                <option value="25">25%</option>
                <option value="30">30%</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>LOCATION</label>
              <select
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                style={{ appearance: "auto" }}
              >
                <option value="Shop">In Stock</option>
                <option value="Godown 1">Godown 1</option>
                <option value="Godown 2">Godown 2</option>
                <option value="Display">Display</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>SUPPLIER</label>
              <input
                className="form-input"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier Name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>STOCK DATE</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <div className="modal-actions" style={{ justifyContent: "flex-start", gap: 12, marginTop: 10 }}>
        <button className="btn btn-primary" onClick={save} style={{ background: "linear-gradient(135deg, var(--accent), var(--light-brown))", borderColor: "var(--accent)", color: "#fff" }}>
          💾 Save Entry
        </button>
        <button className="btn btn-ghost" onClick={onClose} style={{ background: "var(--biscuit-light)" }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function CustomersSection() {
  const { customers, orders } = useStore();
  return (
    <>
      <h2 className="page-title">Customers</h2>
      <p className="page-sub">All customers and their order history.</p>
      <div className="panel">
        <div className="panel-head"><h3 className="panel-title">All Customers</h3></div>
        <div className={customers.length > 0 ? "card-grid" : ""}>
          {customers.map((c) => (
            <div key={c.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <h4 className="data-card-title">{c.name}</h4>
                  <span className="data-card-subtitle">{c.email}</span>
                </div>
                <div><Pill status={c.status} /></div>
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">Phone</span><span className="data-value">{c.phone}</span></div>
                <div className="data-row"><span className="data-label">Address</span><span className="data-value" style={{ textAlign: "right", maxWidth: "60%" }}>{c.address}</span></div>
                <div className="data-row"><span className="data-label">Orders</span><span className="data-value">{orders.filter((o) => o.customerId === c.id).length}</span></div>
              </div>
            </div>
          ))}
          {customers.length === 0 && <div className="empty">No customers yet.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3 className="panel-title">All Orders</h3></div>
        <OrdersTable />
      </div>
    </>
  );
}

export function OrdersTable() {
  const { orders, products } = useStore();
  return (
    <div className={orders.length > 0 ? "card-grid" : ""}>
      {orders.map((o) => {
        const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
        const brandStr = product?.brand ? ` (${product.brand})` : "";
        return (
          <div key={o.id} className="data-card">
            <div className="data-card-header">
              <div>
                <h4 className="data-card-title">Order #{o.id}</h4>
                <span className="data-card-subtitle">{o.date}</span>
              </div>
              <div><Pill status={o.status} /></div>
            </div>
            <div className="data-card-body">
              <div className="data-row"><span className="data-label">Customer</span><span className="data-value">{o.customerName}</span></div>
              <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
              <div className="data-row"><span className="data-label">Assigned</span><span className="data-value">{o.assignedToName ?? "—"}</span></div>
            </div>
            <div className="data-card-footer" style={{ justifyContent: "space-between" }}>
              <span className="data-label" style={{ alignSelf: "center" }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>₹{o.total.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
      {orders.length === 0 && <div className="empty">No orders yet.</div>}
    </div>
  );
}

function OrderApprovalSection() {
  const { orders, products, setState, uid } = useStore();
  const [filter, setFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const [editDiscounts, setEditDiscounts] = useState<Record<string, number>>({});

  const decide = (id: string, status: "Approved" | "Rejected", newDiscountPct?: number) => {
    const notifId2 = uid("n");
    setState((s) => {
      const order = s.orders.find((o) => o.id === id);
      let updatedProducts = s.products;
      if (order && status === "Approved") {
        updatedProducts = s.products.map((p) => {
          if (p.id === order.productId || p.name.toLowerCase() === order.productName.toLowerCase()) {
            const newQty = Math.max(0, (p.qty ?? p.stock ?? 0) - order.qty);
            const newStock = Math.max(0, (p.stock ?? p.qty ?? 0) - order.qty);
            return { ...p, qty: newQty, stock: newStock };
          }
          return p;
        });
      }
      const orderDetailsStr = order
        ? `Order #${id} for ${order.customerName} (${order.qty}x ${order.productName}) has been ${status.toLowerCase()}`
        : `Order #${id} has been ${status.toLowerCase()}`;
      const updatedNotifications = s.notifications.map((n) => {
        if (n.to === "superadmin" && n.message.toLowerCase().includes("pending")) {
          if (order && n.message.toLowerCase().includes(order.customerName.toLowerCase())) {
            return { ...n, read: true };
          }
          if (n.message.toLowerCase().includes("pending for approval")) {
            const otherPendingOrders = s.orders.filter(o => o.id !== id && o.status === "Pending");
            if (otherPendingOrders.length === 0) {
              return { ...n, read: true };
            }
          }
        }
        return n;
      });

      return {
        ...s,
        products: updatedProducts,
        orders: s.orders.map((o) => {
          if (o.id === id) {
            let finalTotal = o.total;
            let finalDiscount = o.discount;
            if (status === "Approved" && newDiscountPct !== undefined) {
              const product = s.products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
              const basePrice = product ? product.price : Math.round(o.total / (1 - ((o.discount || 0) / 100)));
              finalDiscount = newDiscountPct;
              finalTotal = Math.max(0, (basePrice * o.qty) - Math.round((newDiscountPct / 100) * (basePrice * o.qty)));
            }
            return { ...o, status, discount: finalDiscount, total: finalTotal };
          }
          return o;
        }),
        notifications: [
          { id: notifId2, to: "employee", from: "Super Admin", message: orderDetailsStr, date: new Date().toISOString().slice(0, 10), read: false },
          ...updatedNotifications,
        ],
      };
    });
  };

  return (
    <>
      <h2 className="page-title">Order Approvals</h2>
      <p className="page-sub">Approve or reject orders created by managers.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Orders ({list.length})</h3>
          <select className="form-select" style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className={list.length > 0 ? "card-grid" : ""}>
          {list.map((o) => {
            const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
            const brandStr = product?.brand ? ` (${product.brand})` : "";
            const orderBasePrice = Math.round(o.total / (1 - ((o.discount || 0) / 100)));
            const currentDiscount = editDiscounts[o.id] !== undefined ? editDiscounts[o.id] : (o.discount || 0);
            const calculatedTotal = o.status === "Pending" ? Math.max(0, orderBasePrice - Math.round((currentDiscount / 100) * orderBasePrice)) : o.total;

            const isIncentiveOrder = product && (product.incentive ?? 0) > 0;

            return (
              <div key={o.id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span>By: {o.createdBy}</span>
                      {isIncentiveOrder ? (
                        <span className="pill" style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fde047", fontSize: "10px", padding: "2px 6px" }}>
                          ✨ Incentive
                        </span>
                      ) : (
                        <span className="pill" style={{ background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", fontSize: "10px", padding: "2px 6px" }}>
                          Regular
                        </span>
                      )}
                    </span>
                  </div>
                  <div><Pill status={o.status} /></div>
                </div>
                <div className="data-card-body">
                  <div className="data-row"><span className="data-label">Customer</span><span className="data-value">{o.customerName}</span></div>
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Unit Price</span><span className="data-value">₹{Math.round(orderBasePrice / o.qty).toLocaleString()}</span></div>
                  <div className="data-row"><span className="data-label">Base Price</span><span className="data-value">₹{orderBasePrice.toLocaleString()}</span></div>
                  <div className="data-row"><span className="data-label">Assigned</span><span className="data-value">{o.assignedToName ?? "—"}</span></div>
                </div>
                <div className="data-card-footer" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {o.status === "Pending" ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--biscuit-light)", padding: "8px 12px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brown-dark)" }}>DISCOUNT (%)</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: "80px", height: "30px", textAlign: "right" }}
                        value={currentDiscount}
                        onChange={(e) => setEditDiscounts({ ...editDiscounts, [o.id]: Number(e.target.value) })}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        min={0}
                        max={100}
                      />
                    </div>
                  ) : (
                    o.discount && o.discount > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--brown)" }}>
                        <span>Discount Applied:</span>
                        <span style={{ fontWeight: 600 }}>{o.discount}%</span>
                      </div>
                    ) : null
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>
                        ₹{calculatedTotal.toLocaleString()}
                      </span>
                      {o.status === "Pending" && currentDiscount > 0 && (
                        <span style={{ fontSize: "10px", color: "var(--brown)" }}>Includes discount</span>
                      )}
                    </div>
                    {o.status === "Pending" ? (
                      <div className="actions-row">
                        <button className="btn btn-success btn-sm" onClick={() => decide(o.id, "Approved", editDiscounts[o.id])}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => decide(o.id, "Rejected")}>Reject</button>
                      </div>
                    ) : <span style={{ color: "var(--brown)", fontSize: 12 }}>—</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <div className="empty">No orders.</div>}
        </div>
      </div>
    </>
  );
}

export function NotificationsSection({ role }: { role: "superadmin" | "manager" | "employee" }) {
  const { notifications, setState, orders, users, tasks, uid } = useStore();
  const navigate = useNavigate();

  const seen = new Set<string>();
  const list = notifications.filter((n) => {
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

  // Mark all visible notifications of the role as read on unmount
  useEffect(() => {
    return () => {
      setState((s) => {
        const visibleUnreadIds = s.notifications
          .filter((n) => (n.to === role || n.to === "all") && !n.read)
          .map((n) => n.id);

        if (visibleUnreadIds.length > 0) {
          return {
            ...s,
            notifications: s.notifications.map((n) =>
              visibleUnreadIds.includes(n.id) ? { ...n, read: true } : n
            ),
          };
        }
        return s;
      });
    };
  }, [role, setState]);

  const unreadCount = list.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const unreadIds = list.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          unreadIds.includes(n.id) ? { ...n, read: true } : n
        ),
      }));
    }
  };

  const markAsRead = (id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };


  const getEnrichedMessage = (message: string) => {
    // Matches "Order #o2 approved" or "Order otcw9gf approved" or similar status transitions
    const match = message.match(/order\s*#?([a-z0-9]+)\s+(approved|rejected|delivered|pending)/i);
    if (match) {
      const orderId = match[1];
      const action = match[2].toLowerCase();

      const order = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
      if (order) {
        return `Order #${order.id} for ${order.customerName} (${order.qty}x ${order.productName}) has been ${action}`;
      }
    }
    return message;
  };

  const parseNotification = (n: { from: string; message: string }) => {
    let title = "System Update";
    let icon = "🔔";
    let color = "var(--info)";

    const msg = n.message.toLowerCase();

    if (msg.includes("approved")) {
      title = "Order Approved";
      icon = "✅";
      color = "var(--success)";
    } else if (msg.includes("delivered")) {
      title = "Order Delivered";
      icon = "🚚";
      color = "#3b82f6";
    } else if (msg.includes("pending") || msg.includes("created")) {
      title = "New Order Pending";
      icon = "⏳";
      color = "var(--accent)";
    } else if (msg.includes("rejected")) {
      title = "Order Rejected";
      icon = "❌";
      color = "var(--danger)";
    } else if (msg.includes("task")) {
      title = "Task Assignment";
      icon = "📝";
      color = "var(--accent)";
    }

    return { title, icon, color };
  };

  return (
    <>
      <h2 className="page-title">Notifications</h2>
      <p className="page-sub">Inbox of system events.</p>
      <div className="panel">
        <div className="panel-head" style={{ marginBottom: 18 }}>
          <h3 className="panel-title">Inbox ({list.length})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--success)", borderColor: "var(--success)" }}
                onClick={markAllAsRead}
              >
                ✓ Mark all as read
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "#c0473b" }}
              onClick={() => {
                if (confirm("Delete all notifications?")) {
                  setState((s) => ({
                    ...s,
                    notifications: s.notifications.filter((n) => n.to !== role && n.to !== "all"),
                  }));
                }
              }}
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <ul className="notif-list" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0 }}>
            {list.map((n) => {
              const { title, icon, color } = parseNotification(n);

              // Find assigned employee
              let assignedEmployee: User | undefined = undefined;
              let order: Order | undefined = undefined;
              let empTasks = 0;
              let empCompleted = 0;
              let empScore = 0;

              const match = n.message.match(/order\s*#?([a-z0-9]+)/i);
              if (match) {
                const orderId = match[1];
                const foundOrder = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
                if (foundOrder && foundOrder.assignedTo) {
                  order = foundOrder;
                  assignedEmployee = users.find(u => u.id === foundOrder.assignedTo);
                  if (assignedEmployee) {
                    const empId = assignedEmployee.id;
                    const uTasks = tasks.filter(t => t.assignedTo === empId);
                    empTasks = uTasks.length;
                    empCompleted = uTasks.filter(t => t.status === "Completed").length;
                    empScore = empTasks > 0 ? Math.round((empCompleted / empTasks) * 100) : 0;
                  }
                }
              }

              return (
                <li
                  key={n.id}
                  className={`notif-card ${n.read ? "read" : "unread"}`}
                  style={{
                    borderLeft: `5px solid ${color}`
                  }}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  title={!n.read ? "Click to mark as read" : ""}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: `${color}15`,
                      color: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--brown-dark)" }}>{title}</span>
                        {!n.read && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "white",
                              background: color,
                              padding: "2px 6px",
                              borderRadius: 4,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              boxShadow: `0 2px 4px ${color}40`
                            }}>
                              New
                            </span>
                            <span className="notif-unread-dot" style={{ backgroundColor: color }} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 3, color: "var(--brown)" }}>{getEnrichedMessage(n.message)}</div>

                      {role === "manager" && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }} onClick={(e) => e.stopPropagation()}>
                          {assignedEmployee && (
                            <div style={{
                              padding: "6px 10px",
                              background: "rgba(122, 90, 50, 0.05)",
                              borderRadius: 8,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap",
                              border: "1px solid rgba(122, 90, 50, 0.1)"
                            }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--brown)" }}>
                                Assigned to: <strong style={{ color: "var(--brown-dark)" }}>{assignedEmployee.name}</strong>
                              </span>

                              {order && !order.sentToEmployee ? (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: 11,
                                    background: "var(--success)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    boxShadow: "var(--shadow-sm)"
                                  }}
                                  onClick={() => {
                                    const currentOrder = order!;
                                    setState((s) => ({
                                      ...s,
                                      orders: s.orders.map((o) => o.id === currentOrder.id ? { ...o, sentToEmployee: true } : o),
                                      notifications: [
                                        {
                                          id: uid("n"),
                                          to: "employee",
                                          from: "Manager",
                                          message: `New approved order #${currentOrder.id} sent to your updates`,
                                          date: new Date().toISOString().slice(0, 10),
                                          read: false
                                        },
                                        ...s.notifications
                                      ]
                                    }));
                                  }}
                                >
                                  ✉️ Send to Employee
                                </button>
                              ) : (
                                <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Sent to Employee Updates</span>
                              )}
                            </div>
                          )}

                          <div style={{ background: "var(--biscuit-light)", borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between", maxWidth: "250px" }}>
                            <div>
                              <div style={{ color: "var(--brown)", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>TASKS</div>
                              <div style={{ color: "var(--brown-dark)", fontSize: "16px", fontWeight: 800 }}>{empCompleted} / {empTasks}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: "var(--brown)", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>SCORE</div>
                              <div style={{ color: "var(--success, #059669)", fontSize: "16px", fontWeight: 800 }}>{empScore}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "var(--light-brown)" }}>
                        <span>👤 {n.from}</span>
                        <span>📅 {n.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-circle btn-circle-danger"
                      style={{
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setState((s) => ({ ...s, notifications: s.notifications.filter((notif) => notif.id !== n.id) }));
                      }}
                      title="Delete Notification"
                    >
                      🗑️
                    </button>
                  </div>

                </li>
              );
            })}
            {list.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--brown)",
                background: "var(--warm-white)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                borderStyle: "dashed"
              }}>
                <span style={{ fontSize: 32 }}>🔔</span>
                <p style={{ marginTop: 8, fontSize: 14, fontWeight: 500 }}>All caught up! No new notifications.</p>
              </div>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export function ProfileSection() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  const initials = currentUser.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const [showPassword, setShowPassword] = useState(false);

  // Custom badges and descriptions based on user role
  const roleConfig = {
    superadmin: {
      badgeClass: "badge-superadmin",
      label: "Super Admin",
      desc: "Full system administration and control",
      icon: "👑"
    },
    manager: {
      badgeClass: "badge-manager",
      label: "Store Manager",
      desc: "Manage inventory, users, and orders",
      icon: "💼"
    },
    employee: {
      badgeClass: "badge-employee",
      label: "Employee",
      desc: "Handle daily tasks, operations, and sales",
      icon: "👥"
    }
  };

  const config = roleConfig[currentUser.role] || roleConfig.employee;

  return (
    <div className="profile-container animated fadeIn">
      <h2 className="page-title">Profile</h2>
      <p className="page-sub">Account information and specifications.</p>

      <div className="profile-premium-card">
        {/* Banner Area containing Avatar & Name inside the brown banner! */}
        <div className="profile-banner">
          <div className="profile-banner-pattern" />

          <div className="profile-header-wrap">
            <div className="profile-avatar-large">
              {initials}
            </div>
            <div className="profile-title-area">
              <h3 className="profile-name">{currentUser.name}</h3>
              <span className={`profile-role-badge ${config.badgeClass}`}>
                {config.icon} {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Body */}
        <div className="profile-body-content">
          <h4 className="profile-section-title">📌 Personal Specifications</h4>

          <div className="profile-info-grid">
            <div className="profile-info-card">
              <div className="profile-info-icon">📧</div>
              <div className="profile-info-details">
                <div className="profile-info-label">Email Address</div>
                <div className="profile-info-value">{currentUser.email ?? "—"}</div>
              </div>
            </div>

            <div className="profile-info-card">
              <div className="profile-info-icon">📞</div>
              <div className="profile-info-details">
                <div className="profile-info-label">Phone Number</div>
                <div className="profile-info-value">{currentUser.phone ?? "—"}</div>
              </div>
            </div>

            <div className="profile-info-card">
              <div className="profile-info-icon">👤</div>
              <div className="profile-info-details">
                <div className="profile-info-label">Username</div>
                <div className="profile-info-value">{currentUser.username}</div>
              </div>
            </div>

            <div className="profile-info-card">
              <div className="profile-info-icon">🆔</div>
              <div className="profile-info-details">
                <div className="profile-info-label">User / Employee ID</div>
                <div className="profile-info-value">{currentUser.employeeId ?? currentUser.id}</div>
              </div>
            </div>

            {currentUser.password && (
              <div className="profile-info-card">
                <div className="profile-info-icon">🔑</div>
                <div className="profile-info-details">
                  <div className="profile-info-label">Login Password</div>
                  <div className="profile-info-value" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontFamily: showPassword ? "monospace" : "inherit", letterSpacing: showPassword ? "0.5px" : "normal", fontWeight: 600 }}>
                      {showPassword ? currentUser.password : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.8, display: "inline-flex", alignSelf: "center" }}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentUser.jobTitle && (
              <div className="profile-info-card">
                <div className="profile-info-icon">💼</div>
                <div className="profile-info-details">
                  <div className="profile-info-label">Job Designation</div>
                  <div className="profile-info-value">{currentUser.jobTitle}</div>
                </div>
              </div>
            )}

            {currentUser.address && (
              <div className="profile-info-card">
                <div className="profile-info-icon">📍</div>
                <div className="profile-info-details">
                  <div className="profile-info-label">Residential Address</div>
                  <div className="profile-info-value">{currentUser.address}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--brown)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#4f8a55" }} />
              Active System Session
            </span>
            <span style={{ fontSize: 12, color: "var(--brown)" }}>
              Access Level: <strong>{currentUser.role.toUpperCase()}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpcomingFollowUps() {
  const { leads, currentUser, setState, users } = useStore();
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (!currentUser) return;
    const path = currentUser.role === "superadmin" ? "/super-admin" : `/${currentUser.role}`;
    navigate({ to: path, search: { tab: "leads" } });
  };

  const handleClearReminder = (leadId: string) => {
    if (!confirm("Are you sure you want to remove this follow-up reminder?")) return;
    setState(s => ({
      ...s,
      leads: s.leads.map(lead => lead.id === leadId ? { ...lead, followUpDate: undefined } : lead)
    }));
  };

  const getRelativeDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "In 1 days";
    if (diffDays > 1) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const formatFollowUpDate = (dStr: string) => {
    try {
      const date = new Date(dStr);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dStr;
    }
  };

  const getStatusColor = (status: Lead["status"]) => {
    const colors: Record<Lead["status"], string> = {
      New: "#3b82f6",
      Cold: "#6b7280",
      Warm: "#d97706",
      Hot: "#ef4444",
      Enrolled: "#10b981",
      Cancelled: "#db2777"
    };
    return colors[status] || "#3b82f6";
  };

  const upcoming = leads.filter(l => l.followUpDate && new Date(l.followUpDate) >= new Date(new Date().setHours(0, 0, 0, 0)));
  upcoming.sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime());

  return (
    <div className="panel" style={{ padding: "24px", background: "#fffdf7", borderColor: "#f2e6d0" }}>
      <div className="panel-head" style={{ marginBottom: upcoming.length ? "16px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px", color: "#d97706" }}>🔔</span>
          <h3 className="panel-title" style={{ fontSize: "22px", color: "#5c4115", fontWeight: 700 }}>Upcoming Follow-ups</h3>
        </div>
        {currentUser?.role !== "superadmin" && (
          <button className="btn btn-ghost" style={{ color: "#8a6632", fontWeight: 600, border: "1px solid #e1ceab" }} onClick={handleViewAll}>View All Inquiries</button>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "24px",
          color: "#8a6632",
          fontSize: "14px"
        }}>
          No upcoming follow-ups scheduled.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
          {upcoming.map(l => {
            const assignedUser = users.find(u => u.id === l.assignedTo);
            const assignedName = assignedUser ? assignedUser.name : "Unassigned";
            return (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "16px 20px",
                  background: "#fff",
                  border: "1px solid #f2e6d0",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(122, 90, 50, 0.01)"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: getStatusColor(l.status),
                        marginRight: "10px",
                        display: "inline-block"
                      }}
                    />
                    <strong style={{ fontSize: "15px", fontWeight: 700, color: "#5c4115" }}>{l.name}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "99px"
                      }}
                    >
                      {getRelativeDays(l.followUpDate!)}
                    </span>
                    <button
                      onClick={() => handleClearReminder(l.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#991b1b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                        borderRadius: "6px"
                      }}
                      title="Clear Reminder"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#8a6632" }}>
                    <Briefcase size={14} style={{ color: "#a8a29e" }} />
                    <span>{l.product || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#8a6632" }}>
                    <Calendar size={14} style={{ color: "#a8a29e" }} />
                    <span>{formatFollowUpDate(l.followUpDate!)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#8a6632" }}>
                    <Phone size={14} style={{ color: "#a8a29e" }} />
                    <span>{l.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#8a6632" }}>
                    <UserIcon size={14} style={{ color: "#a8a29e" }} />
                    <span>Employee: <strong style={{ color: "#5c4115" }}>{assignedName}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export function TasksAssignSection({ readOnly = false }: { readOnly?: boolean } = {}) {
  const { currentUser, users, tasks, setState, uid } = useStore();
  const managers = users.filter(u => u.role === "manager");
  const employees = users.filter(u => u.role === "employee");

  const isManager = currentUser?.role === "manager";

  const [editingManager, setEditingManager] = useState<User | null>(null);
  const [showAddManager, setShowAddManager] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const removeUser = (id: string, role: string) => {
    if (!confirm(`Delete this ${role}?`)) return;
    setState((s: any) => ({ ...s, users: s.users.filter((u: User) => u.id !== id) }));
  };

  const [activeTab, setActiveTab] = useState<"employee" | "manager">("employee");

  return (
    <>
      <h2 className="page-title">{isManager ? "Manage Employees" : "Add Employee / manager"}</h2>
      <p className="page-sub">{isManager ? "Manage your team — add, edit, or remove employees." : "Manage your team — add, edit, or remove managers and employees."}</p>

      {/* ── Tab Buttons ── */}
      {!isManager && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab("employee")} style={{
            padding: "6px 16px", border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            borderRadius: "20px",
            borderColor: activeTab === "employee" ? "#fcd34d" : "#e2dcd5",
            background: activeTab === "employee" ? "#fef3c7" : "#faf8f5",
            color: activeTab === "employee" ? "#92400e" : "#a18265",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👤 Employees</span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              fontSize: "11px",
              background: activeTab === "employee" ? "#92400e" : "#e2dcd5",
              color: activeTab === "employee" ? "#fff" : "#7c6249",
              fontWeight: 800,
            }}>{employees.length}</span>
          </button>
          <button onClick={() => setActiveTab("manager")} style={{
            padding: "6px 16px", border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            borderRadius: "20px",
            borderColor: activeTab === "manager" ? "#fcd34d" : "#e2dcd5",
            background: activeTab === "manager" ? "#fef3c7" : "#faf8f5",
            color: activeTab === "manager" ? "#92400e" : "#a18265",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👔 Managers</span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              fontSize: "11px",
              background: activeTab === "manager" ? "#92400e" : "#e2dcd5",
              color: activeTab === "manager" ? "#fff" : "#7c6249",
              fontWeight: 800,
            }}>{managers.length}</span>
          </button>
        </div>
      )}

      {/* ── Employee Tab Content ── */}
      {activeTab === "employee" && (
        <div style={{
          background: "#fffdf9",
          borderRadius: "16px", padding: "20px", border: "1px solid #f0e6d6",
          boxShadow: "0 4px 20px rgba(139, 92, 26, 0.02)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#78350f", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>👤 All Employees</span>
            </h3>
            {!readOnly && (
              <button onClick={() => setShowAddEmployee(true)} style={{
                padding: "8px 16px", borderRadius: "20px", border: "none",
                background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff",
                cursor: "pointer", fontSize: "12px", fontWeight: 600,
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)",
                transition: "transform 0.2s ease",
              }}>+ Add Employee</button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))", gap: "16px" }}>
            {employees.map(e => (
              <UnifiedEmployeeCard
                key={e.id}
                employee={e}
                userTasks={tasks.filter(t => t.assignedTo === e.id)}
                actions={!readOnly ? (
                  <>
                    <button onClick={() => setEditingEmployee(e)} title="Edit" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #f5e3cc",
                      background: "#fdf8f2", color: "#b45309", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 0.2s"
                    }}>✏️</button>
                    <button onClick={() => removeUser(e.id, "employee")} title="Delete" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #fee2e2",
                      background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : undefined}
              />
            ))}
            {employees.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#c4956a", padding: "20px 0", fontSize: "12px" }}>No employees yet. Click + Add Employee to create one.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Manager Tab Content ── */}
      {activeTab === "manager" && (
        <div style={{
          background: "#fffdf9",
          borderRadius: "16px", padding: "20px", border: "1px solid #f0e6d6",
          boxShadow: "0 4px 20px rgba(139, 92, 26, 0.02)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#78350f", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>👔 All Managers</span>
            </h3>
            {!readOnly && (
              <button onClick={() => setShowAddManager(true)} style={{
                padding: "8px 16px", borderRadius: "20px", border: "none",
                background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff",
                cursor: "pointer", fontSize: "12px", fontWeight: 600,
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)",
                transition: "transform 0.2s ease",
              }}>+ Add Manager</button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))", gap: "16px" }}>
            {managers.map(m => (
              <UnifiedEmployeeCard
                key={m.id}
                employee={m}
                actions={!readOnly ? (
                  <>
                    <button onClick={() => setEditingManager(m)} title="Edit" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #f5e3cc",
                      background: "#fdf8f2", color: "#b45309", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 0.2s"
                    }}>✏️</button>
                    <button onClick={() => removeUser(m.id, "manager")} title="Delete" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #fee2e2",
                      background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : undefined}
              />
            ))}
            {managers.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#c4956a", padding: "20px 0", fontSize: "12px" }}>No managers yet. Click + Add Manager to create one.</div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Manager */}
      {showAddManager && (
        <UserForm title="Add Manager" onClose={() => setShowAddManager(false)}
          onSave={(data) => { setState((s: any) => ({ ...s, users: [...s.users, { id: uid("u"), role: "manager", ...data }] })); setShowAddManager(false); }} />
      )}
      {editingManager && (
        <UserForm title="Edit Manager" initial={editingManager} onClose={() => setEditingManager(null)}
          onSave={(data) => { setState((s: any) => ({ ...s, users: s.users.map((u: User) => u.id === editingManager.id ? { ...u, ...data } : u) })); setEditingManager(null); }} />
      )}

      {/* Add/Edit Employee */}
      {showAddEmployee && (
        <EmployeeForm title="Add Employee" onClose={() => setShowAddEmployee(false)}
          onSave={(data) => { setState((s: any) => ({ ...s, users: [...s.users, { id: uid("u"), role: "employee", ...data }] })); setShowAddEmployee(false); }} />
      )}
      {editingEmployee && (
        <EmployeeForm title="Edit Employee" initial={editingEmployee} onClose={() => setEditingEmployee(null)}
          onSave={(data) => { setState((s: any) => ({ ...s, users: s.users.map((u: User) => u.id === editingEmployee.id ? { ...u, ...data } : u) })); setEditingEmployee(null); }} />
      )}
    </>
  );
}

export function TaskAssignmentSection() {
  const { users, tasks, setState, uid, currentUser } = useStore();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTaskSave = (taskId: string, newTitle: string, newAssigneeId: string) => {
    const assignee = users.find(u => u.id === newAssigneeId);
    if (!assignee) return;

    setState((s: any) => ({
      ...s,
      tasks: s.tasks.map((t: any) => t.id === taskId ? { ...t, title: newTitle, assignedTo: newAssigneeId, assignedToName: assignee.name } : t)
    }));
    setEditingTask(null);
  };

  const isSuperAdmin = currentUser?.role === "superadmin";

  const managers = users.filter(u => u.role === "manager");
  const employees = users.filter(u => u.role === "employee");

  // Only show employees/managers who currently have at least one task assigned
  const employeesWithTasks = employees.filter(e => tasks.some(t => t.assignedTo === e.id));
  const managersWithTasks = managers.filter(m => tasks.some(t => t.assignedTo === m.id));

  const [activeTab, setActiveTab] = useState<"employee" | "manager">("employee");

  const eligibleAssignees = useMemo(() => {
    if (isSuperAdmin) {
      return users.filter(u => u.role === "employee" || u.role === "manager");
    } else {
      return users.filter(u => u.role === "employee");
    }
  }, [users, isSuperAdmin]);

  const handleAssignTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("taskTitle") as string;
    const assigneeId = formData.get("assigneeId") as string;

    if (!title.trim() || !assigneeId) return;

    const assignee = users.find(u => u.id === assigneeId);
    if (!assignee) return;

    const taskId = uid("t");
    const notifId = uid("n");
    const today = new Date().toISOString().slice(0, 10);

    setState((s: any) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          id: taskId,
          title: title.trim(),
          assignedTo: assigneeId,
          assignedToName: assignee.name,
          status: "Pending",
          date: today,
        }
      ],
      notifications: [
        {
          id: notifId,
          to: assignee.role,
          from: isSuperAdmin ? "Super Admin" : "Manager",
          message: `New task assigned: ${title.trim()}`,
          date: today,
          read: false,
        },
        ...s.notifications,
      ]
    }));

    setShowAssignModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setState((s: any) => ({
      ...s,
      tasks: s.tasks.filter((t: any) => t.id !== taskId)
    }));
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>Task Assign</h2>
          <p className="page-sub" style={{ margin: "4px 0 0 0" }}>View members with assigned tasks and track progress.</p>
        </div>
        <button onClick={() => setShowAssignModal(true)} style={{
          padding: "8px 18px", borderRadius: "20px", border: "none",
          background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff",
          cursor: "pointer", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)",
        }}>+ Assign Task</button>
      </div>

      {/* ── Tab Buttons (Show only if Admin) ── */}
      {isSuperAdmin ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab("employee")} style={{
            padding: "6px 16px", border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            borderRadius: "20px",
            borderColor: activeTab === "employee" ? "#fcd34d" : "#e2dcd5",
            background: activeTab === "employee" ? "#fef3c7" : "#faf8f5",
            color: activeTab === "employee" ? "#92400e" : "#a18265",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👤 Employees</span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              fontSize: "11px",
              background: activeTab === "employee" ? "#92400e" : "#e2dcd5",
              color: activeTab === "employee" ? "#fff" : "#7c6249",
              fontWeight: 800,
            }}>{employeesWithTasks.length}</span>
          </button>
          <button onClick={() => setActiveTab("manager")} style={{
            padding: "6px 16px", border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            borderRadius: "20px",
            borderColor: activeTab === "manager" ? "#fcd34d" : "#e2dcd5",
            background: activeTab === "manager" ? "#fef3c7" : "#faf8f5",
            color: activeTab === "manager" ? "#92400e" : "#a18265",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👔 Managers</span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              fontSize: "11px",
              background: activeTab === "manager" ? "#92400e" : "#e2dcd5",
              color: activeTab === "manager" ? "#fff" : "#7c6249",
              fontWeight: 800,
            }}>{managersWithTasks.length}</span>
          </button>
        </div>
      ) : null}

      {/* ── Employee List (Active Tab = Employee or if user is Manager) ── */}
      {(activeTab === "employee" || !isSuperAdmin) && (
        <div style={{
          background: "#fffdf9",
          borderRadius: "16px", padding: "20px", border: "1px solid #f0e6d6",
          boxShadow: "0 4px 20px rgba(139, 92, 26, 0.02)",
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#78350f" }}>👤 Employees Tasks</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))", gap: "16px" }}>
            {employeesWithTasks.map(e => (
              <UnifiedEmployeeCard
                key={e.id}
                employee={e}
                userTasks={tasks.filter(t => t.assignedTo === e.id)}
                actions={
                  <>
                    <button onClick={() => {
                      const userTasks = tasks.filter(t => t.assignedTo === e.id);
                      if (userTasks.length > 0) {
                        setEditingTask(userTasks[0]);
                      }
                    }} title="Edit Task" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #f5e3cc",
                      background: "#fdf8f2", color: "#b45309", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 0.2s"
                    }}>✏️</button>
                    <button onClick={() => {
                      const userTasks = tasks.filter(t => t.assignedTo === e.id);
                      if (userTasks.length > 0) {
                        handleDeleteTask(userTasks[0].id);
                      }
                    }} title="Delete Task" style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #fee2e2",
                      background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </>
                }
              >
                {/* Tasks Section */}
                <div style={{ marginTop: "12px", borderTop: "1px solid #f5ede2", paddingTop: "10px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: "#78350f", marginBottom: "6px" }}>📋 Tasks:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {tasks.filter(t => t.assignedTo === e.id).map(t => {
                      const styles = t.status === "Completed" 
                        ? { bg: "#f0fdf4", color: "#16a34a", border: "#dcfce7", bar: "#10b981" }
                        : t.status === "In Progress"
                          ? { bg: "#eff6ff", color: "#2563eb", border: "#dbeafe", bar: "#3b82f6" }
                          : { bg: "#fff5f5", color: "#e53e3e", border: "#fed7d7", bar: "#fc8181" };
                      return (
                        <div 
                          key={t.id} 
                          className="task-item-premium"
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            background: "linear-gradient(to right, #ffffff, #fcfbf9)", 
                            border: "1px solid #f0e6d6", 
                            borderLeft: `4px solid ${styles.bar}`,
                            padding: "10px 14px", 
                            borderRadius: "8px", 
                            fontSize: "12px",
                            transition: "all 0.2s ease-in-out",
                            cursor: "default"
                          }}
                        >
                          <span style={{ color: "#3f2d20", fontWeight: 600 }}>{t.title}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "10px",
                              padding: "3px 8px",
                              borderRadius: "20px",
                              background: styles.bg,
                              color: styles.color,
                              border: `1px solid ${styles.border}`,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: styles.color }} />
                              {t.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </UnifiedEmployeeCard>
            ))}
            {employeesWithTasks.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#c4956a", padding: "20px 0", fontSize: "12px" }}>No employees with assigned tasks.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Manager List (Only if Admin & Tab = Manager) ── */}
      {isSuperAdmin && activeTab === "manager" && (
        <div style={{
          background: "#fffdf9",
          borderRadius: "16px", padding: "20px", border: "1px solid #f0e6d6",
          boxShadow: "0 4px 20px rgba(139, 92, 26, 0.02)",
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#78350f" }}>👔 Managers Tasks</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))", gap: "12px" }}>
            {managersWithTasks.map(m => (
              <div key={m.id} style={{
                background: "#fff", borderRadius: "12px", padding: "14px",
                border: "1px solid #f5ede2", boxShadow: "0 4px 12px rgba(139,92,26,0.03)",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#5c3a21", marginBottom: "10px" }}>{m.name}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Briefcase size={12} style={{ color: "#c29153" }} />
                      <span style={{ color: "#9c8069", width: "65px" }}>Role:</span>
                      <strong style={{ color: "#543d2b" }}>{m.jobTitle || "Manager"}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <UserIcon size={12} style={{ color: "#c29153" }} />
                      <span style={{ color: "#9c8069", width: "65px" }}>Username:</span>
                      <strong style={{ color: "#543d2b" }}>{m.username || "—"}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Phone size={12} style={{ color: "#c29153" }} />
                      <span style={{ color: "#9c8069", width: "65px" }}>Phone:</span>
                      <strong style={{ color: "#543d2b" }}>{m.phone || "—"}</strong>
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div style={{ marginTop: "12px", borderTop: "1px solid #f5ede2", paddingTop: "10px" }}>
                    <div style={{ fontWeight: 700, fontSize: "12px", color: "#78350f", marginBottom: "6px" }}>📋 Tasks:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {tasks.filter(t => t.assignedTo === m.id).map(t => (
                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fdfbfa", border: "1px solid #efe8df", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "#5c3a21", fontWeight: 600 }}>{t.title}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              fontSize: "9px",
                              padding: "2px 4px",
                              borderRadius: "3px",
                              background: t.status === "Completed" ? "#d1fae5" : t.status === "In Progress" ? "#dbeafe" : "#fee2e2",
                              color: t.status === "Completed" ? "#065f46" : t.status === "In Progress" ? "#1e40af" : "#991b1b",
                              fontWeight: 700
                            }}>{t.status}</span>
                            <button onClick={() => handleDeleteTask(t.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 0, fontWeight: 700 }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {managersWithTasks.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#c4956a", padding: "20px 0", fontSize: "12px" }}>No managers with assigned tasks.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Assign Task Modal ── */}
      {showAssignModal && (
        <Modal title="Assign Task" onClose={() => setShowAssignModal(false)}>
          <form onSubmit={handleAssignTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#9c8069", marginBottom: "6px" }}>Task Description</label>
              <textarea
                name="taskTitle"
                placeholder="Describe the task details..."
                rows={3}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #eaddca",
                  fontSize: "13px", outline: "none", resize: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#9c8069", marginBottom: "6px" }}>Select Assignee</label>
              <select
                name="assigneeId"
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #eaddca",
                  fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff"
                }}
                required
              >
                <option value="">-- Choose Member --</option>
                {eligibleAssignees.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === "manager" ? "Manager" : "Employee"}{u.jobTitle ? ` - ${u.jobTitle}` : ""})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button className="btn btn-ghost" type="button" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" style={{
                background: "linear-gradient(135deg, #d97706, #b45309)", border: "none"
              }}>Assign</button>
            </div>
          </form>
        </Modal>
      )}

      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const title = formData.get("taskTitle") as string;
            const assigneeId = formData.get("assigneeId") as string;
            if (title.trim() && assigneeId) {
              handleEditTaskSave(editingTask.id, title.trim(), assigneeId);
            }
          }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#9c8069", marginBottom: "6px" }}>Task Description</label>
              <textarea
                name="taskTitle"
                defaultValue={editingTask.title}
                placeholder="Describe the task details..."
                rows={3}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #eaddca",
                  fontSize: "13px", outline: "none", resize: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#9c8069", marginBottom: "6px" }}>Select Assignee</label>
              <select
                name="assigneeId"
                defaultValue={editingTask.assignedTo}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #eaddca",
                  fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff"
                }}
                required
              >
                <option value="">-- Choose Member --</option>
                {eligibleAssignees.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === "manager" ? "Manager" : "Employee"}{u.jobTitle ? ` - ${u.jobTitle}` : ""})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button className="btn btn-ghost" type="button" onClick={() => setEditingTask(null)}>Cancel</button>
              <button className="btn btn-primary" type="submit" style={{
                background: "linear-gradient(135deg, #d97706, #b45309)", border: "none"
              }}>Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function LeadPipelineOverview({ activeFilter, onFilterChange }: { activeFilter?: string, onFilterChange?: (status: string) => void }) {
  const { leads } = useStore();
  const getCount = (status: string) => leads.filter(l => l.status === status).length;

  const getCardStyle = (status: string) => ({
    cursor: onFilterChange ? "pointer" : "default",
    border: activeFilter === status ? "2px solid #d97706" : undefined,
    boxShadow: activeFilter === status ? "0 4px 12px rgba(217, 119, 6, 0.2)" : undefined,
    transform: activeFilter === status ? "scale(1.02)" : "none",
    transition: "all 0.2s ease"
  });

  const statuses = [
    { key: "New", label: "New Leads", color: "#3b82f6", bg: "#eff6ff", icon: "🆕" },
    { key: "Cold", label: "Cold Leads", color: "#6b7280", bg: "#f3f4f6", icon: "❄️" },
    { key: "Warm", label: "Warm Leads", color: "#f59e0b", bg: "#fef3c7", icon: "🌤️" },
    { key: "Hot", label: "Hot Leads", color: "#ef4444", bg: "#fee2e2", icon: "🔥" },
    { key: "Enrolled", label: "Enrolled", color: "#10b981", bg: "#d1fae5", icon: "🎓" },
    { key: "Cancelled", label: "Cancelled", color: "#ec4899", bg: "#fce7f3", icon: "❌" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {statuses.map(st => (
        <div
          key={st.key}
          className="panel"
          style={{
            ...getCardStyle(st.key),
            background: st.bg,
            borderColor: activeFilter === st.key ? st.color : "transparent",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            textAlign: "center"
          }}
          onClick={() => onFilterChange && onFilterChange(st.key)}
        >
          <span style={{ fontSize: "24px", marginBottom: "8px" }}>{st.icon}</span>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{st.label}</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: st.color, marginTop: "4px" }}>{getCount(st.key)}</div>
        </div>
      ))}
    </div>
  );
}

export function LeadCard({ lead, onDelete, onEdit }: { lead: Lead; onDelete: (id: string) => void; onEdit: (lead: Lead) => void }) {
  const { setState, users } = useStore();
  const [localNotes, setLocalNotes] = useState(lead.notes || "");
  const [localDate, setLocalDate] = useState(lead.followUpDate || "");

  useEffect(() => {
    setLocalNotes(lead.notes || "");
    setLocalDate(lead.followUpDate || "");
  }, [lead]);

  const updateStatus = (status: Lead["status"]) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === lead.id ? { ...l, status } : l)),
    }));
  };

  const handleNotesBlur = () => {
    if (localNotes !== (lead.notes || "")) {
      setState((s) => ({
        ...s,
        leads: s.leads.map((l) => (l.id === lead.id ? { ...l, notes: localNotes || undefined } : l)),
      }));
    }
  };

  const handleSetReminder = () => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === lead.id ? { ...l, followUpDate: localDate || undefined } : l)),
    }));
  };

  const handleClearReminder = () => {
    setLocalDate("");
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === lead.id ? { ...l, followUpDate: undefined } : l)),
    }));
  };

  const handleAssignChange = (assignedTo: string) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === lead.id ? { ...l, assignedTo: assignedTo || undefined } : l)),
    }));
  };

  const getStatusBadgeStyle = (status: Lead["status"]) => {
    const styles: Record<Lead["status"], { bg: string; color: string }> = {
      New: { bg: "#eff6ff", color: "#1d4ed8" },
      Cold: { bg: "#f3f4f6", color: "#475569" },
      Warm: { bg: "#fffbeb", color: "#d97706" },
      Hot: { bg: "#fef2f2", color: "#dc2626" },
      Enrolled: { bg: "#ecfdf5", color: "#059669" },
      Cancelled: { bg: "#fdf2f8", color: "#db2777" },
    };
    return styles[status] || styles.New;
  };

  const formatReminderDate = (dStr: string) => {
    try {
      const date = new Date(dStr);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dStr;
    }
  };

  const statusOptions: { key: Lead["status"]; label: string; color: string; border: string; dot: string }[] = [
    { key: "Cold", label: "Cold", color: "#4b5563", border: "#d1d5db", dot: "#6b7280" },
    { key: "Warm", label: "Warm", color: "#d97706", border: "#fde68a", dot: "#d97706" },
    { key: "Hot", label: "Hot", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
    { key: "Enrolled", label: "Enrolled", color: "#059669", border: "#a7f3d0", dot: "#059669" },
    { key: "Cancelled", label: "Cancel", color: "#db2777", border: "#fbcfe8", dot: "#db2777" },
    { key: "New", label: "New", color: "#1d4ed8", border: "#bfdbfe", dot: "#1d4ed8" }
  ];

  const badgeStyle = getStatusBadgeStyle(lead.status);

  return (
    <div className="panel animate fadeIn" style={{ padding: "28px", border: "1px solid #f1ece4", borderRadius: "20px", background: "#ffffff", marginBottom: "24px", boxShadow: "0 10px 30px rgba(122, 90, 50, 0.04)" }}>
      {/* Top Profile & Header Row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "50%", background: "#fffbeb",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", fontSize: "18px",
          marginTop: "2px"
        }}>
          👤
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 700, color: "#1c1917", fontFamily: "Georgia, serif", textTransform: "uppercase", letterSpacing: "1px" }}>
            {lead.name}
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              background: "#f3f4f6", color: "#4b5563", fontSize: "12px", fontWeight: 600,
              padding: "4px 12px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #e5e7eb"
            }}>
              👤 {lead.status}
            </span>
            {lead.product && (
              <span style={{
                background: "#fff7ed", color: "#ea580c", fontSize: "12px", fontWeight: 600,
                padding: "4px 12px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #ffedd5"
              }}>
                📋 {lead.product}{lead.brand ? ` - ${lead.brand}` : ""}
              </span>
            )}
            <span style={{
              background: "#f5f3ff", color: "#6d28d9", fontSize: "12px", fontWeight: 600,
              padding: "4px 12px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #ede9fe"
            }}>
              ✍️ Added By: {lead.createdBy || "System"}
            </span>
          </div>
        </div>
      </div>

      {/* Button Row: Status switches + Remove */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingBottom: "20px", borderBottom: "1px solid #f5ede0", marginBottom: "24px" }}>
        {statusOptions.map(opt => {
          const isActive = lead.status === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => updateStatus(opt.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px",
                fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
                backgroundColor: isActive ? opt.color : "#ffffff", color: isActive ? "#ffffff" : opt.color,
                border: `1px solid ${isActive ? opt.color : opt.border}`,
              }}
            >
              {opt.key === "Cancelled" ? <span>🚫</span> : <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isActive ? "#ffffff" : opt.dot }} />}
              {opt.label}
            </button>
          );
        })}

        <div style={{ width: "1px", height: "24px", backgroundColor: "#f5ede0", margin: "0 6px" }} />

        <button
          onClick={() => onDelete(lead.id)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px",
            fontSize: "12px", fontWeight: 600, cursor: "pointer", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", transition: "all 0.2s ease"
          }}
        >
          🗑 Remove
        </button>

        <button
          onClick={() => onEdit(lead)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px",
            fontSize: "12px", fontWeight: 600, cursor: "pointer", backgroundColor: "#fafaf9", color: "#5c4115", border: "1px solid #e7e5e4", transition: "all 0.2s ease", marginLeft: "auto"
          }}
        >
          ✏ Edit Details
        </button>
      </div>

      {/* Grid of detail list items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px", color: "#57534e", fontSize: "14px", fontWeight: 500 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px" }}>✉</span>
            <span>{lead.email || "--"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px" }}>📖</span>
            <span>{lead.gender ? `Gender: ${lead.gender}` : "NA"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px" }}>📍</span>
            <span style={{ textTransform: "uppercase" }}>{lead.city || "UNKNOWN"}</span>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px" }}>📞</span>
            <span>{lead.phone}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px" }}>📅</span>
            <span>{new Date(lead.date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Info Boxes */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#8a6632", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead Details</div>
          <div style={{ background: "#fcfaf5", border: "1px solid #f1ece1", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#8a6632" }}>
              PRODUCT: <span style={{ color: "#5c4115", fontSize: "14px", marginLeft: "6px" }}>{lead.product || "N/A"}{lead.brand ? ` (${lead.brand})` : ""}</span>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#8a6632" }}>
              SOURCE: <span style={{ color: "#5c4115", fontSize: "14px", marginLeft: "6px", textTransform: "uppercase" }}>{lead.source || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Admin Comments Box */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#8a6632", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin Comments</div>
          <textarea
            className="form-textarea"
            style={{ flex: 1, minHeight: "72px", resize: "none", background: "#fcfaf5", borderColor: "#f1ece1", padding: "12px" }}
            placeholder="Add your comments here..."
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
          />
        </div>
      </div>

      {/* Bottom Row: Date / Reminder Panel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span>📅</span>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#8a6632", textTransform: "uppercase", letterSpacing: "0.5px" }}>Next Follow-up Date</span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="date"
              className="form-input"
              style={{ margin: 0, height: "42px", background: "#ffffff" }}
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
            <button
              onClick={handleSetReminder}
              className="btn btn-primary"
              style={{
                backgroundColor: "#d97706",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontWeight: 700,
                padding: "0 20px",
                height: "42px",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              Set Reminder
            </button>
          </div>

          {/* Alert Set Banner */}
          {lead.followUpDate && (
            <div style={{
              background: "#fffdf0",
              border: "1px solid #fde047",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#854d0e" }}>
                <span>🔔</span>
                <span>Reminder set for: {formatReminderDate(lead.followUpDate)}</span>
              </div>
              <button
                onClick={handleClearReminder}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#dc2626",
                  padding: 0
                }}
                title="Remove Reminder"
              >
                🗑
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardLeadPipelineOverview({
  activeFilter,
  onFilterChange,
  showTitle = true,
}: {
  activeFilter?: string;
  onFilterChange?: (status: string) => void;
  showTitle?: boolean;
} = {}) {
  const { leads, currentUser } = useStore();
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (!currentUser) return;
    const path = currentUser.role === "superadmin" ? "/super-admin" : `/${currentUser.role}`;
    navigate({ to: path, search: { tab: "leads" } });
  };

  const getCount = (status: Lead["status"]) => leads.filter(l => l.status === status).length;

  const cards: { key: Lead["status"] | "All"; label: string; count: number; color: string; bg: string; border: string; icon: any }[] = [
    { key: "All", label: "All Leads", count: leads.length, color: "#8b5cf6", bg: "#f5f3ff", border: "#ede9fe", icon: MessageSquare },
    { key: "New", label: "New Leads", count: getCount("New"), color: "#3b82f6", bg: "#eff6ff", border: "#dbeafe", icon: AlertCircle },
    { key: "Cold", label: "Cold", count: getCount("Cold"), color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", icon: Snowflake },
    { key: "Warm", label: "Warm", count: getCount("Warm"), color: "#d97706", bg: "#fffbeb", border: "#fef3c7", icon: Clock },
    { key: "Hot", label: "Hot", count: getCount("Hot"), color: "#ef4444", bg: "#fdf2f2", border: "#fee2e2", icon: Flame },
    { key: "Enrolled", label: "Enrolled", count: getCount("Enrolled"), color: "#10b981", bg: "#ecfdf5", border: "#d1fae5", icon: CheckCircle2 },
    { key: "Cancelled", label: "Cancelled", count: getCount("Cancelled"), color: "#db2777", bg: "#fdf2f8", border: "#fce7f3", icon: XCircle }
  ];

  return (
    <div className="panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid #f2e6d0", boxShadow: "0 4px 15px rgba(122, 90, 50, 0.02)", marginBottom: "24px" }}>
      {showTitle && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare className="size-5" style={{ color: "#d97706" }} />
            <h3 style={{ fontSize: "20px", color: "#5c4115", fontWeight: 700, margin: 0 }}>Lead Pipeline Overview</h3>
          </div>
          <button
            onClick={handleViewAll}
            style={{ color: "#d97706", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px", outline: "none" }}
          >
            View All Inquiries
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "nowrap", width: "100%", gap: "8px", paddingBottom: "10px" }}>
        {cards.map((c, idx) => {
          const Icon = c.icon;
          const isSelected = activeFilter === c.key;
          return (
            <div
              key={idx}
              onClick={() => onFilterChange && onFilterChange(c.key)}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 8px",
                background: c.bg,
                border: isSelected ? `2.5px solid ${c.color}` : `1px solid ${c.border}`,
                borderRadius: "12px",
                cursor: onFilterChange ? "pointer" : "default",
                transform: isSelected ? "scale(1.03)" : "none",
                boxShadow: isSelected ? `0 4px 12px ${c.color}30` : "none",
                transition: "all 0.2s ease"
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: `${c.color}15`,
                  color: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "var(--brown)", fontWeight: 500 }}>{c.label}</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: c.color, lineHeight: "1.2", marginTop: "2px" }}>{c.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LeadsSection() {
  const { leads, users, products, setState, uid, currentUser } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSource, setFormSource] = useState("Walk-in");
  const [formProduct, setFormProduct] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formGender, setFormGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [formStatus, setFormStatus] = useState<Lead["status"]>("New");
  const [formFollowUpDate, setFormFollowUpDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formCity, setFormCity] = useState("");

  const availableBrands = useMemo(() => {
    if (!formProduct) return [];
    const match = PRODUCT_BRAND_MAP.find(m => m.keywords.some(k => formProduct.toLowerCase().includes(k)));
    return match ? match.brands : [];
  }, [formProduct]);

  useEffect(() => {
    if (availableBrands.length > 0 && !availableBrands.includes(formBrand)) {
      setFormBrand("");
    } else if (availableBrands.length === 0 && formBrand !== "") {
      setFormBrand("");
    }
  }, [availableBrands, formBrand]);

  useEffect(() => {
    if (editingLead) {
      setFormName(editingLead.name || "");
      setFormPhone(editingLead.phone || "");
      setFormEmail(editingLead.email || "");
      setFormSource(editingLead.source || "Walk-in");
      setFormProduct(editingLead.product || "");
      setFormBrand(editingLead.brand || "");
      setFormGender(editingLead.gender || "");
      setFormStatus(editingLead.status || "New");
      setFormFollowUpDate(editingLead.followUpDate || "");
      setFormNotes(editingLead.notes || "");
      setFormAssignedTo(editingLead.assignedTo || "");
      setFormCity(editingLead.city || "");
    } else {
      setFormName("");
      setFormPhone("");
      setFormEmail("");
      setFormSource("Walk-in");
      setFormProduct(products[0]?.name || "");
      setFormBrand("");
      setFormGender("");
      setFormStatus("New");
      setFormFollowUpDate("");
      setFormNotes("");
      if (currentUser?.role === "employee") {
        setFormAssignedTo(currentUser.id);
      } else {
        setFormAssignedTo("");
      }
      setFormCity("");
    }
  }, [editingLead, showAddModal, products, currentUser]);



  const handleSave = () => {
    if (!formName || !formPhone) return;

    if (editingLead) {
      setState((s) => ({
        ...s,
        leads: s.leads.map((l) =>
          l.id === editingLead.id
            ? {
              ...l,
              name: formName,
              phone: formPhone,
              email: formEmail || undefined,
              source: formSource || undefined,
              product: formProduct || undefined,
              brand: formBrand || undefined,
              gender: (formGender as any) || undefined,
              status: formStatus,
              followUpDate: formFollowUpDate || undefined,
              notes: formNotes || undefined,
              assignedTo: formAssignedTo || undefined,
              city: formCity || undefined,
            }
            : l
        ),
      }));
      setEditingLead(null);
    } else {
      const newLead: Lead = {
        id: uid("l"),
        name: formName,
        phone: formPhone,
        email: formEmail || undefined,
        source: formSource || undefined,
        product: formProduct || undefined,
        brand: formBrand || undefined,
        gender: (formGender as any) || undefined,
        status: formStatus,
        followUpDate: formFollowUpDate || undefined,
        notes: formNotes || undefined,
        assignedTo: formAssignedTo || undefined,
        city: formCity || undefined,
        date: new Date().toISOString(),
        createdBy: currentUser?.name || "System",
      };
      setState((s) => ({
        ...s,
        leads: [newLead, ...s.leads],
      }));
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    setState((s) => ({
      ...s,
      leads: s.leads.filter((l) => l.id !== id),
    }));
  };

  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
        const matchesFilter = (activeFilter && activeFilter !== "All") ? l.status === activeFilter : true;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          (l.product && l.product.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.city && l.city.toLowerCase().includes(q)) ||
          (l.source && l.source.toLowerCase().includes(q));
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [leads, activeFilter, searchQuery]);

  const assignableUsers = useMemo(() => {
    return users.filter((u) => u.role === "manager" || u.role === "employee");
  }, [users]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 className="page-title">Lead Generation</h2>
          <p className="page-sub">Track customer inquiries, status updates, and assign them to staff members.</p>
        </div>
        {(currentUser?.role === "employee" || currentUser?.role === "manager") && (
          <button
            className="btn btn-primary"
            style={{
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => setShowAddModal(true)}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> Add New Lead
          </button>
        )}
      </div>

      <DashboardLeadPipelineOverview
        activeFilter={activeFilter}
        onFilterChange={(st) => setActiveFilter((prev) => (prev === st ? "" : st))}
        showTitle={false}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Leads Custom Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#5c4115", margin: 0 }}>
              {activeFilter ? `${activeFilter} Leads` : "All Leads"} ({filteredLeads.length})
            </h3>

            {/* Search Box */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", minWidth: "260px" }}>
              <span style={{ position: "absolute", left: "10px", color: "var(--text-muted)", fontSize: "14px" }}>🔍</span>
              <input
                className="form-input"
                style={{ paddingLeft: "32px", margin: 0, height: "36px", fontSize: "13px" }}
                placeholder="Search name, phone, product, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredLeads.map((l) => (
              <LeadCard key={l.id} lead={l} onDelete={handleDelete} onEdit={(lead) => setEditingLead(lead)} />
            ))}
            {filteredLeads.length === 0 && (
              <div className="panel" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", border: "1px solid #f2e6d0", borderRadius: "12px" }}>
                No inquiry leads found matching current filters.
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingLead !== null) && (
        <Modal
          title={editingLead ? "Edit Lead Details" : "Create New Inquiry Lead"}
          onClose={() => {
            setShowAddModal(false);
            setEditingLead(null);
          }}
        >
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: "#dc2626" }}>*</span></label>
              <input
                className="form-input"
                placeholder="Enter your full name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp No</label>
              <input
                className="form-input"
                placeholder="+91 XXXXX XXXXX"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                placeholder="example@gmail.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                placeholder="Your City"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textTransform: "none", fontSize: "14px", fontWeight: 600 }}>Gender</label>
              <div style={{ display: "flex", gap: "24px", marginTop: "12px", marginBottom: "8px" }}>
                {(["Male", "Female", "Other"] as const).map(g => (
                  <label key={g} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setFormGender(g)}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", border: formGender === g ? "2px solid #d97706" : "1px solid #d6d3d1",
                      display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff",
                      transition: "all 0.2s"
                    }}>
                      {formGender === g && <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#d97706", animation: "fade-in 0.2s ease" }} />}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#4a3411" }}>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product of Interest</label>
              <select className="form-input" value={formProduct} onChange={(e) => setFormProduct(e.target.value)}>
                <option value="">Select a Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="Other Product">Other Product</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Product Brand</label>
              {availableBrands.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#a8a29e", padding: "10px", background: "#f5f5f5", borderRadius: "8px", border: "1px solid #e5e5e5" }}>No Brands Available</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {[...availableBrands, "Other"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormBrand(b)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: formBrand === b ? "1px solid #d97706" : "1px solid #d6d3d1",
                        background: formBrand === b ? "#fef3c7" : "#ffffff",
                        color: formBrand === b ? "#92400e" : "#57534e",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Lead Source</label>
              <select className="form-input" value={formSource} onChange={(e) => setFormSource(e.target.value)}>
                <option value="Walk-in">Walk-in</option>
                <option value="Phone">Phone Call</option>
                <option value="Online">Online Form</option>
                <option value="Referral">Referral</option>
                <option value="Advertisement">Advertisement</option>
              </select>
            </div>

            {currentUser?.role !== "employee" && (
              <div className="form-group">
                <label className="form-label">Assign Lead to Staff</label>
                <select
                  className="form-input"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  disabled={!!(editingLead && editingLead.assignedTo)}
                >
                  <option value="" disabled hidden>Select Staff</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}



            <div className="modal-actions" style={{ marginTop: "10px" }}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingLead(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!formName || !formPhone}
                style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", border: "none" }}
              >
                {editingLead ? "Update Lead" : "Add Lead"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}


export function SuperAdminIncentiveSection() {
  const { products, setState, users } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [incentiveMode, setIncentiveMode] = useState<boolean>(false);

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const oldProducts = products.filter(p => (p.date && new Date(p.date) < fifteenDaysAgo) || (p.incentive && p.incentive > 0));

  const remove = (id: string) => {
    if (!confirm("Delete this product?")) return;
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="page-title">Incentive Management</h2>
          <p className="page-sub">Track and manage employee incentives and payouts.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing({ id: Date.now().toString(), name: "", sku: "", cost: 0, stock: 0, status: "Available", incentive: 0, qty: 1 } as any);
            setIncentiveMode(true);
          }}
          style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 600 }}
        >
          ➕ Add Incentive Product
        </button>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-head">
          <h3 className="panel-title">💰 Products Eligible for Incentive (&gt; 15 Days)</h3>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>LOCATION</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {oldProducts.map((p) => {
                const formattedDate = p.date ? new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                return (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--biscuit)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                          📦
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--brown)", marginTop: 2 }}>
                        <span>Brand: {p.brand || "—"}</span>
                        {p.warranty && <span> · Warranty: {p.warranty}</span>}
                      </div>
                      {p.assignedEmployeeId && (
                        <div style={{ fontSize: 11, color: "var(--brown)", marginTop: 2 }}>
                          👤 Assigned: {p.assignedEmployeeId === "all" ? "All Employees" : (users.find(u => u.id === p.assignedEmployeeId)?.name || p.assignedEmployeeId)}
                        </div>
                      )}
                    </td>
                    <td>{p.sku}</td>
                    <td><span style={{ padding: "4px 8px", background: "var(--biscuit)", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.location || "Unassigned"}</span></td>
                    <td className="text-right">
                      <div className="actions-row" style={{ justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-sm" style={{ background: "var(--biscuit-light)", color: "var(--accent)", border: "1px solid var(--border)", fontWeight: 600, borderRadius: "6px" }} onClick={() => { setEditing(p); setIncentiveMode(true); }} title="Add/Edit Incentive">💰 Add Incentive</button>
                        <button className="btn btn-circle" onClick={() => setEditing(p)} title="Edit Product">✏️</button>
                        <button className="btn btn-circle btn-circle-danger" onClick={() => remove(p.id)} title="Delete Product">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {oldProducts.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductForm
          title={incentiveMode ? "Update Incentive" : "Edit Product"}
          initial={editing}
          isIncentiveMode={true}
          onClose={() => { setEditing(null); setIncentiveMode(false); }}
          onSave={(d) => {
            setState((s) => ({ ...s, products: s.products.map((p) => p.id === editing.id ? { ...p, ...d } : p) }));
            setEditing(null);
            setIncentiveMode(false);
          }}
        />
      )}
    </>
  );
}

export function SuperAdminGodownSection() {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<"Godown 1" | "Godown 2">("Godown 1");

  const godown1Products = products.filter(p => p.location === "Godown 1");
  const godown2Products = products.filter(p => p.location === "Godown 2");

  const renderTable = (prods: Product[]) => (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>IMAGE</th>
            <th>PRODUCT</th>
            <th>SKU</th>
            <th>CATEGORY</th>
            <th>QTY</th>
            <th>UNIT COST</th>
            <th>TOTAL VALUE</th>
          </tr>
        </thead>
        <tbody>
          {prods.map(p => {
            const qty = p.qty ?? p.stock ?? 0;
            const totalValue = qty * p.cost;
            return (
              <tr key={p.id}>
                <td>
                  {p.image ? (
                    <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--biscuit)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      📦
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td style={{ fontWeight: 600, color: qty < 20 ? "var(--danger)" : "inherit" }}>{qty}</td>
                <td>₹{p.cost.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>₹{totalValue.toLocaleString()}</td>
              </tr>
            );
          })}
          {prods.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">No products found in this godown.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <h2 className="page-title">Godown Management</h2>
      <p className="page-sub">Manage and track inventory specific to Godowns.</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px", marginBottom: "30px", background: "var(--cream)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(139, 107, 74, 0.05)" }}>
        <button
          onClick={() => setActiveTab("Godown 1")}
          style={{
            flex: 1,
            maxWidth: "250px",
            padding: "12px 24px",
            borderRadius: "12px",
            border: activeTab === "Godown 1" ? "2px solid var(--primary)" : "2px solid transparent",
            background: activeTab === "Godown 1" ? "var(--primary)" : "#ffffff",
            color: activeTab === "Godown 1" ? "#ffffff" : "var(--brown)",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: activeTab === "Godown 1" ? "0 8px 20px rgba(17, 34, 51, 0.25)" : "0 2px 8px rgba(0,0,0,0.05)"
          }}
          onMouseOver={(e) => { if (activeTab !== "Godown 1") e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseOut={(e) => { if (activeTab !== "Godown 1") e.currentTarget.style.transform = "none"; }}
        >
          <span style={{ fontSize: "20px" }}>🏭</span>
          <span style={{ color: activeTab === "Godown 1" ? "#ffffff" : "var(--brown)" }}>Godown 1</span>
          <span style={{
            background: activeTab === "Godown 1" ? "#ffffff" : "var(--biscuit)",
            color: activeTab === "Godown 1" ? "var(--primary)" : "var(--brown-dark)",
            padding: "2px 10px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 800
          }}>
            {godown1Products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Godown 2")}
          style={{
            flex: 1,
            maxWidth: "250px",
            padding: "12px 24px",
            borderRadius: "12px",
            border: activeTab === "Godown 2" ? "2px solid var(--primary)" : "2px solid transparent",
            background: activeTab === "Godown 2" ? "var(--primary)" : "#ffffff",
            color: activeTab === "Godown 2" ? "#ffffff" : "var(--brown)",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: activeTab === "Godown 2" ? "0 8px 20px rgba(17, 34, 51, 0.25)" : "0 2px 8px rgba(0,0,0,0.05)"
          }}
          onMouseOver={(e) => { if (activeTab !== "Godown 2") e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseOut={(e) => { if (activeTab !== "Godown 2") e.currentTarget.style.transform = "none"; }}
        >
          <span style={{ fontSize: "20px" }}>🏭</span>
          <span style={{ color: activeTab === "Godown 2" ? "#ffffff" : "var(--brown)" }}>Godown 2</span>
          <span style={{
            background: activeTab === "Godown 2" ? "#ffffff" : "var(--biscuit)",
            color: activeTab === "Godown 2" ? "var(--primary)" : "var(--brown-dark)",
            padding: "2px 10px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 800
          }}>
            {godown2Products.length}
          </span>
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-head">
          <h3 className="panel-title">🏭 {activeTab} Inventory</h3>
        </div>
        {renderTable(activeTab === "Godown 1" ? godown1Products : godown2Products)}
      </div>
    </>
  );
}
