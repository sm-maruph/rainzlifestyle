// src/components/admin/AdminCollections.jsx — manage homepage Banners + Collection tiles
import { useEffect, useMemo, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import {
  getBannersAdmin, createBanner, updateBanner, deleteBanner,
  getCollectionsAdmin, createCollection, updateCollection, deleteCollection,
} from "../../api";

const BRAND = "#E11D48";

const EMPTY = { id: null, title: "", caption: "", link: "", position: 0, isActive: true, image: "", file: null, preview: "" };

export default function AdminCollections() {
  const [tab, setTab] = useState("banners"); // 'banners' | 'collections'
  const [banners, setBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // EMPTY shape + mode

  const isBanners = tab === "banners";
  const rows = isBanners ? banners : collections;

  const load = () => {
    setLoading(true);
    Promise.all([getBannersAdmin(), getCollectionsAdmin()])
      .then(([b, c]) => { setBanners(b); setCollections(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ ...EMPTY, mode: "add", position: rows.length });
  const openEdit = (r) => setModal({
    mode: "edit", id: r.id, title: r.title || "", caption: r.caption || "", link: r.link || "",
    position: r.position ?? 0, isActive: r.isActive !== false, image: r.image || "", file: null, preview: "",
  });
  const close = () => setModal(null);
  const setField = (k, v) => setModal((m) => ({ ...m, [k]: v }));

  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (f) setModal((m) => ({ ...m, file: f, preview: URL.createObjectURL(f) }));
    e.target.value = "";
  };

  const save = async () => {
    if (!modal.title.trim() && isBanners) { setError("Title is required."); return; }
    if (modal.mode === "add" && !modal.file) { setError("Please upload an image."); return; }
    setSaving(true); setError("");
    const body = {
      title: modal.title.trim(),
      link: modal.link.trim() || null,
      position: Number(modal.position) || 0,
      is_active: modal.isActive,
    };
    if (!isBanners) body.caption = modal.caption.trim() || null;

    try {
      if (isBanners) {
        if (modal.mode === "add") await createBanner(body, modal.file);
        else await updateBanner(modal.id, body, modal.file);
      } else {
        if (modal.mode === "add") await createCollection(body, modal.file);
        else await updateCollection(modal.id, body, modal.file);
      }
      close();
      load();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title || "this item"}"?`)) return;
    setError("");
    try {
      if (isBanners) await deleteBanner(r.id); else await deleteCollection(r.id);
      load();
    } catch (e) { setError(e.message); }
  };

  const tabBtn = (key, label, n) => (
    <button onClick={() => setTab(key)} className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
      style={tab === key ? { backgroundColor: BRAND, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#4b5563" }}>
      {label} <span className={tab === key ? "text-white/80" : "text-gray-400"}>({n})</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Homepage Showcase</h2>
          <p className="text-sm text-gray-500">Manage the promo banners and collection tiles on the storefront.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> Add {isBanners ? "Banner" : "Collection"}
        </button>
      </div>

      <div className="flex gap-2">{tabBtn("banners", "Banners", banners.length)}{tabBtn("collections", "Collections", collections.length)}</div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />)
        ) : rows.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">No {isBanners ? "banners" : "collections"} yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <div className={`bg-gray-100 ${isBanners ? "aspect-[12/5]" : "aspect-square"}`}>
                <img src={r.image} alt={r.title} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=RAINZ"; }} />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{r.title || "(untitled)"}</p>
                    {!isBanners && r.caption && <p className="text-xs text-gray-400 truncate">{r.caption}</p>}
                    <p className="text-[11px] text-gray-400 truncate">{r.link || "—"}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.isActive !== false ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {r.isActive !== false ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                  <button onClick={() => remove(r)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{modal.mode === "add" ? "Add" : "Edit"} {isBanners ? "Banner" : "Collection"}</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image */}
              <div>
                <span className="text-xs font-medium text-gray-500">Image {isBanners ? "(wide ~1200×500)" : "(square ~700×700)"}</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className={`overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center ${isBanners ? "h-16 w-36" : "h-20 w-20"}`}>
                    {modal.preview || modal.image ? <img src={modal.preview || modal.image} alt="" className="h-full w-full object-cover" /> : <AddPhotoAlternateOutlinedIcon style={{ color: "#9ca3af" }} />}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {modal.image || modal.preview ? "Change image" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
                  </label>
                </div>
              </div>

              <Field label={`Title${isBanners ? " *" : ""}`}><input value={modal.title} onChange={(e) => setField("title", e.target.value)} className="inp" placeholder={isBanners ? "Summer Essentials" : "Men"} /></Field>
              {!isBanners && <Field label="Caption"><input value={modal.caption} onChange={(e) => setField("caption", e.target.value)} className="inp" placeholder="Everyday staples" /></Field>}
              <Field label="Link (where it goes)"><input value={modal.link} onChange={(e) => setField("link", e.target.value)} className="inp" placeholder="/men  or  /sale" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Position"><input type="number" value={modal.position} onChange={(e) => setField("position", e.target.value)} className="inp" /></Field>
                <label className="flex items-end gap-2 text-sm text-gray-600 pb-2">
                  <input type="checkbox" checked={modal.isActive} onChange={(e) => setField("isActive", e.target.checked)} style={{ accentColor: BRAND }} /> Active (visible)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (<label className="block"><span className="text-xs font-medium text-gray-500">{label}</span><div className="mt-1">{children}</div></label>);
}
