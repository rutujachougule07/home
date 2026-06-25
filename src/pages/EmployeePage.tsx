
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, Customer, Product, Order, Task } from "../app/store";
import { DashboardLayout, StatCard, Pill, NavItem, Modal } from "../app/DashboardLayout";
import { NotificationsSection, ProfileSection, LeadsSection, DashboardLeadPipelineOverview, UpcomingFollowUps, ProductForm } from "./SuperAdminPage";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "tasks", label: "Assigned Tasks", icon: "📝" },
  { key: "leads", label: "Lead Generation", icon: "🧲" },
  { key: "orders", label: "Order Updates", icon: "🧾" },
  { key: "products", label: "Products", icon: "📦" },
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
  const [proofTask, setProofTask] = useState<Task | null>(null);
  const [proofNote, setProofNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"text" | "photo">("text");
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const update = (id: string, status: "In Progress" | "Completed") => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) }));
  };

  const saveProof = () => {
    if (proofTask) {
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => t.id === proofTask.id ? { ...t, proofNote: proofType === "text" ? proofNote : t.proofNote, proofUrl: proofType === "photo" ? proofUrl : t.proofUrl } : t)
      }));
      setProofTask(null);
      setProofNote("");
      setProofUrl("");
      setProofType("text");
    }
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
                {(t.proofNote || t.proofUrl) && (
                  <div style={{ marginTop: 12, background: "var(--biscuit-light)", padding: "10px", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--brown-dark)", marginBottom: "6px" }}>📎 Task Proof Attached:</div>
                    {t.proofNote && <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", wordBreak: "break-all" }}>{t.proofNote}</div>}
                    {t.proofUrl && (
                      <div style={{ marginTop: "6px" }}>
                        <div onClick={() => setViewingImage(t.proofUrl || null)} style={{ cursor: "pointer", display: "inline-block" }} title="Click to view full image">
                          <img src={t.proofUrl} alt="Proof" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                <div className="actions-row">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setProofTask(t); setProofNote(t.proofNote || ""); setProofUrl(t.proofUrl || ""); setProofType(t.proofUrl ? "photo" : "text"); }}>Proof</button>
                  {t.status === "Pending" && <button className="btn btn-ghost btn-sm" onClick={() => update(t.id, "In Progress")}>Start</button>}
                  {t.status !== "Completed" && <button className="btn btn-success btn-sm" onClick={() => update(t.id, "Completed")}>Complete</button>}
                </div>
              </div>
            </div>
          ))}
          {mine.length === 0 && <div className="empty">No tasks assigned.</div>}
        </div>
      </div>

      {proofTask && (
        <Modal title="Submit Task Proof" onClose={() => setProofTask(null)}>
          <div className="form-group">
            <label className="form-label">Proof Type</label>
            <select className="form-input" value={proofType} onChange={(e) => setProofType(e.target.value as any)}>
              <option value="text">Text Note</option>
              <option value="photo">Upload Photo</option>
            </select>
          </div>

          {proofType === "text" ? (
            <div className="form-group">
              <label className="form-label">Proof Information / Note</label>
              <textarea
                className="form-input"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="Enter details or proof link here..."
                rows={4}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setProofUrl(event.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {proofUrl && <img src={proofUrl} alt="Proof" style={{ width: "100%", maxHeight: 200, objectFit: "contain", marginTop: 10, borderRadius: 8 }} />}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setProofTask(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProof}>Save Proof</button>
          </div>
        </Modal>
      )}
      {viewingImage && (
        <Modal title="Task Proof" onClose={() => setViewingImage(null)}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
            <img src={viewingImage} alt="Full Proof" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setViewingImage(null)}>Close</button>
          </div>
        </Modal>
      )}
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
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head">
          <h3 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🎯 My Assigned Orders
            <span className="pill pill-approved">{myOrders.length}</span>
          </h3>
        </div>
        <div className={myOrders.length > 0 ? "card-grid" : ""}>
          {myOrders.map((o) => {
            const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
            const brandStr = product?.brand ? ` (${product.brand})` : "";
            const isIncentiveOrder = product && (product.incentive ?? 0) > 0;

            return (
              <div key={o.id} className="data-card" style={{ borderLeft: "4px solid var(--accent)" }}>
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span>{o.customerName}</span>
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
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Unit Price</span><span className="data-value">₹{(product?.price ?? Math.round(o.total / o.qty)).toLocaleString()}</span></div>
                  <div className="data-row"><span className="data-label">Total</span><span className="data-value" style={{ fontWeight: 700 }}>₹{o.total.toLocaleString()}</span></div>
                </div>
                <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                  {o.status === "Approved" ? (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() => {
                        if (confirm("Mark this order as delivered?")) {
                          setState((s) => ({
                            ...s,
                            orders: s.orders.map((order) => order.id === o.id ? { ...order, status: "Delivered" } : order)
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
          <h3 className="panel-title">All Other Orders</h3>
        </div>
        <div className={otherOrders.length > 0 ? "card-grid" : ""}>
          {otherOrders.map((o) => {
            const product = products.find(p => p.id === o.productId || p.name.toLowerCase() === o.productName.toLowerCase());
            const brandStr = product?.brand ? ` (${product.brand})` : "";
            const isIncentiveOrder = product && (product.incentive ?? 0) > 0;

            return (
              <div key={o.id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span>{o.customerName}</span>
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
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Unit Price</span><span className="data-value">₹{(product?.price ?? Math.round(o.total / o.qty)).toLocaleString()}</span></div>
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
  const { products, setState, uid, currentUser, users } = useStore();
  const [categoryFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [sellQty, setSellQty] = useState<number>(1);

  const unitPrice = useMemo(() => {
    if (!sellingProduct) return 0;
    return sellingProduct.price;
  }, [sellingProduct]);

  const handleSell = () => {
    if (!sellingProduct) return;
    const qty = sellingProduct.qty ?? sellingProduct.stock ?? 0;
    if (qty <= 0) {
      alert("Out of stock!");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please fill in customer name and phone number.");
      return;
    }

    const orderId = uid("o");
    const today = new Date().toISOString().slice(0, 10);

    setState((s: any) => {
      let customerId = s.customers.find((c: any) => c.phone.trim() === customerPhone.trim())?.id;
      let nextCustomers = s.customers;
      if (!customerId) {
        customerId = uid("c");
        const newCust = {
          id: customerId,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim(),
          email: "",
          status: "Active"
        };
        nextCustomers = [...s.customers, newCust];
      }

      const discountPct = Number(discountAmount) || 0;
      const baseTotal = unitPrice * sellQty;
      const discountValue = Math.round((discountPct / 100) * baseTotal);
      const finalTotal = Math.max(0, baseTotal - discountValue);

      const newOrder = {
        id: orderId,
        customerId,
        customerName: customerName.trim(),
        productId: sellingProduct.id,
        productName: sellingProduct.name,
        qty: sellQty,
        total: finalTotal,
        discount: discountPct,
        createdBy: currentUser?.name || "employee",
        status: "Pending" as const,
        date: today,
        assignedTo: currentUser?.id,
        assignedToName: currentUser?.name,
        sentToEmployee: true
      };

      return {
        ...s,
        customers: nextCustomers,
        orders: [...s.orders, newOrder]
      };
    });

    setSellingProduct(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDiscountAmount("");
    setSellQty(1);
    alert("Sale request sent for Admin approval!");
  };

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
                <th>Action</th>
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
                          {p.assignedEmployeeId && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id) && (
                            <>
                              <span> · </span>
                              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                                👤 Assigned: {p.assignedEmployeeId === "all" ? "All Employees" : "Me"}
                              </span>
                            </>
                          )}
                          {p.incentive > 0 && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id) && (
                            <>
                              <span> · </span>
                              <span style={{ color: "#d97706", fontWeight: 700, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>
                                💰 Incentive: {p.price > 0 ? parseFloat(((p.incentive / p.price) * 100).toFixed(1)) : 0}%
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
                  <td>
                    {p.incentive > 0 && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id) ? (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 600 }}
                        onClick={() => setSellingProduct(p)}
                      >
                        🏷️ Sell
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
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

      {sellingProduct && (
        <Modal title={`🏷️ Sell Product`} onClose={() => setSellingProduct(null)} className="sell-modal">
          <style>{`
            .sell-modal {
              max-width: 540px !important;
              padding: 26px 30px !important;
              border-radius: 16px !important;
              box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12) !important;
            }
            .sell-modal .modal-head {
              margin-bottom: 16px !important;
              padding-bottom: 10px !important;
            }
            .sell-modal .modal-title {
              font-size: 21px !important;
            }
          `}</style>
          <div style={{
            background: "linear-gradient(135deg, var(--biscuit-light) 0%, #fff 100%)",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            marginBottom: "16px",
            boxShadow: "inset 0 0 10px rgba(122, 90, 50, 0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--brown-dark)" }}>{sellingProduct.name}</h4>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                💰 Incentive: {sellingProduct.price > 0 ? Math.round((sellingProduct.incentive / sellingProduct.price) * 100) : 0}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "var(--brown)" }}>
              <span>Brand: <strong>{sellingProduct.brand || "—"}</strong> · SKU: <code>{sellingProduct.sku}</code></span>
              <span style={{ fontWeight: 700, color: "var(--brown-dark)" }}>Price (1 Unit): ₹{unitPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Customer Name *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Phone Number *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Address
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Enter address (optional)"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Quantity
            </label>
            <input
              type="number"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={sellQty}
              onChange={(e) => setSellQty(Math.max(1, Number(e.target.value)))}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              min={1}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Discount (%)
            </label>
            <input
              type="number"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="Enter discount percentage (e.g. 10)"
              min={0}
              max={100}
            />
          </div>

          <div style={{ padding: "12px", background: "var(--biscuit-light)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--brown)" }}>Final Total:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--brown-dark)" }}>₹{Math.max(0, (unitPrice * sellQty) - Math.round(((Number(discountAmount) || 0) / 100) * (unitPrice * sellQty))).toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              className="btn btn-ghost"
              onClick={() => setSellingProduct(null)}
              style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, borderRadius: "10px", background: "var(--biscuit-light)", height: "40px" }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSell}
              disabled={!customerName.trim() || !customerPhone.trim()}
              style={{
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "10px",
                background: (!customerName.trim() || !customerPhone.trim()) ? "var(--border)" : "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                border: "none",
                color: "#fff",
                cursor: (!customerName.trim() || !customerPhone.trim()) ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                height: "40px"
              }}
            >
              Submit Sale
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function EmployeeIncentiveSection() {
  const { currentUser, products, users, setState, uid } = useStore();

  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const isEmployee = currentUser?.role === "employee";

  const incentiveProducts = products.filter(p => {
    if (isEmployee) {
      return p.incentive > 0 && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id);
    }
    return p.incentive > 0;
  });

  const unitPrice = useMemo(() => {
    if (!sellingProduct) return 0;
    const qty = sellingProduct.qty ?? sellingProduct.stock ?? 1;
    return qty > 0 ? Math.round(sellingProduct.price / qty) : sellingProduct.price;
  }, [sellingProduct]);

  const handleSell = () => {
    if (!sellingProduct) return;
    const qty = sellingProduct.qty ?? sellingProduct.stock ?? 0;
    if (qty <= 0) {
      alert("Out of stock!");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please fill in customer name and phone number.");
      return;
    }

    const orderId = uid("o");
    const today = new Date().toISOString().slice(0, 10);

    setState((s: any) => {
      // 1. Check if customer already exists, otherwise create a new customer
      let customerId = s.customers.find((c: any) => c.phone.trim() === customerPhone.trim())?.id;
      let nextCustomers = s.customers;
      if (!customerId) {
        customerId = uid("c");
        const newCust = {
          id: customerId,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim(),
          email: "",
          status: "Active"
        };
        nextCustomers = [...s.customers, newCust];
      }

      // 2. Create a new pending order assigned to this employee for Admin approval
      const newOrder = {
        id: orderId,
        customerId,
        customerName: customerName.trim(),
        productId: sellingProduct.id,
        productName: sellingProduct.name,
        qty: 1,
        total: unitPrice,
        createdBy: currentUser?.name || "employee",
        status: "Pending" as const,
        date: today,
        assignedTo: currentUser?.id,
        assignedToName: currentUser?.name,
        sentToEmployee: true
      };

      return {
        ...s,
        customers: nextCustomers,
        orders: [...s.orders, newOrder]
      };
    });

    setSellingProduct(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    alert("Sale request sent for Admin approval!");
  };

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
          <h3 className="panel-title">💰 Incentive Products</h3>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>INCENTIVE</th>
                <th>LOCATION</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {incentiveProducts.map((p) => {
                const canSell = isEmployee && p.incentive > 0 && (p.assignedEmployeeId === "all" || p.assignedEmployeeId === currentUser?.id);
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
                    <td>
                      <span style={{ color: "#d97706", fontWeight: 700, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                        💰 {p.price > 0 ? Math.round((p.incentive / p.price) * 100) : 0}%
                      </span>
                    </td>
                    <td><span style={{ padding: "4px 8px", background: "var(--biscuit)", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.location || "Unassigned"}</span></td>
                    <td>
                      {canSell ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setSellingProduct(p)}
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600 }}
                        >
                          🏷️ Sell
                        </button>
                      ) : (
                        <span style={{ color: "var(--brown)", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {incentiveProducts.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {sellingProduct && (
        <Modal title={`🏷️ Sell Product`} onClose={() => setSellingProduct(null)} className="sell-modal">
          <style>{`
            .sell-modal {
              max-width: 540px !important;
              padding: 26px 30px !important;
              border-radius: 16px !important;
              box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12) !important;
            }
            .sell-modal .modal-head {
              margin-bottom: 16px !important;
              padding-bottom: 10px !important;
            }
            .sell-modal .modal-title {
              font-size: 21px !important;
            }
          `}</style>
          <div style={{
            background: "linear-gradient(135deg, var(--biscuit-light) 0%, #fff 100%)",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            marginBottom: "16px",
            boxShadow: "inset 0 0 10px rgba(122, 90, 50, 0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--brown-dark)" }}>{sellingProduct.name}</h4>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                💰 Incentive: {sellingProduct.price > 0 ? Math.round((sellingProduct.incentive / sellingProduct.price) * 100) : 0}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "var(--brown)" }}>
              <span>Brand: <strong>{sellingProduct.brand || "—"}</strong> · SKU: <code>{sellingProduct.sku}</code></span>
              <span style={{ fontWeight: 700, color: "var(--brown-dark)" }}>Price (1 Unit): ₹{unitPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Customer Name *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Phone Number *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brown-dark)", letterSpacing: "0.5px" }}>
              Address
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: "40px", padding: "8px 12px", fontSize: "14px", borderRadius: "10px", border: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Enter address (optional)"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              className="btn btn-ghost"
              onClick={() => setSellingProduct(null)}
              style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, borderRadius: "10px", background: "var(--biscuit-light)", height: "40px" }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSell}
              disabled={!customerName.trim() || !customerPhone.trim()}
              style={{
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "10px",
                background: (!customerName.trim() || !customerPhone.trim()) ? "var(--border)" : "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                border: "none",
                color: "#fff",
                cursor: (!customerName.trim() || !customerPhone.trim()) ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                height: "40px"
              }}
            >
              Submit Sale
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
