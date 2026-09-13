// Gallery order matches color order: image 1 belongs to color 1, etc.
export function colorImage(product, color) {
  const index = (product.colors || []).findIndex((entry) => entry.name === color);
  return (index >= 0 && product.images?.[index]) || product.image || product.images?.[0] || null;
}
