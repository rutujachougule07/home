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
  { key: "history", label: "History", icon: "📜" },
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
      {active === "history" && <HistorySection />}
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

function HistorySection() {
  const { products, orders, customers, currentUser } = useStore();
  const [subTab, setSubTab] = useState<"stocking" | "bill" | "customers" | "incentive">("stocking");
  const [selectedBill, setSelectedBill] = useState<Order | null>(null);

  // Calculate incentive for approved orders
  const approvedOrders = orders.filter(o => o.status === "Approved" && o.assignedTo === currentUser?.id);

  const incentiveDetails = approvedOrders.map(o => {
    // Find the product to get the incentive amount
    const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
    const isAssigned = !product || !product.assignedEmployeeId || product.assignedEmployeeId === "all" || product.assignedEmployeeId === currentUser?.id;
    const incentivePerUnit = isAssigned ? (product ? product.incentive || 0 : 0) : 0;
    const totalIncentive = o.qty * incentivePerUnit;

    return {
      orderId: o.id,
      customerName: o.customerName,
      productName: o.productName,
      qty: o.qty,
      incentivePerUnit,
      totalIncentive,
      date: o.date
    };
  }).filter(item => item.totalIncentive > 0);

  const grandTotalIncentive = incentiveDetails.reduce((sum, item) => sum + item.totalIncentive, 0);

  // Selected bill calculations
  const selectedBillCustomer = selectedBill
    ? customers.find(c => c.id === selectedBill.customerId || c.name.toLowerCase() === selectedBill.customerName.toLowerCase())
    : null;

  const selectedBillProduct = selectedBill
    ? products.find(p => p.id === selectedBill.productId || p.name.toLowerCase() === selectedBill.productName.toLowerCase())
    : null;

  const unitPrice = selectedBill && selectedBill.qty > 0 ? Math.round(selectedBill.total / selectedBill.qty) : 0;
  const subtotal = selectedBill ? Math.round(selectedBill.total / 1.18) : 0;
  const tax = selectedBill ? selectedBill.total - subtotal : 0;

  const handlePrint = (bill: Order, customer: Customer | null, product: Product | null) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const uPrice = bill.qty > 0 ? Math.round(bill.total / bill.qty) : 0;
    const sTotal = Math.round(bill.total / 1.18);
    const tTax = bill.total - sTotal;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${bill.id.toUpperCase()}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #4a371d;
              padding: 40px;
              max-width: 650px;
              margin: 0 auto;
              background-color: #fffdf8;
            }
            .invoice-box {
              border: 1px solid #e6d6b8;
              padding: 30px;
              border-radius: 12px;
              background: #fff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .header { text-align: center; border-bottom: 2px dashed #e6d6b8; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 26px; font-weight: 800; color: #c98a3f; letter-spacing: 1.5px; }
            .subtitle { font-size: 10px; color: #7a5a32; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; }
            .meta-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            th { padding: 8px 10px; text-align: left; background: #faf1dd; border-bottom: 1px solid #e6d6b8; text-transform: uppercase; color: #7a5a32; font-size: 11px; }
            td { padding: 12px 10px; border-bottom: 1px solid #e6d6b8; }
            .summary-flex { display: flex; justify-content: flex-end; margin-bottom: 20px; }
            .summary-box { width: 220px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .grand-total { font-weight: 700; font-size: 15px; border-top: 1px solid #e6d6b8; padding-top: 8px; margin-top: 6px; color: #a86d28; }
            .footer { text-align: center; border-top: 2px dashed #e6d6b8; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #7a5a32; font-style: italic; }
            .stamp {
              display: inline-block;
              border: 2px solid;
              padding: 4px 8px;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 11px;
              transform: rotate(-5deg);
              border-radius: 4px;
              margin-top: 8px;
            }
            .stamp-approved { color: #4f8a55; border-color: #4f8a55; background: #d8ead9; }
            .stamp-pending { color: #946017; border-color: #946017; background: #fbe7c5; }
            .stamp-rejected { color: #c0473b; border-color: #c0473b; background: #f4d6d2; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="title">SMART HOME</div>
              <div class="subtitle">Premium IoT & Automation Systems</div>
              <div style="font-size: 11px; margin-top: 2px;">Kothrud, Pune · support@smarthome.com</div>
            </div>
            <div class="meta-grid">
              <div>
                <strong style="color: #7a5a32; font-size: 11px; text-transform: uppercase;">Bill To:</strong><br>
                <span style="font-size: 15px; font-weight: 700;">${bill.customerName}</span><br>
                ${customer ? `📞 ${customer.phone}<br>📍 ${customer.address}` : ""}
              </div>
              <div class="meta-right">
                <strong style="color: #7a5a32; font-size: 11px; text-transform: uppercase;">Invoice Details:</strong><br>
                Invoice #: <strong>${bill.id.toUpperCase()}</strong><br>
                Date: ${bill.date}<br>
                <div class="stamp stamp-${bill.status.toLowerCase()}">${bill.status}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center; width: 50px;">Qty</th>
                  <th style="text-align: right; width: 90px;">Unit Price</th>
                  <th style="text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="font-size: 14px;">${bill.productName}</strong><br>
                    <span style="font-size: 11px; color: #7a5a32;">${product ? `SKU: ${product.sku} | Category: ${product.category}` : ""}</span>
                  </td>
                  <td style="text-align: center;">${bill.qty}</td>
                  <td style="text-align: right;">₹${uPrice.toLocaleString()}</td>
                  <td style="text-align: right; font-weight: 700;">₹${bill.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div class="summary-flex">
              <div class="summary-box">
                <div class="summary-row">
                  <span style="color: #7a5a32;">Subtotal:</span>
                  <span>₹${sTotal.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                  <span style="color: #7a5a32;">GST (18%):</span>
                  <span>₹${tTax.toLocaleString()}</span>
                </div>
                <div class="summary-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹${bill.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              Thank you for your business! This is a computer-generated invoice.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="animated fadeIn">
      <h2 className="page-title">📜 History & Records</h2>
      <p className="page-sub">View system history, billing logs, customer directory, and earned incentives.</p>

      {/* Sub tabs navigation */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10, flexWrap: "wrap" }}>
        <button
          className={`btn ${subTab === "stocking" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setSubTab("stocking")}
          style={{ padding: "8px 16px", borderRadius: 8 }}
        >
          📦 Stocking History
        </button>
        <button
          className={`btn ${subTab === "bill" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setSubTab("bill")}
          style={{ padding: "8px 16px", borderRadius: 8 }}
        >
          🧾 Bill History
        </button>
        <button
          className={`btn ${subTab === "customers" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setSubTab("customers")}
          style={{ padding: "8px 16px", borderRadius: 8 }}
        >
          🧑‍💼 Customer Details
        </button>
        <button
          className={`btn ${subTab === "incentive" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setSubTab("incentive")}
          style={{ padding: "8px 16px", borderRadius: 8 }}
        >
          💰 Incentive Summary
        </button>
      </div>

      {/* SUB TAB: STOCKING */}
      {subTab === "stocking" && (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Stocking Inventory Records</h3>
          </div>
          <div className={products.length > 0 ? "card-grid" : ""}>
            {products.map((p) => (
              <div key={p.id} className="data-card">
                <div className="data-card-header">
                  <div className="product-cell-flex">
                    {p.image ? (
                      <img src={p.image} className="product-image-cell" alt={p.name} />
                    ) : (
                      <div className="product-image-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--biscuit-light)", fontSize: 16 }}>📦</div>
                    )}
                    <div>
                      <h4 className="data-card-title">{p.name}</h4>
                      <span className="data-card-subtitle">Brand: {p.brand || "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="data-card-body">
                  <div className="data-row"><span className="data-label">SKU</span><span className="data-value">{p.sku}</span></div>
                  <div className="data-row"><span className="data-label">Category</span><span className="data-value">{p.category}</span></div>
                  <div className="data-row"><span className="data-label">Quantity</span><span className="data-value">{p.qty}</span></div>
                </div>
                <div className="data-card-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <span className="data-label" style={{ alignSelf: "center" }}>Unit Cost</span>
                  <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>₹{p.cost.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="empty">No stocking records found.</div>}
          </div>
        </div>
      )}

      {/* SUB TAB: BILL */}
      {subTab === "bill" && (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Billing & Orders List</h3>
          </div>
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
                  </div>
                  <div className="data-card-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>₹{o.total.toLocaleString()}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 10px", fontSize: 12, background: "var(--biscuit-light)", borderColor: "var(--border)", fontWeight: 600 }}
                      onClick={() => setSelectedBill(o)}
                    >
                      📄 View Bill
                    </button>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <div className="empty">No billing history found.</div>}
          </div>
        </div>
      )}

      {/* SUB TAB: CUSTOMER DETAILS */}
      {subTab === "customers" && (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Customer Directory</h3>
          </div>
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
                </div>
              </div>
            ))}
            {customers.length === 0 && <div className="empty">No customers registered.</div>}
          </div>
        </div>
      )}

      {/* SUB TAB: INCENTIVE */}
      {subTab === "incentive" && (
        <>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card" style={{ background: "linear-gradient(135deg, #d8ead9 0%, var(--warm-white) 100%)", borderColor: "#c3e0c5" }}>
              <div className="stat-icon" style={{ background: "#4f8a55", color: "#fff" }}>💰</div>
              <div>
                <p className="stat-label">Total Incentive Earned</p>
                <h3 className="stat-value" style={{ color: "var(--success)" }}>₹{grandTotalIncentive.toLocaleString()}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div>
                <p className="stat-label">Successful Sales</p>
                <h3 className="stat-value">{incentiveDetails.length}</h3>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Incentive Earnings Log</h3>
            </div>
            <div className={incentiveDetails.length > 0 ? "card-grid" : ""}>
              {incentiveDetails.map((item, idx) => (
                <div key={idx} className="data-card">
                  <div className="data-card-header">
                    <div>
                      <h4 className="data-card-title">Order #{item.orderId}</h4>
                      <span className="data-card-subtitle">{item.date}</span>
                    </div>
                  </div>
                  <div className="data-card-body">
                    <div className="data-row"><span className="data-label">Customer</span><span className="data-value">{item.customerName}</span></div>
                    <div className="data-row"><span className="data-label">Product</span><span className="data-value">{item.productName} (x{item.qty})</span></div>
                    <div className="data-row"><span className="data-label">Incentive/Unit</span><span className="data-value">₹{item.incentivePerUnit.toLocaleString()}</span></div>
                  </div>
                  <div className="data-card-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <span className="data-label" style={{ alignSelf: "center" }}>Total Earning</span>
                    <span style={{ fontWeight: 700, color: "var(--success)", fontSize: 16 }}>₹{item.totalIncentive.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {incentiveDetails.length === 0 && <div className="empty">No incentives earned yet. Make a sale to earn!</div>}
            </div>
          </div>
        </>
      )}

      {/* BEAUTIFUL DIGITAL BILL MODAL */}
      {selectedBill && (
        <Modal title="📄 Digital Invoice Receipt" onClose={() => setSelectedBill(null)}>
          <div style={{
            background: "linear-gradient(135deg, var(--warm-white) 0%, #fff 100%)",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            boxShadow: "inset 0 0 12px rgba(122, 90, 50, 0.03)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px dashed var(--border)", paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 22 }}>🏠</span>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, background: "linear-gradient(135deg, var(--accent), var(--brown))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SMART HOME</span>
                  <div style={{ fontSize: 8, color: "var(--brown)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Premium Automation Systems</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "var(--brown)", textAlign: "right", lineHeight: 1.3 }}>
                <div>Kothrud, Pune</div>
                <div>support@smarthome.com</div>
              </div>
            </div>

            {/* Bill Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, marginBottom: 10, fontSize: 11 }}>
              <div>
                <div style={{ textTransform: "uppercase", fontSize: 9, fontWeight: 700, color: "var(--brown)", letterSpacing: 0.5 }}>Bill To:</div>
                <div style={{ fontWeight: 700, fontSize: 12, marginTop: 2 }}>{selectedBill.customerName}</div>
                {selectedBillCustomer ? (
                  <div style={{ color: "var(--brown)", marginTop: 2, lineHeight: 1.3 }}>
                    <div>📞 {selectedBillCustomer.phone}</div>
                    <div style={{ marginTop: 1 }}>📍 {selectedBillCustomer.address}</div>
                  </div>
                ) : (
                  <div style={{ color: "var(--brown)", marginTop: 2 }}>Customer records unavailable</div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ textTransform: "uppercase", fontSize: 9, fontWeight: 700, color: "var(--brown)", letterSpacing: 0.5 }}>Invoice Details:</div>
                <div style={{ marginTop: 2 }}>Invoice #: <code style={{ fontWeight: 700, fontSize: 12, background: "var(--biscuit-light)", padding: "1px 4px", borderRadius: 4 }}>{selectedBill.id.toUpperCase()}</code></div>
                <div style={{ marginTop: 2 }}>Date: <strong>{selectedBill.date}</strong></div>
                <div style={{ marginTop: 6 }}>
                  <span className={`pill ${selectedBill.status === "Approved" ? "pill-approved" : selectedBill.status === "Pending" ? "pill-pending" : "pill-rejected"}`} style={{ textTransform: "uppercase", fontSize: 8, padding: "1px 6px" }}>
                    {selectedBill.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--biscuit-light)" }}>
                  <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 8, textTransform: "uppercase", color: "var(--brown)" }}>Item Description</th>
                  <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 8, textTransform: "uppercase", color: "var(--brown)", width: 40 }}>Qty</th>
                  <th style={{ padding: "4px 6px", textAlign: "right", fontSize: 8, textTransform: "uppercase", color: "var(--brown)", width: 80 }}>Unit Price</th>
                  <th style={{ padding: "4px 6px", textAlign: "right", fontSize: 8, textTransform: "uppercase", color: "var(--brown)", width: 90 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 6px" }}>
                    <div style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 12 }}>{selectedBill.productName}</div>
                    {selectedBillProduct && <div style={{ fontSize: 9, color: "var(--brown)", marginTop: 1 }}>SKU: {selectedBillProduct.sku} · Brand: {selectedBillProduct.brand ?? "—"}</div>}
                  </td>
                  <td style={{ padding: "6px 6px", textAlign: "center" }}>{selectedBill.qty}</td>
                  <td style={{ padding: "6px 6px", textAlign: "right" }}>₹{unitPrice.toLocaleString()}</td>
                  <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: 700 }}>₹{selectedBill.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <div style={{ width: 170, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "var(--brown)" }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "var(--brown)" }}>
                  <span>GST (18%):</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: "1px solid var(--border)", fontWeight: 700, fontSize: 11, marginTop: 2 }}>
                  <span>Grand Total:</span>
                  <span style={{ color: "var(--accent-dark)", fontSize: 12 }}>₹{selectedBill.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div style={{ textAlign: "center", borderTop: "2px dashed var(--border)", paddingTop: 6, marginTop: 4, fontSize: 9, color: "var(--brown)", fontStyle: "italic" }}>
              Thank you for shopping with us!
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions" style={{ justifyContent: "flex-start", gap: 12, marginTop: 10 }}>
            <button
              className="btn btn-primary"
              onClick={() => handlePrint(selectedBill, selectedBillCustomer || null, selectedBillProduct || null)}
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", color: "#fff" }}
            >
              🖨️ Print Invoice
            </button>
            <button className="btn btn-ghost" onClick={() => setSelectedBill(null)} style={{ background: "#f6ede2" }}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
