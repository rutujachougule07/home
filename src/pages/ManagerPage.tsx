import { EmployeeIncentiveSection } from "./EmployeePage";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, User, Customer, Order } from "../app/store";
import { DashboardLayout, StatCard, Pill, Modal, NavItem, BarChart } from "../app/DashboardLayout";
import { NotificationsSection, ProfileSection, EmployeeForm, EmployeeWorkDetailsModal, LeadsSection, DashboardLeadPipelineOverview, UpcomingFollowUps, TasksAssignSection, TaskAssignmentSection, ProductForm } from "./SuperAdminPage";
import { UnifiedEmployeeCard } from "../components/UnifiedEmployeeCard";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "assign", label: "Add Employee", icon: "📋" },
  { key: "task-assign", label: "Task Assign", icon: "📝" },
  { key: "leads", label: "Lead Generation", icon: "🧲" },
  { key: "orders", label: "Orders", icon: "🧾" },
  { key: "products", label: "Product Availability", icon: "📦" },
  { key: "incentive", label: "Incentive", icon: "💰" },
  { key: "profile", label: "Profile", icon: "⚙" },
];

interface ManagerPageProps {
  tab?: string;
}

export function ManagerPage({ tab = "overview" }: ManagerPageProps) {
  const store = useStore();
  const active = tab || "overview";
  const navigate = useNavigate();
  const setActive = (tab: string) => {
    navigate({ to: "/manager", search: { tab } });
  };

  if (!store.currentUser || store.currentUser.role !== "manager") return <Navigate to="/login" />;

  return (
    <DashboardLayout role="manager" title="Manager" nav={NAV} active={active} onNav={setActive}>
      {active === "overview" && <Overview />}
      {active === "assign" && <TasksAssignSection />}
      {active === "task-assign" && <TaskAssignmentSection />}
      {active === "customers" && <CustomersMgmt />}
      {active === "leads" && <LeadsSection />}
      {active === "orders" && <OrdersMgmt />}
      {active === "products" && <ProductsAvail />}
      {active === "incentive" && <EmployeeIncentiveSection />}
      {active === "notifications" && <NotificationsSection role="manager" />}
      {active === "profile" && <ProfileSection />}
    </DashboardLayout>
  );
}

function Overview() {
  const { users, customers, orders, tasks } = useStore();
  const emp = users.filter((u) => u.role === "employee").length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  return (
    <>
      <h2 className="page-title">Manager Dashboard</h2>
      <p className="page-sub">Coordinate employees, customers, and orders.</p>
      <DashboardLeadPipelineOverview />
      <UpcomingFollowUps />
      <div className="stat-grid">
        <StatCard icon="👥" label="Employees" value={emp} />
        <StatCard icon="🧑‍💼" label="Customers" value={customers.length} />
        <StatCard icon="🧾" label="Orders" value={orders.length} />
        <StatCard icon="⏳" label="Pending Approvals" value={pending} />
        <StatCard icon="✅" label="Tasks Completed" value={tasks.filter((t) => t.status === "Completed").length} />
      </div>
      <div className="row-2">
        <div className="panel">
          <div className="panel-head"><h3 className="panel-title">Order Pipeline</h3></div>
          <BarChart data={[
            { label: "Pending", value: orders.filter((o) => o.status === "Pending").length },
            { label: "Approved", value: orders.filter((o) => o.status === "Approved").length },
            { label: "Rejected", value: orders.filter((o) => o.status === "Rejected").length },
          ]} />
        </div>
        <div className="panel">
          <div className="panel-head"><h3 className="panel-title">Employee Tasks</h3></div>
          <ul className="notif-list">
            {tasks.slice(0, 6).map((t) => (
              <li key={t.id}>
                <span className="notif-from">{t.assignedToName}</span> — {t.title}
                <span className="notif-date">{t.date} · {t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function EmployeesMgmt() {
  const { users, tasks, setState, uid } = useStore();
  const employees = users.filter((u) => u.role === "employee");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [assignTo, setAssignTo] = useState<User | null>(null);
  const [viewingWork, setViewingWork] = useState<User | null>(null);

  const remove = (id: string) => {
    if (!confirm("Delete this employee?")) return;
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
  };

  return (
    <>
      <h2 className="page-title">Employees</h2>
      <p className="page-sub">Manage employees and assign work.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Team ({employees.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Employee</button>
        </div>
        <div className={employees.length > 0 ? "card-grid" : ""}>
          {employees.map((e) => {
            return (
              <UnifiedEmployeeCard
                key={e.id}
                employee={e}
                userTasks={tasks.filter((t) => t.assignedTo === e.id)}
                actions={
                  <>
                    <button className="btn btn-circle" onClick={() => setViewingWork(e)} title="View Work Details" style={{ background: "var(--biscuit-light)" }}>📊</button>
                    <button className="btn btn-circle" onClick={() => setAssignTo(e)} title="Assign Work" style={{ background: "var(--biscuit-light)" }}>📋</button>
                    <button className="btn btn-circle" onClick={() => setEditing(e)} title="Edit Employee">✏️</button>
                    <button className="btn btn-circle btn-circle-danger" onClick={() => remove(e.id)} title="Delete Employee">🗑️</button>
                  </>
                }
              />
            );
          })}
          {employees.length === 0 && <div className="empty">No employees yet.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3 className="panel-title">All Tasks</h3></div>
        <div className={tasks.length > 0 ? "card-grid" : ""}>
          {tasks.map((t) => (
            <div key={t.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <h4 className="data-card-title">{t.title}</h4>
                  <span className="data-card-subtitle">{t.date}</span>
                </div>
                <div><Pill status={t.status} /></div>
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">Assignee</span><span className="data-value">{t.assignedToName}</span></div>
              </div>
              <div className="data-card-footer" style={{ justifyContent: "flex-end" }}>
                <button
                  className="btn btn-circle btn-circle-danger"
                  onClick={() => {
                    if (confirm("Delete this task?")) {
                      setState((s) => ({ ...s, tasks: s.tasks.filter((task) => task.id !== t.id) }));
                    }
                  }}
                  title="Delete Task"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="empty">No tasks yet.</div>}
        </div>
      </div>

      {showAdd && (
        <EmployeeForm
          title="Register New Employee"
          onClose={() => setShowAdd(false)}
          onSave={(d) => {
            const nextId = uid("u");
            setState((s) => ({ ...s, users: [...s.users, { id: nextId, role: "employee", ...d }] }));
            setShowAdd(false);
          }}
        />
      )}
      {editing && (
        <EmployeeForm
          title="Edit Employee"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            setState((s) => ({ ...s, users: s.users.map((u) => u.id === editing.id ? { ...u, ...d } : u) }));
            setEditing(null);
          }}
        />
      )}
      {assignTo && (
        <AssignForm
          employee={assignTo}
          onClose={() => setAssignTo(null)}
          onSave={(title) => {
            const taskId = uid("t");
            const notifId = uid("n");
            setState((s) => ({
              ...s,
              tasks: [...s.tasks, { id: taskId, title, assignedTo: assignTo.id, assignedToName: assignTo.name, status: "Pending", date: new Date().toISOString().slice(0, 10) }],
              notifications: [{ id: notifId, to: "employee", from: "Manager", message: `New task: ${title}`, date: new Date().toISOString().slice(0, 10), read: false }, ...s.notifications],
            }));
            setAssignTo(null);
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

function AssignForm({ employee, onSave, onClose }: { employee: User; onSave: (title: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  return (
    <Modal title={`Assign Work — ${employee.name}`} onClose={onClose}>
      <div className="form-group"><label className="form-label">Task description</label>
        <textarea className="form-textarea" rows={3} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => title && onSave(title)}>Assign</button>
      </div>
    </Modal>
  );
}

function CustomersMgmt() {
  const { customers, setState, uid } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const remove = (id: string) => {
    if (!confirm("Delete this customer?")) return;
    setState((s) => ({ ...s, customers: s.customers.filter((c) => c.id !== id) }));
  };

  return (
    <>
      <h2 className="page-title">Customers</h2>
      <p className="page-sub">Add and update customer records.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">All Customers ({customers.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Customer</button>
        </div>
        <div className={customers.length > 0 ? "card-grid" : ""}>
          {customers.map((c) => (
            <div key={c.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <h4 className="data-card-title">{c.name}</h4>
                  <span className="data-card-subtitle">{c.email}</span>
                </div>
                <Pill status={c.status} />
              </div>
              <div className="data-card-body">
                <div className="data-row"><span className="data-label">Phone</span><span className="data-value">{c.phone}</span></div>
                <div className="data-row"><span className="data-label">Address</span><span className="data-value" style={{ textAlign: "right", maxWidth: "60%" }}>{c.address}</span></div>
              </div>
              <div className="data-card-footer">
                <button className="btn btn-circle" onClick={() => setEditing(c)} title="Update Customer">✏️</button>
                <button className="btn btn-circle btn-circle-danger" onClick={() => remove(c.id)} title="Delete Customer">🗑️</button>
              </div>
            </div>
          ))}
          {customers.length === 0 && <div className="empty">No customers yet.</div>}
        </div>
      </div>

      {showAdd && <CustomerForm onClose={() => setShowAdd(false)} onSave={(d) => { const nextId = uid("c"); setState((s) => ({ ...s, customers: [...s.customers, { id: nextId, ...d }] })); setShowAdd(false); }} />}
      {editing && <CustomerForm initial={editing} onClose={() => setEditing(null)} onSave={(d) => { setState((s) => ({ ...s, customers: s.customers.map((c) => c.id === editing.id ? { ...c, ...d } : c) })); setEditing(null); }} />}
    </>
  );
}

function CustomerForm({ initial, onSave, onClose }: { initial?: Customer; onSave: (d: Omit<Customer, "id">) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Active");
  return (
    <Modal title={initial ? "Update Customer" : "Add Customer"} onClose={onClose}>
      <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Status</label>
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Active</option><option>Contacted</option><option>Inactive</option>
        </select>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => name && onSave({ name, email, phone, address, status })}>Save</button>
      </div>
    </Modal>
  );
}

function OrdersMgmt() {
  const { orders, customers, products, setState, uid } = useStore();
  const [show, setShow] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const remove = (id: string) => {
    if (!confirm("Delete this order?")) return;
    setState((s) => {
      const order = s.orders.find((o) => o.id === id);
      let updatedProducts = s.products;
      if (order && order.status === "Approved") {
        updatedProducts = s.products.map((p) => {
          if (p.id === order.productId || p.name.toLowerCase() === order.productName.toLowerCase()) {
            return {
              ...p,
              qty: (p.qty ?? p.stock ?? 0) + order.qty,
              stock: (p.stock ?? p.qty ?? 0) + order.qty
            };
          }
          return p;
        });
      }
      return {
        ...s,
        products: updatedProducts,
        orders: s.orders.filter((o) => o.id !== id)
      };
    });
  };

  return (
    <>
      <h2 className="page-title">Orders</h2>
      <p className="page-sub">Create new orders and send them to Super Admin for approval.</p>
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">My Orders ({orders.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Create Order</button>
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
                  <div className="data-row"><span className="data-label">Assigned</span><span className="data-value">{o.assignedToName ?? "—"}</span></div>
                </div>
                <div className="data-card-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>₹{o.total.toLocaleString()}</span>
                  <div className="actions-row">
                    {o.status === "Approved" && (
                      o.sentToEmployee ? (
                        <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, marginRight: 8, alignSelf: "center" }}>Sent ✅</span>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ padding: "4px 8px", fontSize: 11, marginRight: 8 }}
                          onClick={() => {
                            setState((s) => ({
                              ...s,
                              orders: s.orders.map((order) => order.id === o.id ? { ...order, sentToEmployee: true } : order),
                              notifications: [
                                {
                                  id: uid("n"),
                                  to: "employee",
                                  from: "Manager",
                                  message: `New approved order #${o.id} sent to your updates`,
                                  date: new Date().toISOString().slice(0, 10),
                                  read: false
                                },
                                ...s.notifications
                              ]
                            }));
                          }}
                        >
                          ✉️ Send
                        </button>
                      )
                    )}
                    <button className="btn btn-circle" onClick={() => setEditingOrder(o)} title="Edit Order">✏️</button>
                    <button className="btn btn-circle btn-circle-danger" onClick={() => remove(o.id)} title="Delete Order">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && <div className="empty">No orders yet.</div>}
        </div>
      </div>

      {show && (
        <CreateOrderModal
          onClose={() => setShow(false)}
          onSave={(customerName, productId, qty, assignedTo, assignedToName) => {
            const p = products.find((p) => p.id === productId)!;
            const orderId = uid("o");
            const notifId = uid("n");
            setState((s) => {
              let existingCust = s.customers.find(
                (c) => c.name.trim().toLowerCase() === customerName.trim().toLowerCase()
              );
              let targetCustomerId = existingCust?.id;
              let nextCustomers = s.customers;
              if (!targetCustomerId) {
                targetCustomerId = uid("c");
                const newCust = {
                  id: targetCustomerId,
                  name: customerName.trim(),
                  phone: "",
                  address: "",
                  email: "",
                  status: "Active"
                };
                nextCustomers = [...s.customers, newCust];
              }
              const finalCustomerName = existingCust ? existingCust.name : customerName.trim();
              return {
                ...s,
                customers: nextCustomers,
                orders: [
                  ...s.orders,
                  {
                    id: orderId,
                    customerId: targetCustomerId,
                    customerName: finalCustomerName,
                    productId,
                    productName: p.name,
                    qty,
                    total: qty * p.price,
                    createdBy: "manager",
                    status: "Pending",
                    date: new Date().toISOString().slice(0, 10),
                    assignedTo,
                    assignedToName
                  }
                ],
                notifications: [
                  {
                    id: notifId,
                    to: "superadmin",
                    from: "Manager",
                    message: `New order pending for ${finalCustomerName}`,
                    date: new Date().toISOString().slice(0, 10),
                    read: false
                  },
                  ...s.notifications
                ]
              };
            });
            setShow(false);
          }}
        />
      )}

      {editingOrder && (
        <CreateOrderModal
          initial={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={(customerName, productId, qty, assignedTo, assignedToName) => {
            const p = products.find((p) => p.id === productId)!;
            setState((s) => {
              let existingCust = s.customers.find(
                (c) => c.name.trim().toLowerCase() === customerName.trim().toLowerCase()
              );
              let targetCustomerId = existingCust?.id;
              let nextCustomers = s.customers;
              if (!targetCustomerId) {
                targetCustomerId = uid("c");
                const newCust = {
                  id: targetCustomerId,
                  name: customerName.trim(),
                  phone: "",
                  address: "",
                  email: "",
                  status: "Active"
                };
                nextCustomers = [...s.customers, newCust];
              }
              const finalCustomerName = existingCust ? existingCust.name : customerName.trim();
              const oldOrder = s.orders.find((o) => o.id === editingOrder.id);
              let updatedProducts = s.products;
              if (oldOrder && oldOrder.status === "Approved") {
                updatedProducts = s.products.map((p) => {
                  if (p.id === oldOrder.productId || p.name.toLowerCase() === oldOrder.productName.toLowerCase()) {
                    return {
                      ...p,
                      qty: (p.qty ?? p.stock ?? 0) + oldOrder.qty,
                      stock: (p.stock ?? p.qty ?? 0) + oldOrder.qty
                    };
                  }
                  return p;
                });
              }
              return {
                ...s,
                products: updatedProducts,
                customers: nextCustomers,
                orders: s.orders.map((o) => o.id === editingOrder.id ? {
                  ...o,
                  customerId: targetCustomerId,
                  customerName: finalCustomerName,
                  productId,
                  productName: p.name,
                  qty,
                  total: qty * p.price,
                  assignedTo,
                  assignedToName,
                  status: "Pending" // Reset to Pending on edit so Super Admin approves/rejects again
                } : o),
              };
            });
            setEditingOrder(null);
          }}
        />
      )}
    </>
  );
}

function CreateOrderModal({ initial, onSave, onClose }: { initial?: Order; onSave: (customerName: string, productId: string, qty: number, assignedTo: string, assignedToName: string) => void; onClose: () => void }) {
  const { customers, products, users } = useStore();
  const active = products.filter((p) => p.status === "Active" || p.status === "Verified");
  const employees = users.filter((u) => u.role === "employee");
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [productId, setProductId] = useState(initial?.productId ?? active[0]?.id ?? "");
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? employees[0]?.id ?? "");

  return (
    <Modal title={initial ? "Edit Order" : "Create Order"} onClose={onClose}>
      <div className="form-group"><label className="form-label">Customer</label>
        <input
          type="text"
          className="form-input"
          list="customers-datalist"
          placeholder="Type or select customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <datalist id="customers-datalist">
          {customers.map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
      </div>
      <div className="form-group"><label className="form-label">Product</label>
        <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {active.map((p) => <option key={p.id} value={p.id}>{p.name}{p.brand ? ` (${p.brand})` : ""}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Quantity</label>
        <input type="number" className="form-input" min={1} value={qty} onChange={(e) => setQty(+e.target.value)} />
      </div>
      <div className="form-group"><label className="form-label">Assign Employee</label>
        <select className="form-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
        </select>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => {
          if (customerName.trim() && productId && qty > 0 && assignedTo) {
            const emp = employees.find((e) => e.id === assignedTo)!;
            onSave(customerName.trim(), productId, qty, assignedTo, emp.name);
          }
        }}>{initial ? "Save Changes" : "Send for Approval"}</button>
      </div>
    </Modal>
  );
}

function ProductsAvail() {
  const { products, setState, uid } = useStore();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

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

  return (
    <>
      <h2 className="page-title">Product Availability</h2>
      <p className="page-sub">Read-only stock view.</p>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="📦" label="Total Products" value={totalProducts} onClick={() => setStockFilter("All")} />
        <StatCard icon="⚠️" label="Low Stock (< 20)" value={lowStockCount} onClick={() => setStockFilter("Low")} />
        <StatCard icon="📈" label="High Stock (≥ 50)" value={highStockCount} onClick={() => setStockFilter("High")} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Catalog ({filteredProducts.length})</h3>
          <div className="actions-row" style={{ alignItems: "center", gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
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
                  <td colSpan={5} className="empty">No products found matching filters.</td>
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
