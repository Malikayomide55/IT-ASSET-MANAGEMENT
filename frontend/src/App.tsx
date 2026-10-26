
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { api } from "./services/api";
import type {
  Asset,
  AssetInput,
  MaintenanceRecord,
} from "./services/api";

import "./App.css";


type Page = "Dashboard" | "Assets" | "Maintenance";

const emptyForm: AssetInput = {
  asset_tag: "",
  name: "",
  category: "Laptop",
  brand: "",
  model: "",
  serial_number: "",
  department: "",
  assigned_to: "",
  purchase_date: "",
  warranty_expiry: "",
  status: "Available",
  notes: "",
};

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [form, setForm] = useState<AssetInput>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAssets = useCallback(async () => {
    const result = await api.getAssets(search);
    setAssets(result.data);
  }, [search]);

  const loadMaintenance = useCallback(async () => {
    const result = await api.getMaintenance();
    setMaintenance(result.data);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAssets(), loadMaintenance()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load data. Check the backend and database."
      );
    } finally {
      setLoading(false);
    }
  }, [loadAssets, loadMaintenance]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function updateForm(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submitAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingId !== null) {
        await api.updateAsset(editingId, form);
        setNotice("Asset updated successfully.");
      } else {
        await api.createAsset(form);
        setNotice("Asset registered successfully.");
      }

      setForm({ ...emptyForm });
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save asset.");
    } finally {
      setSaving(false);
    }
  }

  function editAsset(asset: Asset) {
    setEditingId(asset.id);
    setForm({
      asset_tag: asset.asset_tag,
      name: asset.name,
      category: asset.category,
      brand: asset.brand || "",
      model: asset.model || "",
      serial_number: asset.serial_number || "",
      department: asset.department || "",
      assigned_to: asset.assigned_to || "",
      purchase_date: asset.purchase_date?.slice(0, 10) || "",
      warranty_expiry: asset.warranty_expiry?.slice(0, 10) || "",
      status: asset.status,
      notes: asset.notes || "",
    });

    setPage("Assets");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteAsset(asset: Asset) {
    if (!window.confirm(`Delete ${asset.asset_tag} — ${asset.name}?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await api.deleteAsset(asset.id);
      setNotice("Asset deleted successfully.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete asset.");
    }
  }

  async function completeMaintenance(record: MaintenanceRecord) {
    try {
      await api.updateMaintenance(record.id, { status: "Completed" });
      setNotice("Maintenance record completed.");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update maintenance."
      );
    }
  }

  const total = assets.length;
  const available = assets.filter((a) => a.status === "Available").length;
  const assigned = assets.filter((a) => a.status === "Assigned").length;
  const repairs = assets.filter((a) => a.status === "Under Repair").length;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <strong>MARVTECH</strong>
            <small>ASSET MANAGEMENT</small>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        {(["Dashboard", "Assets", "Maintenance"] as Page[]).map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? "active" : ""}`}
            onClick={() => setPage(item)}
          >
            <span>{item === "Dashboard" ? "▦" : item === "Assets" ? "▣" : "⚙"}</span>
            {item}
          </button>
        ))}

        <div className="sidebar-footer">
          <span className="online-dot" />
          System workspace
          <small>Student project</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">IT OPERATIONS / ASSETS</p>
            <h1>{page}</h1>
            <p className="subtitle">
              Manage company equipment and maintenance activities.
            </p>
          </div>
          <div className="admin-chip">
            <span className="avatar">A</span>
            <span>
              <strong>Administrator</strong>
              <small>Local workspace</small>
            </span>
          </div>
        </header>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="alert success" role="status">
            {notice}
            <button onClick={() => setNotice("")}>Dismiss</button>
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <span className="welcome-tag">OVERVIEW</span>
                <h2>Your equipment, all in one place.</h2>
                <p>
                  Monitor inventory, track assigned devices, and keep repairs
                  moving.
                </p>
              </div>
              <button
                className="primary-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...emptyForm });
                  setPage("Assets");
                }}
              >
                + Register asset
              </button>
            </section>

            <section className="stats-grid">
              <Stat label="Total assets" value={total} icon="▣" />
              <Stat label="Available" value={available} icon="✓" />
              <Stat label="Assigned" value={assigned} icon="↗" />
              <Stat label="Under repair" value={repairs} icon="⚙" />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent assets</h2>
                  <p>Latest equipment registered in your system.</p>
                </div>
                <button className="text-btn" onClick={() => setPage("Assets")}>
                  View all assets →
                </button>
              </div>
              <AssetTable
                assets={assets.slice(0, 5)}
                loading={loading}
                onEdit={editAsset}
                onDelete={deleteAsset}
              />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Maintenance overview</h2>
                  <p>Track open repairs and completed work.</p>
                </div>
                <button
                  className="text-btn"
                  onClick={() => setPage("Maintenance")}
                >
                  View maintenance →
                </button>
              </div>
              <p className="maintenance-summary">
                <strong>
                  {maintenance.filter((m) => m.status !== "Completed").length}
                </strong>{" "}
                maintenance task(s) still open or in progress.
              </p>
            </section>
          </>
        )}

        {page === "Assets" && (
          <>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>{editingId ? "Edit asset" : "Register new asset"}</h2>
                  <p>
                    Fields marked * are required. Asset tags must be unique.
                  </p>
                </div>
              </div>

              <form className="asset-form" onSubmit={submitAsset}>
                <Field label="Asset tag *">
                  <input
                    name="asset_tag"
                    required
                    value={form.asset_tag}
                    onChange={updateForm}
                    placeholder="MFP-LAP-001"
                  />
                </Field>

                <Field label="Equipment name *">
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Office laptop"
                  />
                </Field>

                <Field label="Category *">
                  <select
                    name="category"
                    required
                    value={form.category}
                    onChange={updateForm}
                  >
                    {["Laptop", "Desktop", "Printer", "Router", "Switch", "UPS", "Other"].map(
                      (category) => (
                        <option key={category}>{category}</option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Brand">
                  <input name="brand" value={form.brand} onChange={updateForm} />
                </Field>

                <Field label="Model">
                  <input name="model" value={form.model} onChange={updateForm} />
                </Field>

                <Field label="Serial number">
                  <input
                    name="serial_number"
                    value={form.serial_number}
                    onChange={updateForm}
                  />
                </Field>

                <Field label="Department">
                  <input
                    name="department"
                    value={form.department}
                    onChange={updateForm}
                  />
                </Field>

                <Field label="Assigned to">
                  <input
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={updateForm}
                  />
                </Field>

                <Field label="Purchase date">
                  <input
                    name="purchase_date"
                    type="date"
                    value={form.purchase_date}
                    onChange={updateForm}
                  />
                </Field>

                <Field label="Warranty expiry">
                  <input
                    name="warranty_expiry"
                    type="date"
                    value={form.warranty_expiry}
                    onChange={updateForm}
                  />
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateForm}
                  >
                    {["Available", "Assigned", "Under Repair", "Retired"].map(
                      (status) => (
                        <option key={status}>{status}</option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Notes">
                  <input name="notes" value={form.notes} onChange={updateForm} />
                </Field>

                <div className="form-actions">
                  <button className="primary-btn" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save changes"
                        : "Register asset"}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setEditingId(null);
                        setForm({ ...emptyForm });
                      }}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="panel">
              <div className="panel-heading assets-heading">
                <div>
                  <h2>Asset register</h2>
                  <p>{assets.length} matching asset(s)</p>
                </div>
                <input
                  className="search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tag, name, brand..."
                />
              </div>
              <AssetTable
                assets={assets}
                loading={loading}
                onEdit={editAsset}
                onDelete={deleteAsset}
              />
            </section>
          </>
        )}

        {page === "Maintenance" && (
          <MaintenanceSection
            assets={assets}
            records={maintenance}
            onCreated={refresh}
            onComplete={completeMaintenance}
            onError={setError}
            onNotice={setNotice}
          />
        )}

        <footer>
          MARVTECH FIX PRO · IT Asset Management System
        </footer>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>Current inventory</small>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function AssetTable({
  assets,
  loading,
  onEdit,
  onDelete,
}: {
  assets: Asset[];
  loading: boolean;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}) {
  if (loading) return <p className="empty-state">Loading assets...</p>;
  if (!assets.length) {
    return (
      <p className="empty-state">
        No assets found. Register an asset to get started.
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Category</th>
            <th>Department</th>
            <th>Assigned to</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <strong>{asset.name}</strong>
                <small>{asset.asset_tag}</small>
              </td>
              <td>{asset.category}</td>
              <td>{asset.department || "—"}</td>
              <td>{asset.assigned_to || "—"}</td>
              <td>
                <span
                  className={`status status-${asset.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {asset.status}
                </span>
              </td>
              <td>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(asset)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(asset)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaintenanceSection({
  assets,
  records,
  onCreated,
  onComplete,
  onError,
  onNotice,
}: {
  assets: Asset[];
  records: MaintenanceRecord[];
  onCreated: () => Promise<void>;
  onComplete: (record: MaintenanceRecord) => Promise<void>;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const [assetId, setAssetId] = useState("");
  const [issue, setIssue] = useState("");
  const [technician, setTechnician] = useState("");
  const [cost, setCost] = useState("0");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError("");
    onNotice("");

    setSaving(true);

    try {
      await api.createMaintenance({
        asset_id: Number(assetId),
        issue_description: issue,
        technician,
        repair_cost: Number(cost),
      });

      setIssue("");
      setTechnician("");
      setCost("0");
      onNotice("Maintenance request created.");
      await onCreated();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Could not create maintenance."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Report a fault</h2>
            <p>Register a repair against an existing asset.</p>
          </div>
        </div>

        <form className="asset-form" onSubmit={submit}>
          <Field label="Asset *">
            <select
              required
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
            >
              <option value="">Select an asset</option>
              {assets
                .filter((asset) => asset.status !== "Retired")
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_tag} — {asset.name}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Issue description *">
            <input
              required
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              placeholder="Describe the fault"
            />
          </Field>

          <Field label="Technician">
            <input
              value={technician}
              onChange={(event) => setTechnician(event.target.value)}
              placeholder="Technician name"
            />
          </Field>

          <Field label="Estimated repair cost">
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </Field>

          <div className="form-actions">
            <button className="primary-btn" disabled={saving || !assets.length}>
              {saving ? "Submitting..." : "Create repair request"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Maintenance records</h2>
            <p>All recorded repairs and reported faults.</p>
          </div>
        </div>

        {!records.length ? (
          <p className="empty-state">No maintenance records yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Technician</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.asset_tag}</strong>
                      <small>{record.asset_name}</small>
                    </td>
                    <td>{record.issue_description}</td>
                    <td>{record.technician || "—"}</td>
                    <td>
                      ₦{Number(record.repair_cost).toLocaleString("en-NG")}
                    </td>
                    <td>
                      <span className="status">{record.status}</span>
                    </td>
                    <td>
                      {record.status !== "Completed" ? (
                        <button
                          className="edit-btn"
                          onClick={() => void onComplete(record)}
                        >
                          Complete
                        </button>
                      ) : (
                        "Done"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default App;