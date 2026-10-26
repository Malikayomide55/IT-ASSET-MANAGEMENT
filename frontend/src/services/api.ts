const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  department: string | null;
  assigned_to: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  status: "Available" | "Assigned" | "Under Repair" | "Retired";
  notes: string | null;
  created_at: string;
}

export interface AssetInput {
  asset_tag: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  department?: string;
  assigned_to?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  status: Asset["status"];
  notes?: string;
}

export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  asset_tag?: string;
  asset_name?: string;
  issue_description: string;
  technician: string | null;
  repair_cost: string | number;
  status: "Open" | "In Progress" | "Completed";
  reported_at: string;
  completed_at: string | null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result as T;
}

export const api = {
  getAssets(search = "") {
    return request<{ success: boolean; data: Asset[]; count: number }>(
      `/assets?search=${encodeURIComponent(search)}`
    );
  },

  getStats() {
    return request<{
      success: boolean;
      data: {
        total: number;
        available: number;
        assigned: number;
        under_repair: number;
        retired: number;
        warranty_expiring: number;
      };
    }>("/assets/stats");
  },

  createAsset(data: AssetInput) {
    return request<{ success: boolean; data: Asset }>("/assets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAsset(id: number, data: Partial<AssetInput>) {
    return request<{ success: boolean; data: Asset }>(`/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteAsset(id: number) {
    return request<{ success: boolean; message: string }>(`/assets/${id}`, {
      method: "DELETE",
    });
  },

  getMaintenance() {
    return request<{
      success: boolean;
      data: MaintenanceRecord[];
    }>("/maintenance");
  },

  createMaintenance(data: {
    asset_id: number;
    issue_description: string;
    technician?: string;
    repair_cost?: number;
  }) {
    return request<{ success: boolean; data: MaintenanceRecord }>(
      "/maintenance",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  updateMaintenance(
    id: number,
    data: {
      status?: MaintenanceRecord["status"];
      technician?: string;
      repair_cost?: number;
    }
  ) {
    return request<{ success: boolean; data: MaintenanceRecord }>(
      `/maintenance/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },
};