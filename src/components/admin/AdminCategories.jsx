// src/components/admin/AdminCategories.jsx — wired to the real API
import { useEffect, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import {
  getCategoriesRaw,
  createCategory, updateCategory, deleteCategory,
  createCategoryGroup, updateCategoryGroup, deleteCategoryGroup,
  createSubcategory, deleteSubcategory,
} from "../../api";

const BRAND = "#E11D48";
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const PRESET_ACCENTS = ["#E11D48", "#DB2777", "#F59E0B", "#0D9488", "#7C3AED", "#2563EB", "#16A34A", "#EA580C"];

export default function AdminCategories() {
  const [cats, setCats] = useState([]);     // [{id,name,slug,accent,groups:[{id,title,subcategories:[{id,name,slug}]}]}]
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // { mode, id?, name, accent, slug? }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getCategoriesRaw()
      .then((data) => {
        setCats(data);
        setSelectedId((prev) => (prev && data.some((c) => c.id === prev) ? prev : data[0]?.id || null));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const sel = cats.find((c) => c.id === selectedId) || null;
  const patchCat = (id, patch) => setCats((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const guard = async (fn) => { setError(""); setBusy(true); try { await fn(); } catch (e) { setError(e.message || "Action failed"); } finally { setBusy(false); } };

  // ===== category-level =====
  const saveModal = () =>
    guard(async () => {
      const name = modal.name.trim();
      if (!name) return;
      if (modal.mode === "add") {
        const slug = slugify(name);
        if (cats.some((c) => c.slug === slug)) { setError("A category with that name already exists."); return; }
        const created = await createCategory({ name, slug, accent: modal.accent, is_active: true, position: cats.length }, modal.file);
        setCats((list) => [...list, { ...created, image: created.image || null, groups: [], category_groups: [] }]);
        setSelectedId(created.id);
      } else {
        const updated = await updateCategory(modal.id, { name, accent: modal.accent }, modal.file);
        patchCat(modal.id, { name: updated.name, accent: updated.accent, image: updated.image ?? undefined });
      }
      setModal(null);
    });

  const removeCategory = (cat) =>
    guard(async () => {
      if (!window.confirm(`Delete category "${cat.name}" and all its subcategories?`)) return;
      await deleteCategory(cat.id);
      setCats((list) => {
        const next = list.filter((c) => c.id !== cat.id);
        if (selectedId === cat.id) setSelectedId(next[0]?.id || null);
        return next;
      });
    });

  // ===== group-level =====
  const addGroup = () =>
    guard(async () => {
      const g = await createCategoryGroup({ category_id: sel.id, title: "New Group", position: sel.groups.length });
      patchCat(sel.id, { groups: [...sel.groups, { id: g.id, title: g.title, subcategories: [] }] });
    });

  const setGroupTitleLocal = (groupId, title) =>
    patchCat(sel.id, { groups: sel.groups.map((g) => (g.id === groupId ? { ...g, title } : g)) });

  const commitGroupTitle = (group) =>
    guard(async () => { await updateCategoryGroup(group.id, { title: group.title.trim() || "Untitled" }); });

  const removeGroup = (groupId) =>
    guard(async () => {
      await deleteCategoryGroup(groupId);
      patchCat(sel.id, { groups: sel.groups.filter((g) => g.id !== groupId) });
    });

  // ===== subcategory-level =====
  const addSub = (groupId, name) =>
    guard(async () => {
      const v = name.trim();
      if (!v) return;
      const s = await createSubcategory({ group_id: groupId, name: v });
      patchCat(sel.id, {
        groups: sel.groups.map((g) => (g.id === groupId ? { ...g, subcategories: [...g.subcategories, { id: s.id, name: s.name, slug: s.slug }] } : g)),
      });
    });

  const removeSub = (groupId, subId) =>
    guard(async () => {
      await deleteSubcategory(subId);
      patchCat(sel.id, {
        groups: sel.groups.map((g) => (g.id === groupId ? { ...g, subcategories: g.subcategories.filter((s) => s.id !== subId) } : g)),
      });
    });

  const totalSubs = (c) => (c.groups || []).reduce((n, g) => n + g.subcategories.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${cats.length} categories`}</p>
        </div>
        <button onClick={() => setModal({ mode: "add", name: "", accent: BRAND })} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> Add Category
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ===== Category list ===== */}
        <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white p-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 m-1 bg-gray-100 rounded-lg animate-pulse" />)
          ) : cats.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No categories yet.</p>
          ) : (
            cats.map((c) => {
              const active = c.id === selectedId;
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${active ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                  <span className="h-8 w-8 rounded-lg shrink-0" style={{ backgroundColor: `${c.accent}22`, border: `2px solid ${c.accent}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.groups.length} groups · {totalSubs(c)} subcategories</p>
                  </div>
                  {active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />}
                </button>
              );
            })
          )}
        </div>

        {/* ===== Selected category detail ===== */}
        <div className="lg:col-span-2 space-y-4">
          {!sel ? (
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-400">Select a category to manage its subcategories.</div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-lg" style={{ backgroundColor: `${sel.accent}22`, border: `2px solid ${sel.accent}` }} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sel.name}</h3>
                    <p className="text-xs text-gray-400">/{sel.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal({ mode: "edit", id: sel.id, name: sel.name, accent: sel.accent, slug: sel.slug, image: sel.image })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><EditOutlinedIcon style={{ fontSize: 17 }} /> Edit</button>
                  <button onClick={() => removeCategory(sel)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><DeleteOutlineIcon style={{ fontSize: 17 }} /> Delete</button>
                </div>
              </div>

              {sel.groups.map((g) => (
                <div key={g.id} className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      value={g.title}
                      onChange={(e) => setGroupTitleLocal(g.id, e.target.value)}
                      onBlur={() => commitGroupTitle(g)}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                      className="flex-1 min-w-0 text-sm font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-gray-400 outline-none py-1"
                    />
                    <button onClick={() => removeGroup(g.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete group"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {g.subcategories.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-1.5 py-1 text-sm text-gray-700">
                        {s.name}
                        <button onClick={() => removeSub(g.id, s.id)} className="h-4 w-4 rounded-full hover:bg-gray-300 flex items-center justify-center text-gray-500"><CloseIcon style={{ fontSize: 13 }} /></button>
                      </span>
                    ))}
                    {g.subcategories.length === 0 && <span className="text-xs text-gray-400 py-1">No subcategories yet.</span>}
                  </div>

                  <AddItemInput accent={sel.accent} onAdd={(v) => addSub(g.id, v)} />
                </div>
              ))}

              <button onClick={addGroup} disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 disabled:opacity-60">
                <CreateNewFolderOutlinedIcon style={{ fontSize: 18 }} /> Add Group
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== Add / Edit category modal ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{modal.mode === "add" ? "Add Category" : "Edit Category"}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Category name</span>
                <input autoFocus value={modal.name} onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") saveModal(); }} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400" placeholder="e.g. Footwear" />
                {modal.name && modal.mode === "add" && <span className="text-xs text-gray-400 mt-1 block">URL: /{slugify(modal.name)}</span>}
              </label>
              <div>
                <span className="text-xs font-medium text-gray-500">Category image</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {modal.preview || modal.image ? (
                      <img src={modal.preview || modal.image} alt="category" className="h-full w-full object-cover" />
                    ) : (
                      <AddPhotoAlternateOutlinedIcon style={{ color: "#9ca3af" }} />
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {modal.image || modal.preview ? "Change image" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setModal((m) => ({ ...m, file: f, preview: URL.createObjectURL(f) }));
                      e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Accent color</span>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {PRESET_ACCENTS.map((c) => (
                    <button key={c} onClick={() => setModal((m) => ({ ...m, accent: c }))} className="h-8 w-8 rounded-full border-2 transition-transform" style={{ backgroundColor: c, borderColor: modal.accent === c ? "#111827" : "transparent", transform: modal.accent === c ? "scale(1.1)" : "none" }} />
                  ))}
                  <label className="h-8 w-8 rounded-full border border-gray-200 overflow-hidden cursor-pointer relative" title="Custom color">
                    <input type="color" value={modal.accent} onChange={(e) => setModal((m) => ({ ...m, accent: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="block h-full w-full" style={{ backgroundColor: modal.accent }} />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={saveModal} disabled={busy} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>{modal.mode === "add" ? "Add Category" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemInput({ onAdd, accent }) {
  const [v, setV] = useState("");
  const submit = () => { onAdd(v); setV(""); };
  return (
    <div className="mt-3 flex gap-2">
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} placeholder="Add subcategory…" className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gray-400" />
      <button onClick={submit} className="rounded-md px-3 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Add</button>
    </div>
  );
}
