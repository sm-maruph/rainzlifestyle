// src/components/ContactUs.jsx
import React, { useState, useEffect } from "react";

import heroBannerImage from "../assets/global/aboutus.webp"; // Assuming this is your contact page banner
import ContactUsForm from "./ReusableComponent/ContactUsForm";
import ImageWithLoader from "./ReusableComponent/ImageWithLoader";
const API_BASE = process.env.REACT_APP_API_BASE_URL;

const AboutUs = () => {
  // State to hold partners data fetched from API
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch partners data on mount
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/partners`);
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        setPartners(data);
        setError("");
      } catch (err) {
        setError("Error loading partners");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="font-sans">
      {/* 1. Hero/Banner Section - KEPT AS IS */}
      <div
        className="relative bg-cover bg-center h-48 md:h-64 flex items-center justify-center text-white"
        style={{ backgroundImage: `url(${heroBannerImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-center">
          About Us
        </h1>
      </div>

      {/* 2. Breadcrumbs Section - KEPT AS IS */}
      <div className="bg-gray-100 py-3 px-4 md:px-8 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="hover:underline text-fineetex-gray-text">
            Home
          </a>
          <span className="mx-2">&gt;</span>
          <span className="text-mm-primary font-medium">About Us</span>
        </div>
      </div>

      <div className="w-[90%] mx-auto">
        {/* 3. Company Profile Content Section - KEPT AS IS */}
        <section className="py-12 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              {/* Orange vertical line from image_aaabbd.png */}
              <span className="block h-8 w-1 bg-mm-primary mr-3"></span>
              Company Profile
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Materials & More Enterprise (M&M) was established in 2003, specializing in
              providing textiles, toys and other high-quality testing equipment,
              consumables supplies and related services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              The company is a partner of international brands such as AATCC,
              ASTM, SDC, Testfabrics, VeriVide and X-rite, and provides
              customers in mainland China, Hong Kong and other Southeast Asian
              and European and American countries.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              We also provide professional after-sales service, including
              equipment repair and maintenance, parts quotation and calibration
              services, to ensure that customers receive comprehensive
              after-sales support.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We will serve our customers wholeheartedly with reasonable prices,
              quick response and professional service.
            </p>
          </div>
        </section>

        {/* NEW SECTION: Partnerships - Updated grid layout */}
        {/* Partnerships Section */}
        <section className="py-10 px-3 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="block h-7 w-1 bg-mm-primary mr-3"></span>
              Partnerships
            </h2>

            {loading ? (
              <p className="text-center text-gray-500">Loading partners...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : partners.length === 0 ? (
              <p className="text-center text-gray-500">No partners found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex flex-col items-center border rounded-lg p-3 md:p-4 shadow-sm bg-white max-w-[220px] mx-auto md:max-w-none"
                  >
                    <a
                      href={partner.website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full aspect-square rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden mb-3 md:mb-4"
                    >
                      <ImageWithLoader
                        src={partner.image_url}
                        alt={`${partner.title} Logo`}
                        className="aspect-square object-contain"
                      />
                    </a>

                    {/* Title */}
                    <h3 className="text-center text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                      {partner.title}
                    </h3>

                    {/* View Website Button */}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-mm-primary text-white px-3 py-1.5 text-xs md:text-sm rounded hover:bg-mm-primary-dark transition no-underline text-center w-full sm:w-auto"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Enquiry Form Section - KEPT AS IS */}
        <section className="py-12 px-4 md:px-8 bg-white">
         <ContactUsForm />
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
