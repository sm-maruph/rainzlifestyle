import { api } from "./apiClient";

const mapReview = (r) => ({
  id: r.id,
  productId: r.product_id,
  name: r.reviewer_name || (r.is_guest ? "Guest" : "Customer"),
  isGuest: r.is_guest,
  rating: r.rating,
  title: r.title || "",
  comment: r.comment || "",
  date: r.created_at,
});

export async function getReviews(productId) {
  const data = await api.get(`/reviews/${productId}`);
  return {
    items: (data.items || []).map(mapReview),
    summary: data.summary || { count: 0, avg: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  };
}

export async function addReview(productId, { rating, title, comment, reviewer_name }) {
  return api.post(`/reviews/${productId}`, { rating, title, comment, reviewer_name });
}
