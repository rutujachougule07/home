import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useStore, Product, User, Order } from "../app/store";
import { DashboardLayout, StatCard, Pill, BarChart, Modal, NavItem } from "../app/DashboardLayout";

const NAV: NavItem[] = [
  { key: "live", label: "Live Status", icon: "📡" },
  { key: "products", label: "Stocking Inventory", icon: "📦" },
  { key: "managers", label: "Managers", icon: "👔" },
  { key: "employees", label: "Employees", icon: "👥" },
  { key: "orders", label: "Order Approvals", icon: "✅" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
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
      {active === "managers" && <ManagersSection />}
      {active === "employees" && <EmployeesSection />}
      {active === "products" && <ProductsSection />}
      {active === "orders" && <OrderApprovalSection />}
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
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>ID / Username</th><th>Password</th><th>Email</th><th>Phone</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td><td>{m.username}</td><td>{m.password ?? "—"}</td><td>{m.email}</td><td>{m.phone ?? "—"}</td>
                  <td className="text-right">
                    <div className="actions-row" style={{ justifyContent: "flex-end" }}>
                      <button className="btn btn-circle" onClick={() => setEditing(m)} title="Edit Manager">✏️</button>
                      <button className="btn btn-circle btn-circle-danger" onClick={() => remove(m.id)} title="Delete Manager">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && <tr><td colSpan={6} className="empty">No managers yet.</td></tr>}
            </tbody>
          </table>
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
          style={{ background: "linear-gradient(135deg, #c39864, #a07542)", borderColor: "#906532", color: "#fff", opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? "Saving..." : "💾 Save Employee"}
        </button>
        <button className="btn btn-ghost" onClick={onClose} style={{ background: "#f6ede2" }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function EmployeeWorkDetailsModal({ employee, onClose }: { employee: User; onClose: () => void }) {
  const { tasks, orders } = useStore();
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
              <div className="table-wrap" style={{ maxHeight: 250, overflowY: "auto" }}>
                <table className="tbl" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empTasks.map((t) => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{t.date}</td>
                        <td>
                          <span className={`pill pill-${t.status === "Completed" ? "completed" : t.status === "In Progress" ? "progress" : "pending"}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {empTasks.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", padding: "20px 0", color: "var(--light-brown)" }}>
                          No tasks assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Panel */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 15 }}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--brown-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                📦 Assigned Orders
              </h4>
              <div className="table-wrap" style={{ maxHeight: 250, overflowY: "auto" }}>
                <table className="tbl" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empOrders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.customerName}</td>
                        <td>{o.qty}x {o.productName}</td>
                        <td>
                          <span className={`pill pill-${o.status.toLowerCase()}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {empOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "20px 0", color: "var(--light-brown)" }}>
                          No orders assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
        <div className="table-wrap">
          <table className="tbl employee-table">
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>ROLE</th>
                <th>PHONE</th>
                <th>USERNAME/EMAIL</th>
                <th>PASSWORD</th>
                <th>TASKS</th>
                <th>SCORE</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const list = tasks.filter((t) => t.assignedTo === e.id);
                const comp = list.filter((t) => t.status === "Completed").length;
                const total = list.length;
                const score = total ? Math.round((comp / total) * 100) : 0;
                
                return (
                  <tr key={e.id}>
                    <td>{e.employeeId ?? "—"}</td>
                    <td><strong>{e.name}</strong></td>
                    <td>{e.jobTitle ?? "—"}</td>
                    <td>{e.phone ?? "—"}</td>
                    <td><code style={{ fontSize: 11 }}>{e.username ?? "—"}</code></td>
                    <td><code style={{ fontSize: 11, background: "var(--biscuit-light)", padding: "2px 4px", borderRadius: 4 }}>{e.password ?? "—"}</code></td>
                    <td>{comp} / {total}</td>
                    <td style={{ fontWeight: 600, color: "var(--success)" }}>{score}%</td>
                    <td>
                      <span className={`pill ${e.status === "Inactive" ? "pill-rejected" : "pill-approved"}`}>
                        {e.status ?? "Verified"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="actions-row" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-circle" onClick={() => setViewingWork(e)} title="View Work Details" style={{ background: "var(--biscuit-light)" }}>📊</button>
                        <button className="btn btn-circle" onClick={() => setEditing(e)} title="Edit Employee">✏️</button>
                        <button className="btn btn-circle btn-circle-danger" onClick={() => remove(e.id)} title="Delete Employee">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty">No employees yet.</td>
                </tr>
              )}
            </tbody>
          </table>
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

  // Calculations for cards
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => (p.qty ?? p.stock ?? 0) < 20).length;
  const highStockCount = products.filter((p) => (p.qty ?? p.stock ?? 0) >= 50).length;

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
      }
      return matchCat && matchStock;
    });
  }, [products, categoryFilter, stockFilter]);

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
                      {(p.brand || p.warranty) && (
                        <div style={{ fontSize: 11, color: "var(--brown)", marginTop: 2 }}>
                          {p.brand && <span>Brand: {p.brand}</span>}
                          {p.brand && p.warranty && <span> · </span>}
                          {p.warranty && <span>Warranty: {p.warranty}</span>}
                        </div>
                      )}
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.category}</td>
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


function ProductForm({ title, initial, onSave, onClose }: { title: string; initial?: Product; onSave: (d: Omit<Product, "id">) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [warranty, setWarranty] = useState(initial?.warranty ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Electronics");
  const [qty, setQty] = useState(initial?.qty ?? 0);
  const [cost, setCost] = useState(initial?.cost ?? 0);
  const [incentive, setIncentive] = useState(initial?.incentive ?? 0);
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(initial?.status ?? "Verified");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageName, setImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [totalCost, setTotalCost] = useState(initial ? parseFloat((initial.qty * initial.cost).toFixed(2)) : 0);
  const { products } = useStore();
  
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
      .map((p) => p.brand)
      .filter((b) => b && !match.brands.includes(b));
    
    const uniqueCustomBrands = Array.from(new Set([...customBrands, ...localCustomBrands]));

    return [...match.brands, ...uniqueCustomBrands].filter(b => !localDeletedBrands.includes(b));
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
      date,
      status,
      image
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
          <span style={{ fontSize: 20 }}>{isDragging ? "📥" : "📁"}</span>
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
              setIncentive(parseFloat((val * 0.05).toFixed(2)));
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
              setIncentive(parseFloat((calculatedCost * 0.05).toFixed(2)));
            }}
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>INCENTIVE PER UNIT (₹)</label>
          <input
            type="number"
            className="form-input"
            value={incentive || ""}
            onChange={(e) => setIncentive(+e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-row-2" style={{ marginBottom: 14 }}>
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

      <div className="modal-actions" style={{ justifyContent: "flex-start", gap: 12, marginTop: 10 }}>
        <button className="btn btn-primary" onClick={save} style={{ background: "#5fa56c", borderColor: "#4e8f5a", color: "#fff" }}>
          💾 Save Entry
        </button>
        <button className="btn btn-ghost" onClick={onClose} style={{ background: "#f6ede2" }}>
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
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Orders</th><th>Status</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.address}</td>
                  <td>{orders.filter((o) => o.customerId === c.id).length}</td>
                  <td><Pill status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const { orders } = useStore();
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Assigned Employee</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.customerName}</td><td>{o.productName}</td><td>{o.qty}</td>
              <td>₹{o.total.toLocaleString()}</td><td>{o.assignedToName ?? "—"}</td><td>{o.date}</td><td><Pill status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderApprovalSection() {
  const { orders, setState, uid } = useStore();
  const [filter, setFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("Pending");
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const decide = (id: string, status: "Approved" | "Rejected") => {
    const notifId1 = uid("n");
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
        orders: s.orders.map((o) => o.id === id ? { ...o, status } : o),
        notifications: [
          { id: notifId1, to: "manager", from: "Super Admin", message: orderDetailsStr, date: new Date().toISOString().slice(0, 10), read: false },
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
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Assigned Employee</th><th>Created By</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td><td>{o.customerName}</td><td>{o.productName}</td><td>{o.qty}</td>
                  <td>₹{o.total.toLocaleString()}</td><td>{o.assignedToName ?? "—"}</td><td>{o.createdBy}</td>
                  <td><Pill status={o.status} /></td>
                  <td className="text-right">
                    {o.status === "Pending" ? (
                      <div className="actions-row" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-success btn-sm" onClick={() => decide(o.id, "Approved")}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => decide(o.id, "Rejected")}>Reject</button>
                      </div>
                    ) : <span style={{ color: "var(--brown)", fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={9} className="empty">No orders.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function NotificationsSection({ role }: { role: "superadmin" | "manager" | "employee" }) {
  const { notifications, setState, orders, users, uid } = useStore();
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
              const match = n.message.match(/order\s*#?([a-z0-9]+)/i);
              if (match) {
                const orderId = match[1];
                const foundOrder = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
                if (foundOrder && foundOrder.assignedTo) {
                  order = foundOrder;
                  assignedEmployee = users.find(u => u.id === foundOrder.assignedTo);
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
                      
                      {assignedEmployee && role === "manager" && (
                        <div style={{ 
                          marginTop: 8, 
                          padding: "6px 10px", 
                          background: "rgba(122, 90, 50, 0.05)", 
                          borderRadius: 8, 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 10,
                          flexWrap: "wrap",
                          border: "1px solid rgba(122, 90, 50, 0.1)"
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering markAsRead when clicking action buttons
                        >
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
                            <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>Sent ✅</span>
                          )}
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
