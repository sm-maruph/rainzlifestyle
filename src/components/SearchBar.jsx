// src/components/SearchBar.jsx — search input with live product suggestions dropdown
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { getProducts } from "../api";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x100/f3f4f6/9ca3af?text=RAINZ"; };

export default function SearchBar({ className = "", placeholder = "Search for products, brands and more", onNavigate }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1); // keyboard-highlighted index
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced fetch of suggestions
  const fetchSuggestions = useCallback((q) => {
    if (!q.trim() || q.trim().length < 2) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    getProducts({ search: q.trim(), pageSize: 6 })
      .then((res) => { setSuggestions(res.items || []); })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(term), 300);
    return () => clearTimeout(debounceRef.current);
  }, [term, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goToResults = (q) => {
    const query = (q ?? term).trim();
    if (!query) return;
    setOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const goToProduct = (p) => {
    setOpen(false);
    setTerm("");
    onNavigate?.();
    navigate(`/product/${p.slug}`);
  };

  const onSubmit = (e) => { e.preventDefault(); goToResults(); };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); goToProduct(suggestions[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const clear = () => { setTerm(""); setSuggestions([]); setActive(-1); };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit} className="flex items-center bg-gray-100 rounded-md px-4 py-2.5">
        <input
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => term.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {term && (
          <button type="button" onClick={clear} aria-label="Clear" className="text-gray-400 mr-1"><CloseIcon style={{ fontSize: 16 }} /></button>
        )}
        <button type="submit" aria-label="Search" className="text-gray-500"><SearchIcon fontSize="small" /></button>
      </form>

      {/* Suggestions dropdown */}
      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[60] bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-10 rounded bg-gray-100" />
                  <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-2/3" /><div className="mt-1 h-3 bg-gray-100 rounded w-1/4" /></div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No matches. Press Enter to search all products.</div>
          ) : (
            <>
              <ul className="max-h-[360px] overflow-y-auto">
                {suggestions.map((p, i) => (
                  <li key={p.id ?? p.slug}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => goToProduct(p)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
                      style={{ backgroundColor: active === i ? "#f9fafb" : "transparent" }}
                    >
                      <img src={p.image} alt={p.name} className="h-12 w-10 rounded object-cover bg-gray-100 shrink-0" onError={imgFallback} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{p.name}</p>
                        {p.brand && <p className="text-[11px] text-gray-400 truncate">{p.brand}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: "var(--title)" }}>{taka(p.price)}</p>
                        {p.oldPrice && <p className="text-[11px] text-gray-400 line-through">{taka(p.oldPrice)}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => goToResults()} className="w-full text-center text-sm font-semibold py-2.5 border-t border-gray-100 hover:bg-gray-50" style={{ color: BRAND }}>
                See all results for "{term.trim()}" &rarr;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
