import { api } from "./apiClient";
import { mapCartItem } from "./mappers";

export const getCart = async () => (await api.get("/cart")).items.map(mapCartItem);
export const addCartItem = (payload) => api.post("/cart", payload); // {product_id,size,color,qty}
export const updateCartQty = (cartId, qty) => api.patch(`/cart/${cartId}`, { qty });
export const removeCartItem = (cartId) => api.del(`/cart/${cartId}`);
export const clearCart = () => api.del("/cart");
