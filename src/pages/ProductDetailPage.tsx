import { useEffect, useState } from "react";
import { useStore } from "../app/store";

interface Batch {
  id?: string;
  date?: string;
  qty?: number;
  stock?: number;
  cost?: number;
  incentive?: number;
  supplier?: string;
  status?: string;
  location?: string;
  _index?: number;
}

interface ProductData extends Batch {
  name: string;
  sku?: string;
  brand?: string;
  category?: string;
  warranty?: string;
  image?: string;
  price?: number;
  batches?: Batch[];
}

export function ProductDetailPage() {
  const [data, setData] = useState<ProductData | null>(null);
  const [role, setRole] = useState<string>("superadmin");
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const { setState } = useStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("product_detail_preview");
      if (raw) setData(JSON.parse(raw));

      const r = localStorage.getItem("product_detail_role");
      if (r) {
        setRole(r);
      } else {
        const userRaw = localStorage.getItem("sham_current_user_v2");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          setRole(u.role || "superadmin");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = (role === "manager") ? "/manager?tab=products" : "/super-admin?tab=products";
    }
  };

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Work Sans', sans-serif", background: "#F1F5F9" }}>
        <div style={{ textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ fontSize: 18, fontWeight: 600 }}>No product data found.</p>
          <button
            onClick={handleBack}
            style={{ marginTop: 16, background: "#2563EB", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
          >
            ← Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = role === "superadmin" || role === "admin";
  const batchList: Batch[] = (data.batches && data.batches.length > 0) ? data.batches : [data];
  const totalStock = data.qty ?? data.stock ?? 0;
  const defaultImg = "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600";

  const handleDeleteBatch = (idx: number) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;

    const updatedBatches = [...batchList];
    updatedBatches.splice(idx, 1);

    if (updatedBatches.length === 0) {
      setState((s) => ({
        ...s,
        products: s.products.filter((p) => p.id !== data.id)
      }));
      alert("Product deleted successfully.");
      handleBack();
      return;
    }

    const newQty = updatedBatches.reduce((acc, item) => acc + (item.qty ?? item.stock ?? 0), 0);
    const updatedData = { ...data, qty: newQty, stock: newQty, batches: updatedBatches };

    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === data.id ? ({ ...p, ...updatedData } as any) : p))
    }));

    setData(updatedData);
    localStorage.setItem("product_detail_preview", JSON.stringify(updatedData));
  };

  const handleSaveBatchEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || editingBatch._index === undefined) return;

    const idx = editingBatch._index;
    const updatedBatches = [...batchList];
    const bToSave = { ...editingBatch };
    delete bToSave._index;

    updatedBatches[idx] = bToSave;

    const newQty = updatedBatches.reduce((acc, item) => acc + (item.qty ?? item.stock ?? 0), 0);
    const updatedData = { ...data, ...bToSave, qty: newQty, stock: newQty, batches: updatedBatches };

    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === data.id ? ({ ...p, ...updatedData } as any) : p))
    }));

    setData(updatedData);
    localStorage.setItem("product_detail_preview", JSON.stringify(updatedData));
    setEditingBatch(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Work Sans', system-ui, sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Main Card (Styled exact like image 2 modal card) */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.15)",
            border: "1px solid #E2E8F0"
          }}
        >
          {/* Header Bar with Back Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={handleBack}
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "12px",
                  color: "#2563EB",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                ← Back
              </button>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#1E3A8A" }}>
                Product & Batch Details
              </h1>
            </div>
            {isAdmin && (
              <span style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                👑 Admin Mode
              </span>
            )}
          </div>

          {/* Top Product Summary Card (Light Blue) */}
          {/* Summary Card (Light Blue) */}
          <div
            style={{
              background: "#F0F6FE",
              border: "1px solid #DBEAFE",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px"
            }}
          >
            {/* Info Grid */}
            <div>
              <h2 style={{ margin: "0 0 12px 0", fontSize: "24px", fontWeight: 900, color: "#1E3A8A", textTransform: "capitalize" }}>
                {data.name}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px 20px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>SKU</span>
                  <strong style={{ color: "#1E3A8A" }}>{data.sku || "—"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>Brand</span>
                  <strong style={{ color: "#1E3A8A" }}>{data.brand || "—"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>Category</span>
                  <strong style={{ color: "#1E3A8A" }}>{data.category || "Electronics"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>Warranty</span>
                  <strong style={{ color: "#1E3A8A" }}>{data.warranty || "—"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>Location</span>
                  <strong style={{ color: "#1E3A8A" }}>{data.location || "Shop"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 500, marginRight: 8 }}>Total Stock</span>
                  <strong style={{ fontSize: "26px", color: "#2563EB", fontWeight: 900 }}>{totalStock}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Batch History */}
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 800, color: "#1E3A8A" }}>
            Batch History
          </h3>

          <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid #E2E8F0", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#F0F5FF", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>DATE ADDED</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>QUANTITY</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>UNIT COST</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>SUPPLIER</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                  {isAdmin && (
                    <th style={{ padding: "14px 18px", textAlign: "right", color: "#1E3A8A", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>ACTIONS</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {batchList.map((b, idx) => (
                  <tr key={b.id || idx} style={{ borderBottom: idx === batchList.length - 1 ? "none" : "1px solid #F1F5F9", background: idx % 2 === 0 ? "#FFFFFF" : "#FAFCFF" }}>
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ fontWeight: 600, color: "#1E293B" }}>
                        {b.date ? new Date(b.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </div>
                      {idx === batchList.length - 1 && (
                        <div style={{ fontSize: "10px", color: "#2563EB", marginTop: "2px", fontWeight: 700 }}>Latest Batch</div>
                      )}
                    </td>
                    <td style={{ padding: "16px 18px", fontWeight: 700, fontSize: "16px", color: "#1E293B" }}>{b.qty ?? b.stock ?? 0}</td>
                    <td style={{ padding: "16px 18px", color: "#1E293B" }}>₹{(b.cost || 0).toLocaleString()}</td>
                    <td style={{ padding: "16px 18px", color: "#475569" }}>{b.supplier || "—"}</td>
                    <td style={{ padding: "16px 18px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid #BFDBFE",
                          borderRadius: "999px",
                          fontSize: "12px",
                          padding: "4px 12px",
                          fontWeight: 700
                        }}
                      >
                        🛡 {b.status || "Verified"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: "16px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setEditingBatch({ ...b, _index: idx })}
                            title="Edit Batch"
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              border: "1px solid #BFDBFE",
                              background: "#FFFFFF",
                              color: "#2563EB",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px"
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(idx)}
                            title="Delete Batch"
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              border: "1px solid #FECACA",
                              background: "#FFFFFF",
                              color: "#EF4444",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px"
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Card (Price Increased / Difference) */}
          <div
            style={{
              background: "#F0F6FE",
              border: "1px solid #DBEAFE",
              borderRadius: "16px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px"
                }}
              >
                📈
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1D4ED8", letterSpacing: "0.3px" }}>
                  PRICE INCREASED
                </div>
                <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>
                  ₹{(data.cost || 0).toLocaleString()} → ₹{(data.cost || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px" }}>
                DIFFERENCE
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#2563EB" }}>
                +₹0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 450, width: "100%", boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)", border: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#1E3A8A" }}>✏️ Edit Batch Details</h3>
            <form onSubmit={handleSaveBatchEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Quantity</label>
                <input
                  type="number"
                  value={editingBatch.qty ?? editingBatch.stock ?? 0}
                  onChange={(e) => setEditingBatch({ ...editingBatch, qty: Number(e.target.value), stock: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Unit Cost (₹)</label>
                <input
                  type="number"
                  value={editingBatch.cost || 0}
                  onChange={(e) => setEditingBatch({ ...editingBatch, cost: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Supplier</label>
                <input
                  type="text"
                  value={editingBatch.supplier || ""}
                  onChange={(e) => setEditingBatch({ ...editingBatch, supplier: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Incentive (₹)</label>
                <input
                  type="number"
                  value={editingBatch.incentive || 0}
                  onChange={(e) => setEditingBatch({ ...editingBatch, incentive: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Location</label>
                <select
                  value={editingBatch.location || "Shop"}
                  onChange={(e) => setEditingBatch({ ...editingBatch, location: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, background: "#fff" }}
                >
                  <option value="Shop">Shop</option>
                  <option value="Godown 1">Godown 1</option>
                  <option value="Godown 2">Godown 2</option>
                  <option value="Display">Display</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
