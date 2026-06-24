import { api } from "./apiClient";
import { mapBanner, mapCollection, mapStore } from "./mappers";

export const getBanners = async () => (await api.get("/banners")).items.map(mapBanner);
export const getCollections = async () => (await api.get("/collections")).items.map(mapCollection);
export const getStores = async () => (await api.get("/stores")).items.map(mapStore);

// admin
export const createBanner = (b) => api.post("/banners", b);
export const createCollection = (c) => api.post("/collections", c);
export const createStore = (s) => api.post("/stores", s);
