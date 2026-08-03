import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function Pagination({ page = 1, total = 0, pageSize = 8, onChange, onPageSizeChange, pageSizeOptions = [8, 10, 20, 100], className = "" }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1 && !onPageSizeChange) return null;
  const candidates = [1, page - 1, page, page + 1, pages].filter((v) => v >= 1 && v <= pages).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  const controls = [];
  candidates.forEach((value, index) => {
    if (index && value - candidates[index - 1] > 1) controls.push(`gap-${value}`);
    controls.push(value);
  });
  const select = (next) => next !== page && next >= 1 && next <= pages && onChange(next);
  return (
    <nav className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`} aria-label="Product pages">
      {onPageSizeChange && (
        <label className="mr-1 flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600">
          <span className="hidden sm:inline">Show</span>
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="bg-transparent font-bold text-gray-900 outline-none" aria-label="Products per page">
            {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <span className="hidden sm:inline">per page</span>
        </label>
      )}
      <button onClick={() => select(page - 1)} disabled={page === 1} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-35" aria-label="Previous page"><ChevronLeftIcon style={{ fontSize: 18 }} /><span className="hidden sm:inline">Previous</span></button>
      {controls.map((value) => typeof value === "string" ? <span key={value} className="px-1 text-gray-400">…</span> : (
        <button key={value} onClick={() => select(value)} aria-current={value === page ? "page" : undefined} className="h-9 min-w-9 rounded-lg border px-2 text-xs font-bold transition" style={value === page ? { backgroundColor: "var(--brand)", borderColor: "var(--brand)", color: "#fff" } : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }}>{value}</button>
      ))}
      <button onClick={() => select(page + 1)} disabled={page === pages} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-35" aria-label="Next page"><span className="hidden sm:inline">Next</span><ChevronRightIcon style={{ fontSize: 18 }} /></button>
    </nav>
  );
}
