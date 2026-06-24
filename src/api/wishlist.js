import { api } from "./apiClient";
import { mapWishlistItem } from "./mappers";

export const getWishlist = async () => (await api.get("/wishlist")).items.map(mapWishlistItem);
export const addWishlistItem = (product_id) => api.post("/wishlist", { product_id });
export const removeWishlistItem = (product_id) => api.del(`/wishlist/${product_id}`);
