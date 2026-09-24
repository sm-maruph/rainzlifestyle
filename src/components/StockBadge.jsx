export default function StockBadge({ product }) {
  const sizeStock = product?.sizeStock || {};
  const available = product?.inStock !== false && (Object.keys(sizeStock).length
    ? (product?.sizes || Object.keys(sizeStock)).some((size) => Number(sizeStock[size]) > 0)
    : product?.stock != null ? Number(product.stock) > 0 : product?.inStock !== false);
  return available ? null : <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 bg-black/80 px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">Out of stock</span>;
}
