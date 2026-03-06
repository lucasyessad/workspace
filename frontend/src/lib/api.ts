import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: object) => api.post("/auth/register", data),
  createOrg: (data: object) => api.post("/auth/organizations", data),
  me: () => api.get("/auth/me"),
  updateOrgProfile: (data: object) => api.patch("/auth/organizations/me", data),
};

// ─── Buildings ────────────────────────────────────────────────────────────────
export const buildingsApi = {
  listProjects: () => api.get("/buildings/projects"),
  createProject: (data: object) => api.post("/buildings/projects", data),
  listBuildings: () => api.get("/buildings"),
  getBuilding: (id: string) => api.get(`/buildings/${id}`),
  createBuilding: (data: object) => api.post("/buildings", data),
  updateBuilding: (id: string, data: object) => api.put(`/buildings/${id}`, data),
  listSystems: (bid: string) => api.get(`/buildings/${bid}/systems`),
  createSystem: (bid: string, data: object) =>
    api.post(`/buildings/${bid}/systems`, { ...data, building_id: bid }),
  listEnvelopes: (bid: string) => api.get(`/buildings/${bid}/envelopes`),
  createEnvelope: (bid: string, data: object) =>
    api.post(`/buildings/${bid}/envelopes`, { ...data, building_id: bid }),
  listBills: (bid: string) => api.get(`/buildings/${bid}/bills`),
  createBill: (bid: string, data: object) =>
    api.post(`/buildings/${bid}/bills`, { ...data, building_id: bid }),
};

// ─── Audits ───────────────────────────────────────────────────────────────────
export const auditsApi = {
  list: () => api.get("/audits"),
  create: (data: object) => api.post("/audits", data),
  get: (id: string) => api.get(`/audits/${id}`),
  update: (id: string, data: object) => api.patch(`/audits/${id}`, data),
  calculate: (id: string) => api.post(`/audits/${id}/calculate`),
};

// ─── Scenarios ────────────────────────────────────────────────────────────────
export const scenariosApi = {
  list: (auditId?: string) =>
    api.get("/scenarios", { params: auditId ? { audit_id: auditId } : {} }),
  create: (data: object) => api.post("/scenarios", data),
  get: (id: string) => api.get(`/scenarios/${id}`),
  simulate: (auditId: string) => api.post(`/scenarios/${auditId}/simulate`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  list: () => api.get("/reports"),
  create: (data: object) => api.post("/reports", data),
  downloadPdf: (id: string) =>
    api.get(`/reports/${id}/pdf`, { responseType: "blob" }),
};

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billingApi = {
  getPlans: () => api.get("/billing/plans"),
  getSubscription: () => api.get("/billing/subscription"),
  upgrade: (plan: string) => api.post("/billing/upgrade", { plan }),
};

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeysApi = {
  list: () => api.get("/apikeys"),
  create: (data: object) => api.post("/apikeys", data),
  revoke: (id: string) => api.delete(`/apikeys/${id}`),
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export const exportsApi = {
  downloadAuditsXlsx: () =>
    api.get("/exports/audits/xlsx", { responseType: "blob" }),
  downloadScenariosXlsx: (auditId?: string) =>
    api.get("/exports/scenarios/xlsx", {
      responseType: "blob",
      params: auditId ? { audit_id: auditId } : {},
    }),
};

// ─── ML ───────────────────────────────────────────────────────────────────────
export const mlApi = {
  predict: (data: object) => api.post("/ml/predict", data),
  predictForAudit: (auditId: string) => api.get(`/ml/predict/${auditId}`),
};
