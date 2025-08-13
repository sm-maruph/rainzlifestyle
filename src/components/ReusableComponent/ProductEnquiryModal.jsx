import React, { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwpqzkvg";

const ProductEnquiryModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please provide your email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const form = new FormData();
      form.append("product", product.name);
      form.append("price", product.price);
      form.append("category", product.category);
      form.append("subcategory", product.subcategory);
      form.append("email", formData.email);
      form.append("message", formData.message);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: form,
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Your enquiry has been sent!");
        setFormData({ email: "", message: "" });
      } else {
        setError(result?.errors?.[0]?.message || "Submission failed.");
      }
    } catch (error) {
      setError("Failed to send enquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md ">
       <div className="flex justify-between items-center mb-4 shadow-lg p-4 bg-white rounded-md">

          <h3 className="text-xl font-bold">Enquiry For <span className="text-mm-primary">{product.name}</span></h3>
          <button onClick={onClose} className="text-4xl text-gray-600 hover:text-mm-primary text-size-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Product Name:</label>
            <p className="font-semibold">{product.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Price</label>
              <p className="text-mm-secondery font-semibold">৳ {product.price}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Category</label>
              <p>{product.category}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-700">Subcategory</label>
              <p>{product.subcategory}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Your Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mm-primary text-white py-2 rounded hover:bg-opacity-90"
          >
            {loading ? "Submitting..." : "Submit Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEnquiryModal;
