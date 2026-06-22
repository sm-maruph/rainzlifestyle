// src/components/admin/AdminCategories.jsx
import { useEffect, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import { getCategories } from "../../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const PRESET_ACCENTS = ["#E11D48", "#DB2777", "#F59E0B", "#0D9488", "#7C3AED", "#2563EB", "#16A34A", "#EA580C"];

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // slug
  const [modal, setModal] = useState(null); // { mode:'add'|'edit', name, accent, slug }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCategories()
      .then((tree) => {
        if (!alive) return;
        const norm = (tree || []).map((c) => ({
          name: c.name,
          slug: c.slug || slugify(c.name),
          accent: c.accent || BRAND,
          groups: (c.groups || []).map((g) => ({ title: g.title, items: [...(g.items || [])] })),
        }));
        setCats(norm);
        setSelected(norm[0]?.slug || null);
      })
      .catch(() => alive && setCats([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const sel = cats.find((c) => c.slug === selected) || null;

  // ===== category-level =====
  const patchCat = (slug, patch) =>
    setCats((list) => list.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));

  const saveModal = () => {
    const name = modal.name.trim();
    if (!name) return;
    if (modal.mode === "add") {
      const slug = slugify(name);
      if (cats.some((c) => c.slug === slug)) { alert("A category with that name already exists."); return; }
      const cat = { name, slug, accent: modal.accent, groups: [] };
      setCats((list) => [...list, cat]);
      setSelected(slug);
    } else {
      patchCat(modal.slug, { name, accent: modal.accent }); // keep slug stable on rename
    }
    setModal(null);
  };

  const deleteCat = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    if (!window.confirm(`Delete category "${c?.name}" and all its subcategories?`)) return;
    setCats((list) => {
      const next = list.filter((x) => x.slug !== slug);
      if (selected === slug) setSelected(next[0]?.slug || null);
      return next;
    });
  };

  // ===== group-level =====
  const addGroup = () =>
    patchCat(sel.slug, { groups: [...sel.groups, { title: "New Group", items: [] }] });
  const setGroupTitle = (gi, title) =>
    patchCat(sel.slug, { groups: sel.groups.map((g, i) => (i === gi ? { ...g, title } : g)) });
  const deleteGroup = (gi) =>
    patchCat(sel.slug, { groups: sel.groups.filter((_, i) => i !== gi) });

  // ===== item-level (subcategories) =====
  const addItem = (gi, item) => {
    const v = item.trim();
    if (!v) return;
    patchCat(sel.slug, {
      groups: sel.groups.map((g, i) =>
        i === gi ? { ...g, items: g.items.includes(v) ? g.items : [...g.items, v] } : g
      ),
    });
  };
  const deleteItem = (gi, ii) =>
    patchCat(sel.slug, {
      groups: sel.groups.map((g, i) => (i === gi ? { ...g, items: g.items.filter((_, k) => k !== ii) } : g)),
    });

  const totalSubs = (c) => (c.groups || []).reduce((n, g) => n + g.items.length, 0);

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

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ===== Category list ===== */}
        <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white p-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 m-1 bg-gray-100 rounded-lg animate-pulse" />)
          ) : cats.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No categories yet.</p>
          ) : (
            cats.map((c) => {
              const active = c.slug === selected;
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelected(c.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${active ? "bg-gray-50" : "hover:bg-gray-50"}`}
                >
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
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-400">
              Select a category to manage its subcategories.
            </div>
          ) : (
            <>
              {/* Category header */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-lg" style={{ backgroundColor: `${sel.accent}22`, border: `2px solid ${sel.accent}` }} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sel.name}</h3>
                    <p className="text-xs text-gray-400">/{sel.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal({ mode: "edit", name: sel.name, accent: sel.accent, slug: sel.slug })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <EditOutlinedIcon style={{ fontSize: 17 }} /> Edit
                  </button>
                  <button onClick={() => deleteCat(sel.slug)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    <DeleteOutlineIcon style={{ fontSize: 17 }} /> Delete
                  </button>
                </div>
              </div>

              {/* Groups */}
              {sel.groups.map((g, gi) => (
                <div key={gi} className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      value={g.title}
                      onChange={(e) => setGroupTitle(gi, e.target.value)}
                      className="flex-1 min-w-0 text-sm font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-gray-400 outline-none py-1"
                    />
                    <button onClick={() => deleteGroup(gi)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete group">
                      <DeleteOutlineIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>

                  {/* Items / subcategories */}
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((item, ii) => (
                      <span key={ii} className="inline-flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-1.5 py-1 text-sm text-gray-700">
                        {item}
                        <button onClick={() => deleteItem(gi, ii)} className="h-4 w-4 rounded-full hover:bg-gray-300 flex items-center justify-center text-gray-500">
                          <CloseIcon style={{ fontSize: 13 }} />
                        </button>
                      </span>
                    ))}
                    {g.items.length === 0 && <span className="text-xs text-gray-400 py-1">No subcategories yet.</span>}
                  </div>

                  <AddItemInput accent={sel.accent} onAdd={(v) => addItem(gi, v)} />
                </div>
              ))}

              <button onClick={addGroup} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700">
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
                <input
                  autoFocus
                  value={modal.name}
                  onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") saveModal(); }}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  placeholder="e.g. Footwear"
                />
                {modal.name && <span className="text-xs text-gray-400 mt-1 block">URL: /{slugify(modal.name)}</span>}
              </label>

              <div>
                <span className="text-xs font-medium text-gray-500">Accent color</span>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {PRESET_ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setModal((m) => ({ ...m, accent: c }))}
                      className="h-8 w-8 rounded-full border-2 transition-transform"
                      style={{ backgroundColor: c, borderColor: modal.accent === c ? "#111827" : "transparent", transform: modal.accent === c ? "scale(1.1)" : "none" }}
                    />
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
              <button onClick={saveModal} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
                {modal.mode === "add" ? "Add Category" : "Save Changes"}
              </button>
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
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        placeholder="Add subcategory…"
        className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gray-400"
      />
      <button onClick={submit} className="rounded-md px-3 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Add</button>
    </div>
  );
}
