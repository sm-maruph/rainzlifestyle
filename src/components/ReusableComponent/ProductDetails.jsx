import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import LoadingWithText from "./LoadWithText";
import ProductEnquiryModal from "./ProductEnquiryModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
dayjs.extend(relativeTime);
dayjs.extend(utc);
const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setCategoryRelated] = useState([]);
  const [subrelated, setSubcategoryRelated] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizeName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    axios
      .get(`${API_BASE}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!product || !product.id || !product.category_id) return;

    axios
      .get(`${API_BASE}/products/related`, {
        params: {
          excludeId: product.id,
          subcategoryId: product.category_id,
        },
      })
      .then((res) => {
        setCategoryName(res.data.categoryName);
        setSubcategoryName(res.data.subcategoryName);
        setSubcategoryRelated(res.data.subcategoryRelated || []);
        setCategoryRelated(res.data.categoryRelated || []);
      })
      .catch((err) => console.error("Error fetching related:", err));

    if (product.category) {
      setSubcategoryName(normalizeName(product.category.name));
      setCategoryName(normalizeName(product.category.parent?.name));
    }
  }, [product]);

  const getTimeAgo = (dateString) => {
    const normalizedDate = dateString.replace(" ", "T");
    return dayjs(normalizedDate).fromNow();
  };

  if (!product) return <LoadingWithText />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-8 sm:mt-4">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500 flex flex-wrap gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline text-mm-primary font-semibold">
          Home
        </Link>
        <span>/</span>
        <Link to={`/${categoryName}`} className="hover:underline text-mm-primary truncate max-w-xs sm:max-w-full">
          {categoryName}
        </Link>
        <span>/</span>
        <Link to={`/${categoryName}/${subcategoryName}`} className="hover:underline text-mm-primary truncate max-w-xs sm:max-w-full">
          {subcategoryName}
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs sm:max-w-full">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="md:col-span-3 bg-white p-4 rounded-xl shadow-lg">
          {/* Top Grid: Image + Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Image */}
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between">
              <h3 className="text-2xl sm:text-2xl font-extrabold text-mm-primary mb-4 leading-tight break-words">
                {product.name}
              </h3>

              {/* Key Specifications */}
              {product.specifications?.length > 0 && (
                <div className="mb-6">
                  <h6 className="text-sm font-semibold text-mm-secondary mb-2">Key Specifications:</h6>
                  <div className="flex flex-wrap gap-2 bg-mm-light p-4 rounded-lg border border-mm-primary">
                    {product.specifications.map((spec, idx) => (
                      <span
                        key={idx}
                        className="cursor-default select-none bg-white text-mm-primary border border-mm-primary text-sm font-semibold px-4 py-1 rounded-full shadow-sm whitespace-nowrap hover:shadow-md transition-transform duration-300 hover:scale-105"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

             {/* Price + Enquiry */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-wrap">
  <div className="bg-mm-secondery text-white rounded-lg px-5 py-2 font-bold text-lg text-center shadow-md flex-shrink-0 max-w-full sm:max-w-[150px] w-full sm:w-auto">
    ৳ {product.price}
  </div>
  <button
    onClick={() => setIsModalOpen(true)}
    className="bg-mm-primary text-white rounded-lg px-3 py-2 font-bold text-lg text-center shadow-md flex-shrink-0 max-w-full sm:max-w-[200px] w-full sm:w-auto"
  >
    ✉️ Enquiry Now
  </button>
</div>


              {/* Payment Method */}
              <div className="text-sm font-medium text-gray-700 mb-6">
                <span className="font-semibold text-mm-secondary">Payment Method:</span>{" "}
                <span className="text-mm-primary font-bold">Cash on Delivery</span>
              </div>

              {/* Category > Subcategory */}
              <div className="flex flex-wrap gap-2 text-gray-800 font-semibold mb-6">
                <span className="truncate max-w-full">{categoryName}</span>
                <span className="text-mm-primary">→</span>
                <span className="truncate max-w-full">{subcategoryName}</span>
              </div>

              {/* Timestamps */}
              <div className="text-gray-600 text-sm space-y-1 break-words">
                <div>
                  <span className="font-semibold">Posted:</span> {getTimeAgo(product.created_at)}
                </div>
                <div>
                  <span className="font-semibold">Last Updated:</span> {getTimeAgo(product.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-mm-secondary">Description:</h2>
            <p className="text-gray-700 leading-relaxed text-[1.05rem] break-words">{product.description}</p>
          </div>
        </div>

        {/* Related Products Sidebar */}
        <aside className="space-y-6">
          <h4 className="text-md font-semibold text-mm-secondery">Related Products</h4>

          {subrelated.length === 0 && related.length === 0 ? (
            <p className="text-sm text-gray-500">No related products found.</p>
          ) : (
            <>
              {subrelated.length > 0 && (
                <section>
                  <h5 className="text-md font-medium text-mm-secondery mb-2">More in <span className="text-mm-primary">{subcategoryName}</span> <span className="text-sm bg-gray-700 text-white py-0.5 px-2 rounded">{subrelated.length} items </span></h5>
                  {subrelated.map((item) => (
                    <Link
                      to={`/${item.categoryName}/${item.subcategoryName}/${item.id}`}
                      key={item.id}
                      className="block bg-white rounded-lg shadow hover:shadow-md p-3 border border-gray-200 mb-2 no-underline"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-contain bg-gray-50 rounded flex-shrink-0"
                        />
                        <div className="text-sm min-w-0">
                          <div className="font-semibold text-mm-secondery truncate">{item.name}</div>
                          <div className="text-mm-primary font-bold">৳ {item.price}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {related.length > 0 && (
                <section>
                  <h4 className="text-md font-medium text-mm-secondery mb-2">More in <span className="text-mm-primary">{categoryName}</span> <span className="text-sm bg-gray-700 text-white py-0.5 px-2 rounded">{related.length} items </span> </h4>
                  {related.map((item) => (
                    <Link
                      to={`/${item.category?.parent?.name || ""}/${item.category?.name || ""}/${item.id}`}
                      key={item.id}
                      className="block bg-white rounded-lg shadow hover:shadow-md p-3 border border-gray-200 mb-2 no-underline"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-contain bg-gray-50 rounded flex-shrink-0"
                        />
                        <div className="text-sm min-w-0">
                          <div className="font-semibold text-mm-secondery truncate">{item.name}</div>
                          <div className="text-mm-primary font-bold">৳ {item.price}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}
            </>
          )}
        </aside>
      </div>

      <ProductEnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={product} />
    </div>
  );
};

export default ProductDetails;
