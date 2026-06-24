// src/components/admin/AdminProducts.jsx — production, wired to the real API
import { useEffect, useMemo, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import StarIcon from "@mui/icons-material/Star";
import {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getCategoriesRaw,
} from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const pctOff = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);

const COLOR_HEX = {
  black: "#111827", white: "#f9fafb", red: "#ef4444", blue: "#3b82f6", navy: "#1e3a8a",
  green: "#22c55e", grey: "#9ca3af", gray: "#9ca3af", pink: "#ec4899", yellow: "#eab308",
  purple: "#8b5cf6", brown: "#92400e", beige: "#e7d8b1", olive: "#6b7280", maroon: "#7f1d1d",
};
const toColorObjs = (csv) =>
  String(csv).split(",").map((s) => s.trim()).filter(Boolean)
    .map((name) => ({ name, hex: COLOR_HEX[name.toLowerCase()] || "#9ca3af" }));
const csvToArr = (csv) => String(csv).split(",").map((s) => s.trim()).filter(Boolean);

const EMPTY_FORM = {
  id: null, slug: "", name: "", brand: "", category_id: "", subcategory_id: "",
  price: "", oldPrice: "", stock: "", sizes: "", colors: "", description: "", tags: "",
};

function toForm(p) {
  return {
    id: p.id, slug: p.slug || "", name: p.name || "", brand: p.brand || "",
    category_id: p.category_id || "", subcategory_id: p.subcategory_id || "",
    price: p.price ?? "", oldPrice: p.oldPrice ?? "",
    stock: p.stock ?? (p.inStock ? 0 : 0),
    sizes: (p.sizes || []).join(", "),
    colors: (p.colors || []).map((c) => (typeof c === "string" ? c : c.name)).join(", "),
    description: p.description || "", tags: (p.tags || []).join(", "),
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]); // URLs already saved (edit)
  const [files, setFiles] = useState([]);                   // new File objects to upload
  const [previews, setPreviews] = useState([]);             // object URLs for the new files

  const loadProducts = () => {
    setLoading(true);
    getProducts({ pageSize: 60 })
      .then((res) => setProducts(res.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    getCategoriesRaw().then(setCats).catch(() => {});
  }, []);

  const catNames = useMemo(() => cats.map((c) => c.name), [cats]);

  const subOptions = useMemo(() => {
    const cat = cats.find((c) => c.id === form.category_id);
    if (!cat) return [];
    return (cat.groups || []).flatMap((g) => (g.subcategories || []).map((s) => ({ id: s.id, name: s.name })));
  }, [cats, form.category_id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const cat = p.categoryName || p.category;
      if (catFilter !== "All" && cat !== catFilter) return false;
      if (stockFilter === "In" && !p.inStock) return false;
      if (stockFilter === "Out" && p.inStock) return false;
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, catFilter, stockFilter]);

  const resetImages = () => { setExistingImages([]); setFiles([]); setPreviews([]); };

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); resetImages(); setModalLoading(false); setModalOpen(true); };

  const openEdit = async (p) => {
    setErrors({}); resetImages(); setForm(toForm(p)); setModalOpen(true); setModalLoading(true);
    try {
      const full = await getProductBySlug(p.slug); // full row: sizes, colors, stock, description, images
      setForm(toForm(full));
      setExistingImages(full.images && full.images.length ? full.images : full.image ? [full.image] : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setModalLoading(false);
    }
  };

  const close = () => setModalOpen(false);
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPickImages = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) {
      setFiles((prev) => [...prev, ...picked]);
      setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    }
    e.target.value = "";
  };
  const removeNewFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };
  const makeCoverNewFile = (i) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; const [x] = a.splice(i, 1); a.unshift(x); return a; });
    setPreviews((prev) => { const a = [...prev]; const [x] = a.splice(i, 1); a.unshift(x); return a; });
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Name is required";
    if (form.price === "" || Number(form.price) < 0) er.price = "Valid price required";
    if (form.oldPrice !== "" && Number(form.oldPrice) <= Number(form.price)) er.oldPrice = "Old price must exceed price";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true); setError("");
    const base = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      category_id: form.category_id || undefined,
      subcategory_id: form.subcategory_id || undefined,
      price: Number(form.price),
      old_price: form.oldPrice === "" ? undefined : Number(form.oldPrice),
      stock: Number(form.stock || 0),
      sizes: csvToArr(form.sizes),
      colors: toColorObjs(form.colors),
      tags: csvToArr(form.tags),
    };
    try {
      if (form.id) {
        await updateProduct(form.id, base, files);       // slug stays stable on edit
      } else {
        await createProduct({ ...base, slug: undefined }, files); // backend slugifies the name
      }
      setModalOpen(false);
      loadProducts();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    setError("");
    try { await deleteProduct(p.id); setProducts((list) => list.filter((x) => x.id !== p.id)); }
    catch (e) { setError(e.message); }
  };

  const gallery = [
    ...existingImages.map((src) => ({ src, kind: "existing" })),
    ...previews.map((src, i) => ({ src, kind: "new", i })),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${products.length} total products`}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> Add Product
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center rounded-lg border border-gray-200 px-3 bg-white focus-within:border-gray-400">
          <SearchIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or brand" className="flex-1 min-w-0 px-2 py-2.5 text-sm outline-none bg-transparent" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-gray-400">
          <option value="All">All categories</option>
          {catNames.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-gray-400">
          <option value="All">All stock</option>
          <option value="In">In stock</option>
          <option value="Out">Out of stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50"><td className="py-3 px-4" colSpan={5}><div className="h-10 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No products found. Click “Add Product”.</td></tr>
              ) : (
                filtered.map((p) => {
                  const off = pctOff(p);
                  const imgCount = (p.images && p.images.length) || (p.image ? 1 : 0);
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img src={p.image} alt={p.name} className="h-12 w-10 rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x48/f3f4f6/9ca3af?text=R"; }} />
                            {imgCount > 1 && <span className="absolute -bottom-1 -right-1 text-[9px] font-bold text-white px-1 rounded" style={{ backgroundColor: "#111827" }}>{imgCount}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[220px]">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate">{p.brand || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{p.categoryName || p.category || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{taka(p.price)}</span>
                          {off > 0 && <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>-{off}%</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {p.inStock
                          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">In stock</span>
                          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Out of stock</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Edit"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                          <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Add / Edit modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900">{form.id ? "Edit Product" : "Add Product"}</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              {modalLoading && <div className="text-sm text-gray-400">Loading product…</div>}

              {/* Images */}
              <div>
                <span className="text-xs font-medium text-gray-500">Product images <span className="text-gray-400">(first is the cover)</span></span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {gallery.map((g, idx) => (
                    <div key={`${g.kind}-${idx}`} className="relative h-24 w-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={g.src} alt={`img-${idx}`} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x96/f3f4f6/9ca3af?text=R"; }} />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 text-[10px] font-bold text-white text-center py-0.5 flex items-center justify-center gap-0.5" style={{ backgroundColor: BRAND }}>
                          <StarIcon style={{ fontSize: 11 }} /> Cover
                        </span>
                      )}
                      {g.kind === "new" ? (
                        <>
                          {idx !== 0 && (
                            <button onClick={() => makeCoverNewFile(g.i)} className="absolute bottom-0 inset-x-0 text-[10px] font-semibold text-white text-center py-0.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">Set cover</button>
                          )}
                          <button onClick={() => removeNewFile(g.i)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/90 text-gray-600 hover:text-red-600 flex items-center justify-center shadow" title="Remove"><CloseIcon style={{ fontSize: 13 }} /></button>
                        </>
                      ) : (
                        <span className="absolute top-1 left-1 text-[9px] font-semibold text-white px-1 rounded bg-black/50">saved</span>
                      )}
                    </div>
                  ))}

                  <label className="h-24 w-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:border-gray-400 hover:text-gray-600">
                    <AddPhotoAlternateOutlinedIcon style={{ fontSize: 22 }} />
                    <span className="text-[10px] font-semibold">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={onPickImages} className="hidden" />
                  </label>
                </div>
                {form.id && existingImages.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">Saved images stay as-is; new uploads are appended to the gallery.</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name *" error={errors.name}><input value={form.name} onChange={(e) => setField("name", e.target.value)} className="inp" placeholder="Cotton Polo Shirt" /></Field>
                <Field label="Brand"><input value={form.brand} onChange={(e) => setField("brand", e.target.value)} className="inp" placeholder="RAINZ" /></Field>
                <Field label="Category">
                  <select value={form.category_id} onChange={(e) => { setField("category_id", e.target.value); setField("subcategory_id", ""); }} className="inp">
                    <option value="">— none —</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <select value={form.subcategory_id} onChange={(e) => setField("subcategory_id", e.target.value)} className="inp" disabled={!form.category_id}>
                    <option value="">— none —</option>
                    {subOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Price (৳) *" error={errors.price}><input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} className="inp" placeholder="990" /></Field>
                <Field label="Old price (৳)" error={errors.oldPrice}><input type="number" value={form.oldPrice} onChange={(e) => setField("oldPrice", e.target.value)} className="inp" placeholder="1290 (optional)" /></Field>
                <Field label="Stock quantity"><input type="number" value={form.stock} onChange={(e) => setField("stock", e.target.value)} className="inp" placeholder="25" /></Field>
                <Field label="Sizes (comma separated)"><input value={form.sizes} onChange={(e) => setField("sizes", e.target.value)} className="inp" placeholder="S, M, L, XL" /></Field>
                <Field label="Colors (comma separated)"><input value={form.colors} onChange={(e) => setField("colors", e.target.value)} className="inp" placeholder="Black, White, Navy" /></Field>
                <Field label="Tags (comma separated)"><input value={form.tags} onChange={(e) => setField("tags", e.target.value)} className="inp" placeholder="new, summer" /></Field>
              </div>

              <Field label="Description"><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} className="inp resize-none" placeholder="Short product description…" /></Field>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving || modalLoading} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                {saving ? "Saving…" : form.id ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}
