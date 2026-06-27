// src/components/admin/AdminHero.jsx — manage the homepage Hero carousel slides
import { useEffect, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { getHeroSlidesAdmin, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../../api";

const BRAND = "#E11D48";
const EMPTY = { id: null, title: "", subtitle: "", buttonText: "", link: "", position: 0, isActive: true, image: "", file: null, preview: "" };

export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    getHeroSlidesAdmin().then(setSlides).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ ...EMPTY, mode: "add", position: slides.length });
  const openEdit = (s) => setModal({
    mode: "edit", id: s.id, title: s.title, subtitle: s.subtitle, buttonText: s.buttonText,
    link: s.link, position: s.position, isActive: s.isActive, image: s.image, file: null, preview: "",
  });
  const close = () => setModal(null);
  const setField = (k, v) => setModal((m) => ({ ...m, [k]: v }));
  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (f) setModal((m) => ({ ...m, file: f, preview: URL.createObjectURL(f) }));
    e.target.value = "";
  };

  const save = async () => {
    if (modal.mode === "add" && !modal.file) { setError("Please upload an image."); return; }
    setSaving(true); setError("");
    const body = {
      title: modal.title.trim() || null,
      subtitle: modal.subtitle.trim() || null,
      button_text: modal.buttonText.trim() || null,
      link: modal.link.trim() || null,
      position: Number(modal.position) || 0,
      is_active: modal.isActive,
    };
    try {
      if (modal.mode === "add") await createHeroSlide(body, modal.file);
      else await updateHeroSlide(modal.id, body, modal.file);
      close(); load();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete "${s.title || "this slide"}"?`)) return;
    setError("");
    try { await deleteHeroSlide(s.id); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Hero Banners</h2>
          <p className="text-sm text-gray-500">Full-width slides at the top of the homepage.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> Add Slide
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)
        ) : slides.length === 0 ? (
          <div className="text-center text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl">No hero slides yet. Click “Add Slide”.</div>
        ) : (
          slides.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3">
              <div className="h-20 w-40 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/320x160/f3f4f6/9ca3af?text=Hero"; }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 truncate">{s.title || "(no title)"}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.isActive ? "Active" : "Hidden"}</span>
                  <span className="text-[10px] text-gray-400">#{s.position}</span>
                </div>
                {s.subtitle && <p className="text-xs text-gray-500 truncate">{s.subtitle}</p>}
                <p className="text-[11px] text-gray-400 truncate">{s.buttonText ? `[${s.buttonText}] → ` : ""}{s.link || "—"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                <button onClick={() => remove(s)} className="p-2 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{modal.mode === "add" ? "Add" : "Edit"} Hero Slide</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Image (wide ~1600×600)</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-16 w-36 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {modal.preview || modal.image ? <img src={modal.preview || modal.image} alt="" className="h-full w-full object-cover" /> : <AddPhotoAlternateOutlinedIcon style={{ color: "#9ca3af" }} />}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {modal.image || modal.preview ? "Change image" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
                  </label>
                </div>
              </div>

              <Field label="Title"><input value={modal.title} onChange={(e) => setField("title", e.target.value)} className="inp" placeholder="New Arrivals 2026" /></Field>
              <Field label="Subtitle"><input value={modal.subtitle} onChange={(e) => setField("subtitle", e.target.value)} className="inp" placeholder="Fresh styles just dropped" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Button text"><input value={modal.buttonText} onChange={(e) => setField("buttonText", e.target.value)} className="inp" placeholder="Shop Now" /></Field>
                <Field label="Link"><input value={modal.link} onChange={(e) => setField("link", e.target.value)} className="inp" placeholder="/new-arrivals" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Position"><input type="number" value={modal.position} onChange={(e) => setField("position", e.target.value)} className="inp" /></Field>
                <label className="flex items-end gap-2 text-sm text-gray-600 pb-2">
                  <input type="checkbox" checked={modal.isActive} onChange={(e) => setField("isActive", e.target.checked)} style={{ accentColor: BRAND }} /> Active
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add Slide" : "Save Changes"}
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
