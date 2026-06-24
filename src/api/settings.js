import { api } from "./apiClient";
export const getSettings = () => api.get("/settings");
export const updateSettings = (body) => api.put("/settings", body);
