// Cart that uses the API when logged in, localStorage when guest.
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getCart, addCartItem, updateCartQty, removeCartItem, clearCart } from "../api";

const KEY = "rainz_cart";
const CartContext = createContext(null);

const readGuest = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (user) {
      setLoading(true);
      try { setItems(await getCart()); } catch { setItems([]); } finally { setLoading(false); }
    } else {
      setItems(readGuest());
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveGuest = (next) => { setItems(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const add = async (product, { size = null, color = null, qty = 1 } = {}) => {
    if (user) {
      await addCartItem({ product_id: product.id, size, color, qty });
      await load();
    } else {
      const next = [...items];
      const i = next.findIndex((x) => x.id === product.id && x.size === size && x.color === color);
      if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + qty };
      else next.push({
        cartId: `${product.id}-${size}-${color}-${Date.now()}`,
        id: product.id, slug: product.slug, name: product.name, image: product.image,
        price: product.price, oldPrice: product.oldPrice, size, color, qty,
      });
      saveGuest(next);
    }
  };

  const setQty = async (item, qty) => {
    qty = Math.max(1, qty);
    if (user) { await updateCartQty(item.cartId, qty); await load(); }
    else saveGuest(items.map((x) => (x.cartId === item.cartId ? { ...x, qty } : x)));
  };

  const remove = async (item) => {
    if (user) { await removeCartItem(item.cartId); await load(); }
    else saveGuest(items.filter((x) => x.cartId !== item.cartId));
  };

  const clear = async () => {
    if (user) { await clearCart(); setItems([]); }
    else saveGuest([]);
  };

  const count = items.reduce((n, i) => n + (i.qty || 1), 0);
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, loading, add, setQty, remove, clear, reload: load }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
