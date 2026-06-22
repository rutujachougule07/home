import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, Customer, Product, Order } from "../app/store";
import { DashboardLayout, StatCard, Pill, NavItem, Modal } from "../app/DashboardLayout";
import { NotificationsSection, ProfileSection, LeadsSection, DashboardLeadPipelineOverview, UpcomingFollowUps, ProductForm } from "./SuperAdminPage";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "tasks", label: "Assigned Tasks", icon: "📝" },
  { key: "leads", label: "Lead Generation", icon: "🧲" },
  { key: "orders", label: "Order Updates", icon: "🧾" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "incentive", label: "Incentive", icon: "💰" },
  { key: "profile", label: "Profile", icon: "⚙" },
];

interface EmployeePageProps {
  tab?: string;
}

export function EmployeePage({ tab = "overview" }: EmployeePageProps) {
  const store = useStore();
  const active = tab || "overview";
  const navigate = useNavigate();

  const setActive = (tab: string) => {
    navigate({ to: "/employee", search: { tab } });
  };

  if (!store.currentUser || store.currentUser.role !== "employee") {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout role="employee" title="Employee" nav={NAV} active={active} onNav={setActive}>
      {active === "overview" && <Overview />}
      {active === "tasks" && <TasksSection />}
      {active === "leads" && <LeadsSection />}
      {active === "orders" && <OrderUpdates />}
      {active === "products" && <ProductsSection />}
      {active === "incentive" && <EmployeeIncentiveSection />}
      {active === "profile" && <ProfileSection />}
    </DashboardLayout>
  );
}

function Overview() {
  const { currentUser, tasks, orders } = useStore();
  const mine = tasks.filter((t) => t.assignedTo === currentUser!.id);
  return (
    <>
      <h2 className="page-title">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
      <p className="page-sub">Here's your work overview for today.</p>
      <DashboardLeadPipelineOverview />
      <UpcomingFollowUps />
      <div className="stat-grid">
        <StatCard icon="📝" label="Total Tasks" value={mine.length} />
        <StatCard icon="⏳" label="Pending" value={mine.filter((t) => t.status === "Pending").length} />
        <StatCard icon="⚙" label="In Progress" value={mine.filter((t) => t.status === "In Progress").length} />
        <StatCard icon="✅" label="Completed" value={mine.filter((t) => t.status === "Completed").length} />
        <StatCard icon="🧾" label="Active Orders" value={orders.filter((o) => o.status === "Approved").length} />
      </div>

      <div className="panel">
        <div className="panel-head"><h3 className="panel-title">My Recent Tasks</h3></div>
        <div className={mine.length > 0 ? "card-grid" : ""}>
          {mine.slice(0, 5).map((t) => (
            <div key={t.id} className="data-card">
              <div className="data-card-header">
                <h4 className="data-card-title">{t.title}</h4>
                <Pill status={t.status} />
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">Date</span><span className="data-value">{t.date}</span></div>
              </div>
            </div>
          ))}
          {mine.length === 0 && <div className="empty">No tasks yet.</div>}
        </div>
      </div>
    </>
  );
}

function TasksSection() {
  const { currentUser, tasks, setState } = useStore();
  const mine = tasks.filter((t) => t.assignedTo === currentUser!.id);

  const update = (id: string, status: "In Progress" | "Completed") => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) }));
  };

  const total = mine.length;
  const completed = mine.filter((t) => t.status === "Completed").length;
  const inProgress = mine.filter((t) => t.status === "In Progress").length;
  const pending = mine.filter((t) => t.status === "Pending").length;

  return (
    <>
      <h2 className="page-title">Assigned Tasks</h2>
      <p className="page-sub">Pick up tasks and mark them complete when done.</p>

      {/* Task summary cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="📝" label="Total" value={total} />
        <StatCard icon="✅" label="Completed" value={completed} />
        <StatCard icon="⚙" label="In Progress" value={inProgress} />
        <StatCard icon="⏳" label="Pending" value={pending} />
      </div>

      <div className="panel">
        <div className={mine.length > 0 ? "card-grid" : ""}>
          {mine.map((t) => (
            <div key={t.id} className="data-card">
              <div className="data-card-header">
                <h4 className="data-card-title">{t.title}</h4>
                <Pill status={t.status} />
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">Date</span><span className="data-value">{t.date}</span></div>
              </div>
              <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                <div className="actions-row">
                  {t.status === "Pending" && <button className="btn btn-ghost btn-sm" onClick={() => update(t.id, "In Progress")}>Start</button>}
                  {t.status !== "Completed" && <button className="btn btn-success btn-sm" onClick={() => update(t.id, "Completed")}>Complete</button>}
                </div>
              </div>
            </div>
          ))}
          {mine.length === 0 && <div className="empty">No tasks assigned.</div>}
        </div>
      </div>
    </>
  );
}

function CustomerComm() {
  const { customers, products, setState } = useStore();
  const [inquiry, setInquiry] = useState<Customer | null>(null);

  const setStatus = (id: string, status: string) => {
    setState((s) => ({ ...s, customers: s.customers.map((c) => c.id === id ? { ...c, status } : c) }));
  };

  return (
    <>
      <h2 className="page-title">Customer Communication</h2>
      <p className="page-sub">Update customer status and handle product inquiries.</p>
      <div className="panel">
        <div className={customers.length > 0 ? "card-grid" : ""}>
          {customers.map((c) => (
            <div key={c.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <h4 className="data-card-title">{c.name}</h4>
                  <span className="data-card-subtitle">{c.phone}</span>
                </div>
                <div><Pill status={c.status} /></div>
              </div>
              <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                <div className="actions-row">
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(c.id, "Contacted")}>Contacted</button>
                  <button className="btn btn-success btn-sm" onClick={() => setStatus(c.id, "Active")}>Active</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setInquiry(c)}>Inquiry</button>
                </div>
              </div>
            </div>
          ))}
          {customers.length === 0 && <div className="empty">No customers available.</div>}
        </div>
      </div>

      {inquiry && (
        <Modal title={`Product Inquiry — ${inquiry.name}`} onClose={() => setInquiry(null)}>
          <p style={{ fontSize: 13, color: "var(--brown)" }}>Available products to discuss with the customer:</p>
          <ul className="notif-list">
            {products.filter((p) => p.status === "Active").map((p) => (
              <li key={p.id}><b>{p.name}</b>{p.brand ? ` (${p.brand})` : ""} — ₹{p.price} · Stock: {p.qty ?? p.stock}</li>
            ))}
          </ul>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setInquiry(null)}>Done</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function OrderUpdates() {
  const { orders, products, currentUser, setState, uid } = useStore();
  const myOrders = orders.filter((o) => o.assignedTo === currentUser?.id && o.sentToEmployee && (o.status === "Approved" || o.status === "Delivered"));
  const otherOrders = orders.filter((o) => o.assignedTo !== currentUser?.id && o.sentToEmployee && (o.status === "Approved" || o.status === "Delivered"));
  return (
    <>
      <h2 className="page-title">Order Updates</h2>
      <p className="page-sub">Live order statuses from Super Admin approvals.</p>

      {/* My Assigned Orders */}
      <div className="panel" style={{ borderLeft: "4px solid var(--accent)", background: "var(--cream)", marginBottom: 24 }}>
        <div className="panel-head">
          <h3 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🎯 My Assigned Orders (माझ्या ऑर्डर्स)
            <span className="pill pill-approved">{myOrders.length}</span>
          </h3>
        </div>
        <div className={myOrders.length > 0 ? "card-grid" : ""}>
          {myOrders.map((o) => {
            const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
            const brandStr = product?.brand ? ` (${product.brand})` : "";
            return (
              <div key={o.id} className="data-card" style={{ borderLeft: "4px solid var(--accent)" }}>
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle">{o.customerName}</span>
                  </div>
                  <div><Pill status={o.status} /></div>
                </div>
                <div className="data-card-body">
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Total</span><span className="data-value" style={{ fontWeight: 700 }}>₹{o.total.toLocaleString()}</span></div>
                </div>
                <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                  {o.status === "Approved" ? (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() => {
                        if (confirm("Mark this order as delivered? (ही ऑर्डर डिलीव्हर झाली म्हणून नोंदवायची का?)")) {
                          setState((s) => ({
                            ...s,
                            orders: s.orders.map((order) => order.id === o.id ? { ...order, status: "Delivered" } : order),
                            notifications: [
                              {
                                id: uid("n"),
                                to: "manager",
                                from: currentUser?.name || "Employee",
                                message: `Order #${o.id} for ${o.customerName} (${o.qty}x ${o.productName}) has been delivered`,
                                date: new Date().toISOString().slice(0, 10),
                                read: false
                              },
                              ...s.notifications
                            ]
                          }));
                        }
                      }}
                    >
                      🚚 Mark Delivered
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>Completed</span>
                  )}
                </div>
              </div>
            );
          })}
          {myOrders.length === 0 && <div className="empty">No orders currently assigned to you.</div>}
        </div>
      </div>

      {/* All Other Orders */}
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">All Other Orders (इतर सर्व ऑर्डर्स)</h3>
        </div>
        <div className={otherOrders.length > 0 ? "card-grid" : ""}>
          {otherOrders.map((o) => {
            const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
            const brandStr = product?.brand ? ` (${product.brand})` : "";
            return (
              <div key={o.id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle">{o.customerName}</span>
                  </div>
                  <div><Pill status={o.status} /></div>
                </div>
                <div className="data-card-body">
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Assigned</span><span className="data-value">{o.assignedToName ?? "—"}</span></div>
                  <div className="data-row"><span className="data-label">Total</span><span className="data-value" style={{ fontWeight: 700 }}>₹{o.total.toLocaleString()}</span></div>
                </div>
              </div>
            );
          })}
          {otherOrders.length === 0 && <div className="empty">No other orders.</div>}
        </div>
      </div>
    </>
  );
}

function ProductsSection() {
  const { products, setState, uid, currentUser } = useStore();
  const [categoryFilter] = useState("All");
  const [showAdd] = useState(false);

  // Filter products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchCat;
    });
  }, [products, categoryFilter]);

  return (
    <>
      <h2 className="page-title">Products</h2>
      <p className="page-sub">View active and available products.</p>

      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Catalog ({filteredProducts.length})</h3>
          <div className="actions-row" style={{ alignItems: "center", gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell-flex">
                      {p.image ? (
                        <img src={p.image} className="product-image-cell" alt={p.name} />
                      ) : (
                        <div className="product-image-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--biscuit-light)", fontSize: 20 }}>📦</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--brown)", marginTop: 2 }}>
                          {p.sku && <span>SKU: {p.sku}</span>}
                          {p.sku && <span> · </span>}
                          <span>Brand: {p.brand || "—"}</span>
                          {p.warranty && <span> · Warranty: {p.warranty}</span>}
                          {p.assignedEmployeeId && (
                            <>
                              <span> · </span>
                              <span style={{ color: p.assignedEmployeeId === currentUser?.id || p.assignedEmployeeId === "all" ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>
                                👤 Assigned: {p.assignedEmployeeId === "all" ? "All Employees" : p.assignedEmployeeId === currentUser?.id ? "Me" : "Other Staff"}
                              </span>
                            </>
                          )}
                          {p.incentive > 0 && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id) && (
                            <>
                              <span> · </span>
                              <span style={{ color: "#d97706", fontWeight: 700, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>
                                💰 Incentive: ₹{p.incentive.toLocaleString()}/unit
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toLocaleString()}</td>
                  <td>{p.qty ?? p.stock}</td>
                  <td><Pill status={p.status} /></td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <ProductForm title="Add Product" onClose={() => setShowAdd(false)} onSave={(d) => { const nextId = uid("p"); setState((s) => ({ ...s, products: [...s.products, { id: nextId, ...d }] })); setShowAdd(false); }} />}
    </>
  );
}

export function EmployeeIncentiveSection() {
  const { products, users } = useStore();

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const oldProducts = products.filter(p => (p.date && new Date(p.date) < fifteenDaysAgo) || (p.incentive && p.incentive > 0));

  return (
    <div className="animated fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="page-title">Incentive Management</h2>
          <p className="page-sub">View products eligible for incentive.</p>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {oldProducts.map((p) => {
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
                  </tr>
                );
              })}
              {oldProducts.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
