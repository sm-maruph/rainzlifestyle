import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = "6Ld3oZwrAAAAAD9aybn4CSdXnqakNoU6WkSKP3ba"; // your Google reCAPTCHA key
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwpqzkvg"; // replace with your Formspree ID

const ContactUsForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    tel: "",
    email: "",
    message: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gender || !formData.tel || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("gender", formData.gender);
      form.append("tel", formData.tel);
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
        setSuccess("Your enquiry has been sent successfully.");
        setFormData({
          name: "",
          gender: "",
          tel: "",
          email: "",
          message: "",
        });
        setCaptchaToken(null);
        window.grecaptcha?.reset();
      } else {
        setError(result?.errors?.[0]?.message || "Submission failed.");
      }
    } catch (error) {
      setError("Failed to send enquiry. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-white">
      <div className="max-full mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Send Us an Enquiry</h2>
        <p className="text-gray-700 mb-6 text-center">
          You can send us an enquiry by using the form below:
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow-md"
        >
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="tel" className="block text-gray-700 text-sm font-bold mb-2">
              Telephone *
            </label>
            <input
              type="tel"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div className="md:col-span-2">
  <p className="text-center text-mm-primary">
    <strong>After submitting Enquiry, Materials and More will contact your email soon. Thank you.</strong>
  </p>
</div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-mm-primary hover:mm-primary text-white py-2 px-4 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactUsForm;
