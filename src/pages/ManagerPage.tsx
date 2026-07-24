import { EmployeeIncentiveSection, OrderDocumentModal } from "./EmployeePage";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, User, Customer, Order } from "../app/store";
import { DashboardLayout, StatCard, Pill, Modal, NavItem, BarChart } from "../app/DashboardLayout";
import { NotificationsSection, ProfileSection, EmployeeForm, EmployeeWorkDetailsModal, LeadsSection, DashboardLeadPipelineOverview, UpcomingFollowUps, TasksAssignSection, TaskAssignmentSection, ProductForm } from "./SuperAdminPage";
import { UnifiedEmployeeCard } from "../components/UnifiedEmployeeCard";

const NAV: NavItem[] = [
  { key: "overview", label: "Live Dashboard", icon: "📡" },
  { key: "products", label: "Product Availability", icon: "📦" },
  { key: "leads", label: "Lead Generation", icon: "🧲" },
  { key: "assign", label: "Add Employee", icon: "📋" },
  { key: "task-assign", label: "Task Assign", icon: "📝" },
  { key: "orders", label: "Orders", icon: "🧾" },
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
  const { orders, products, setState, uid } = useStore();
  const [show, setShow] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [activeDoc, setActiveDoc] = useState<{ order: Order; type: "Bill" | "Order Copy" } | null>(null);

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
            const isIncentiveOrder = product && (product.incentive ?? 0) > 0;

            const orderBasePrice = Math.round(o.total / (1 - ((o.discount || 0) / 100)));
            const orderUnitPrice = Math.round(orderBasePrice / o.qty);

            return (
              <div key={o.id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <h4 className="data-card-title">Order #{o.id}</h4>
                    <span className="data-card-subtitle" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span>{o.date}</span>
                      {isIncentiveOrder ? (
                        <span className="pill" style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fde047", fontSize: "10px", padding: "2px 6px" }}>
                          ✨ Incentive
                        </span>
                      ) : (
                        <span className="pill" style={{ background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", fontSize: "10px", padding: "2px 6px" }}>
                          Regular
                        </span>
                      )}
                      {o.docType && (
                        <span className="pill" style={{
                          background: o.docType === "Bill" ? "#e0f2fe" : "#f3e8ff",
                          color: o.docType === "Bill" ? "#0369a1" : "#6b21a8",
                          border: o.docType === "Bill" ? "1px solid #bae6fd" : "1px solid #e9d5ff",
                          fontSize: "10px",
                          padding: "2px 6px",
                          fontWeight: 600
                        }}>
                          {o.docType === "Bill" ? "🧾 Bill" : "📄 Order Copy"}
                        </span>
                      )}
                      {o.docType === "Order Copy" && o.bookingExpiryDate && (
                        o.bookingExpiryDate < new Date().toISOString().slice(0, 10) ? (
                          <span className="pill" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", fontSize: "10px", padding: "2px 6px", fontWeight: 800 }}>
                            🚨 Booking Expired ({o.bookingExpiryDate})
                          </span>
                        ) : (
                          <span className="pill" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: "10px", padding: "2px 6px", fontWeight: 600 }}>
                            ⏳ Valid Until {o.bookingExpiryDate}
                          </span>
                        )
                      )}
                    </span>
                  </div>
                  <div><Pill status={o.status} /></div>
                </div>
                <div className="data-card-body">
                  <div className="data-row"><span className="data-label">Customer</span><span className="data-value">{o.customerName}</span></div>
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value">{o.productName}{brandStr} (x{o.qty})</span></div>
                  <div className="data-row"><span className="data-label">Unit Price</span><span className="data-value">₹{orderUnitPrice.toLocaleString()}</span></div>
                  <div className="data-row"><span className="data-label">Assigned</span><span className="data-value">{o.assignedToName ?? "—"}</span></div>
                  {o.discount ? (
                    <div className="data-row"><span className="data-label">Discount</span><span className="data-value" style={{ color: "#dc2626" }}>{o.discount}%</span></div>
                  ) : null}
                </div>
                <div className="data-card-footer" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontWeight: 700, color: "var(--brown-dark)", fontSize: 16 }}>₹{o.total.toLocaleString()}</span>
                  <div className="actions-row" style={{ flexWrap: "wrap", gap: "4px" }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: 11, border: "1px solid #e2e8f0" }} onClick={() => setActiveDoc({ order: o, type: "Bill" })}>🧾 Bill</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: 11, border: "1px solid #e2e8f0" }} onClick={() => setActiveDoc({ order: o, type: "Order Copy" })}>📄 Order Copy</button>

                    {o.status === "Approved" && (
                      o.sentToEmployee ? (
                        <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, marginRight: 4, alignSelf: "center" }}>Sent ✅</span>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ padding: "4px 8px", fontSize: 11 }}
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
                    {o.status === "Approved" && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => {
                          if (confirm("Mark this order as delivered?")) {
                            setState((s) => ({
                              ...s,
                              orders: s.orders.map((ord) => ord.id === o.id ? { ...ord, status: "Delivered" } : ord)
                            }));
                          }
                        }}
                      >
                        🚚 Deliver
                      </button>
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
          onSave={(customerName, productId, qty, assignedTo, assignedToName, customerBargain, docType, bookingExpiryDate) => {
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
              const docLabel = docType === "Bill" ? "Bill" : "Order Copy";
              const expiryStr = docType === "Order Copy" && bookingExpiryDate ? ` (Valid Until: ${bookingExpiryDate})` : "";
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
                    assignedToName,
                    customerBargain,
                    docType,
                    bookingExpiryDate
                  }
                ],
                notifications: [
                  {
                    id: notifId,
                    to: "superadmin",
                    from: "Manager",
                    message: `New ${docLabel} order pending for ${finalCustomerName}${expiryStr}`,
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
          onSave={(customerName, productId, qty, assignedTo, assignedToName, customerBargain, docType, bookingExpiryDate) => {
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
                  customerBargain,
                  docType,
                  bookingExpiryDate,
                  status: "Pending" // Reset to Pending on edit so Super Admin approves/rejects again
                } : o),
              };
            });
            setEditingOrder(null);
          }}
        />
      )}

      {activeDoc && (
        <OrderDocumentModal
          order={activeDoc.order}
          type={activeDoc.type}
          onClose={() => setActiveDoc(null)}
        />
      )}
    </>
  );
}

function CreateOrderModal({ initial, onSave, onClose }: { initial?: Order; onSave: (customerName: string, productId: string, qty: number, assignedTo: string, assignedToName: string, customerBargain?: string, docType?: "Bill" | "Order Copy", bookingExpiryDate?: string, discountPct?: number) => void; onClose: () => void }) {
  const { customers, products, users } = useStore();
  const active = products.filter((p) => p.status === "Active" || p.status === "Verified");
  const employees = users.filter((u) => u.role === "employee");
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [productId, setProductId] = useState(initial?.productId ?? active[0]?.id ?? "");
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [discountPct, setDiscountPct] = useState<number | "">(initial?.discount ?? "");
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? employees[0]?.id ?? "");
  const [customerBargain, setCustomerBargain] = useState(initial?.customerBargain ?? "");
  const [docType, setDocType] = useState<"Bill" | "Order Copy">(initial?.docType ?? "Bill");
  const [bookingExpiryDate, setBookingExpiryDate] = useState(
    initial?.bookingExpiryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedProduct = active.find((p) => p.id === productId);
  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const baseTotal = unitPrice * qty;
  const discountVal = discountPct ? Math.round(((Number(discountPct) || 0) / 100) * baseTotal) : 0;
  const finalTotal = Math.max(0, baseTotal - discountVal);

  const handleSave = () => {
    setErrorMsg("");
    if (!customerName.trim()) {
      setErrorMsg("Please enter customer name.");
      return;
    }
    if (!productId || qty <= 0) {
      setErrorMsg("Please select a product and valid quantity.");
      return;
    }
    if (!assignedTo) {
      setErrorMsg("Please assign an employee.");
      return;
    }

    const emp = employees.find((e) => e.id === assignedTo)!;
    onSave(
      customerName.trim(),
      productId,
      qty,
      assignedTo,
      emp ? emp.name : "Employee",
      customerBargain.trim(),
      docType,
      docType === "Order Copy" ? bookingExpiryDate : undefined,
      Number(discountPct) || 0
    );

    setSuccessMsg(initial ? "Order updated successfully!" : "Order sent to Admin for approval successfully!");
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal title={initial ? "Edit Order" : "➕ Create Order"} onClose={onClose}>
      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "14px" }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="form-group"><label className="form-label">Customer Name *</label>
          <input
            type="text"
            className="form-input"
            list="customers-datalist"
            placeholder="Type or select customer name"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              const found = customers.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
              if (found) {
                if (found.phone) setCustomerPhone(found.phone);
                if (found.address) setCustomerAddress(found.address);
              }
            }}
          />
          <datalist id="customers-datalist">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Customer phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Customer address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group"><label className="form-label">Product *</label>
          <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {active.map((p) => <option key={p.id} value={p.id}>{p.name}{p.brand ? ` (${p.brand})` : ""} - ₹{p.price.toLocaleString()}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group"><label className="form-label">Quantity *</label>
            <input type="number" className="form-input" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value))} />
          </div>
          <div className="form-group"><label className="form-label">Discount (%)</label>
            <input
              type="number"
              className="form-input"
              min={0}
              max={100}
              placeholder="0%"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group"><label className="form-label">Assign Employee *</label>
          <select className="form-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Document Type *</label>
          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <label style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: docType === "Bill" ? "2px solid #0284c7" : "1px solid var(--border)",
              background: docType === "Bill" ? "#f0f9ff" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              color: docType === "Bill" ? "#0369a1" : "inherit"
            }}>
              <input
                type="radio"
                name="docTypeSelectMgr"
                value="Bill"
                checked={docType === "Bill"}
                onChange={() => setDocType("Bill")}
              />
              🧾 Bill
            </label>
            <label style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: docType === "Order Copy" ? "2px solid #9333ea" : "1px solid var(--border)",
              background: docType === "Order Copy" ? "#faf5ff" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              color: docType === "Order Copy" ? "#6b21a8" : "inherit"
            }}>
              <input
                type="radio"
                name="docTypeSelectMgr"
                value="Order Copy"
                checked={docType === "Order Copy"}
                onChange={() => setDocType("Order Copy")}
              />
              📄 Order Copy
            </label>
          </div>
        </div>

        {docType === "Order Copy" && (
          <div className="form-group" style={{ background: "#faf5ff", padding: "14px", borderRadius: "12px", border: "1px solid #e9d5ff", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" style={{ color: "#6b21a8", margin: 0 }}>⏳ Booking Expiry Date *</label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#7e22ce" }}>
                📅 {bookingExpiryDate ? new Date(bookingExpiryDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Select Date"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "2px 0" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b21a8", alignSelf: "center" }}>Quick Set:</span>
              {[
                { label: "+7 Days", days: 7 },
                { label: "+15 Days", days: 15 },
                { label: "+30 Days (1 Month)", days: 30 },
                { label: "+60 Days (2 Months)", days: 60 },
              ].map((preset) => {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + preset.days);
                const iso = targetDate.toISOString().slice(0, 10);
                const isSelected = bookingExpiryDate === iso;

                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setBookingExpiryDate(iso)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: isSelected ? "1.5px solid #7e22ce" : "1px solid #d8b4fe",
                      background: isSelected ? "#7e22ce" : "#fff",
                      color: isSelected ? "#fff" : "#6b21a8",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <input
              type="date"
              className="form-input"
              value={bookingExpiryDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setBookingExpiryDate(e.target.value)}
            />
            <span style={{ fontSize: "11px", color: "#7e22ce", marginTop: "2px", display: "block" }}>
              Expiration alert will be sent to Admin if not fulfilled by this date.
            </span>
          </div>
        )}

        <div className="form-group"><label className="form-label">Customer Bargaining / Remarks</label>
          <input type="text" className="form-input" placeholder="E.g. Wants 10% discount or ₹80" value={customerBargain} onChange={(e) => setCustomerBargain(e.target.value)} />
        </div>

        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
            <span>Subtotal ({qty}x):</span>
            <span>₹{baseTotal.toLocaleString()}</span>
          </div>
          {discountVal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#dc2626", marginTop: "4px" }}>
              <span>Discount ({discountPct}%):</span>
              <span>- ₹{discountVal.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "6px", borderTop: "1px dashed #cbd5e1", paddingTop: "6px" }}>
            <span>Total Payable:</span>
            <span>₹{finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="modal-actions" style={{ marginTop: "20px" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{initial ? "Save Changes" : "Send for Approval"}</button>
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
