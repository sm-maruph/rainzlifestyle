import { useEffect, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { createSizeChart, deleteSizeChart, getSizeCharts, updateSizeChart } from "../../api";

const BRAND = "#000000";
const blank = () => ({
  id: null,
  name: "",
  title: "Size chart",
  note: "Expected deviation < 3%",
  columns: [
    { key: "size", label: "Size" },
    { key: "chest", label: "Chest (round)" },
    { key: "length", label: "Length" },
    { key: "sleeve", label: "Sleeve" },
  ],
  rows: [{ size: "S", chest: "", length: "", sleeve: "" }],
  is_active: true,
});
const keyFromLabel = (label, index) => {
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return key && /^[a-z]/.test(key) ? key : `measurement_${index + 1}`;
};

export default function AdminSizeCharts() {
  const [charts, setCharts] = useState([]);
  const [form, setForm] = useState(blank());
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => getSizeCharts(true).then(setCharts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const startAdd = () => { setForm(blank()); setOpen(true); };
  const startEdit = (chart) => {
    setForm({
      ...chart,
      columns: chart.columns.map((column) => ({ ...column })),
      rows: chart.rows.map((row) => ({ ...row })),
    });
    setOpen(true);
  };
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const changeColumn = (index, label) => {
    setForm((current) => {
      const oldKey = current.columns[index].key;
      const nextKey = index === 0 ? "size" : keyFromLabel(label, index);
      const columns = current.columns.map((column, i) => i === index ? { key: nextKey, label } : column);
      const rows = current.rows.map((row) => {
        if (oldKey === nextKey) return row;
        const next = { ...row, [nextKey]: row[oldKey] ?? "" };
        delete next[oldKey];
        return next;
      });
      return { ...current, columns, rows };
    });
  };
  const addColumn = () => setForm((current) => {
    const index = current.columns.length;
    const column = { key: `measurement_${index}`, label: "Measurement" };
    return { ...current, columns: [...current.columns, column], rows: current.rows.map((row) => ({ ...row, [column.key]: "" })) };
  });
  const removeColumn = (index) => {
    if (index === 0) return;
    setForm((current) => {
      const key = current.columns[index].key;
      return {
        ...current,
        columns: current.columns.filter((_, i) => i !== index),
        rows: current.rows.map((row) => { const next = { ...row }; delete next[key]; return next; }),
      };
    });
  };
  const setCell = (rowIndex, key, value) => setForm((current) => ({
    ...current,
    rows: current.rows.map((row, i) => i === rowIndex ? { ...row, [key]: value } : row),
  }));
  const addRow = () => setForm((current) => ({
    ...current,
    rows: [...current.rows, Object.fromEntries(current.columns.map((column) => [column.key, ""]))],
  }));
  const removeRow = (index) => setForm((current) => ({ ...current, rows: current.rows.filter((_, i) => i !== index) }));

  const save = async () => {
    if (!form.name.trim() || form.columns.some((column) => !column.label.trim()) || !form.rows.length) {
      setError("Template name, column names, and at least one row are required.");
      return;
    }
    setSaving(true); setError("");
    const payload = {
      name: form.name.trim(), title: form.title.trim() || "Size chart", note: form.note.trim(),
      columns: form.columns, rows: form.rows, is_active: form.is_active,
    };
    try {
      if (form.id) await updateSizeChart(form.id, payload);
      else await createSizeChart(payload);
      setOpen(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (chart) => {
    if (!window.confirm(`Delete size chart "${chart.name}"? Products using it will have no size chart.`)) return;
    try { await deleteSizeChart(chart.id); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Size Charts</h2>
          <p className="text-sm text-gray-500">Create reusable measurement templates for products.</p>
        </div>
        <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> New template
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {charts.map((chart) => (
          <div key={chart.id} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">{chart.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{chart.rows.length} sizes · {chart.columns.length - 1} measurements</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chart.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {chart.is_active ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="mt-4 flex justify-end gap-1">
              <button onClick={() => startEdit(chart)} className="rounded p-2 text-gray-500 hover:bg-gray-100"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
              <button onClick={() => remove(chart)} className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
            </div>
          </div>
        ))}
        {!charts.length && <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400 md:col-span-2 xl:col-span-3">No size-chart templates yet.</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3 sm:p-6">
          <div className="mx-auto my-4 w-full max-w-5xl rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-white px-5 py-4">
              <h3 className="text-lg font-bold">{form.id ? "Edit size chart" : "Create size chart"}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Template name *"><input className="inp" value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Men's T-shirt" /></Field>
                <Field label="Chart heading"><input className="inp" value={form.title} onChange={(e) => setValue("title", e.target.value)} /></Field>
                <Field label="Note"><input className="inp" value={form.note} onChange={(e) => setValue("note", e.target.value)} /></Field>
                <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setValue("is_active", e.target.checked)} /> Available for products
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">Columns</p>
                  <button onClick={addColumn} className="text-xs font-semibold" style={{ color: BRAND }}>+ Add measurement</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.columns.map((column, index) => (
                    <div key={`${column.key}-${index}`} className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                      <input value={column.label} onChange={(e) => changeColumn(index, e.target.value)} className="w-36 bg-transparent px-3 py-2 text-sm outline-none" disabled={index === 0} />
                      {index > 0 && <button onClick={() => removeColumn(index)} className="px-2 text-gray-400 hover:text-red-500"><CloseIcon style={{ fontSize: 15 }} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">Measurements in inches</p>
                  <button onClick={addRow} className="text-xs font-semibold" style={{ color: BRAND }}>+ Add size</button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>{form.columns.map((column) => <th key={column.key} className="px-3 py-2 text-left font-semibold">{column.label}</th>)}<th className="w-12" /></tr>
                    </thead>
                    <tbody>
                      {form.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-100">
                          {form.columns.map((column, columnIndex) => (
                            <td key={column.key} className="p-1.5">
                              <input type={columnIndex === 0 ? "text" : "number"} step="0.01" value={row[column.key] ?? ""} onChange={(e) => setCell(rowIndex, column.key, e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 outline-none focus:border-gray-400" />
                            </td>
                          ))}
                          <td><button onClick={() => removeRow(rowIndex)} className="p-2 text-gray-400 hover:text-red-500"><DeleteOutlineIcon style={{ fontSize: 17 }} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>{saving ? "Saving…" : "Save template"}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="text-xs font-medium text-gray-500">{label}</span><div className="mt-1">{children}</div></label>;
}
