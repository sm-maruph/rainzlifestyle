import { api } from "./apiClient";

export const getSizeCharts = (includeInactive = false) =>
  api.get(includeInactive ? "/size-charts/all" : "/size-charts");

export const createSizeChart = (fields) => api.post("/size-charts", fields);
export const updateSizeChart = (id, fields) => api.put(`/size-charts/${id}`, fields);
export const deleteSizeChart = (id) => api.del(`/size-charts/${id}`);
