// Wishlist: API when logged in, localStorage when guest.
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addWishlistItem, removeWishlistItem } from "../api";

const KEY = "rainz_wishlist";
const WishlistContext = createContext(null);

const readGuest = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (user) {
      setLoading(true);
      try { setItems(await getWishlist()); } catch { setItems([]); } finally { setLoading(false); }
    } else {
      setItems(readGuest());
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveGuest = (next) => { setItems(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const has = (id) => items.some((p) => p.id === id);

  const add = async (product) => {
    if (has(product.id)) return;
    if (user) { await addWishlistItem(product.id); await load(); }
    else saveGuest([product, ...items]);
  };

  const remove = async (productId) => {
    if (user) { await removeWishlistItem(productId); await load(); }
    else saveGuest(items.filter((p) => p.id !== productId));
  };

  const toggle = (product) => (has(product.id) ? remove(product.id) : add(product));

  return (
    <WishlistContext.Provider value={{ items, count: items.length, loading, has, add, remove, toggle, reload: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
