// src/components/ContactUs.jsx
import React from "react";

// Ensure these paths are correct relative to your ContactUs.jsx file
import contactBanner from "../assets/global/contactus.webp"; // Assuming this is your contact page banner
import ContactUsForm from "./ReusableComponent/ContactUsForm";
const ContactUs = () => {
  return (
    <div className="font-sans text-gray-800 ">
      {/* 1. Hero/Banner Section (Remains the same) */}
      <div
        className="relative bg-cover bg-center h-48 md:h-64 flex items-center justify-center text-white "
        style={{ backgroundImage: `url(${contactBanner})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-center">
          Contact Us
        </h1>
      </div>

      {/* 2. Breadcrumbs Section (Remains the same) */}
      <div className="bg-white-500 py-3 px-4 md:px-8 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="hover:underline text-fineetex-gray-text">
            Home
          </a>
          <span className="mx-2">&gt;</span>
          <span className="text-mm-primary font-medium">Contact Us</span>
        </div>
      </div>

      <div className="w-[90%] mx-auto">
        {/* 3. Main Contact Information Section (Now a single column for text) */}
        <section className="py-12 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            {" "}
            {/* No grid here, just a single column */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              {/* Orange vertical line from image_aaabbd.png */}
              <span className="block h-8 w-1 bg-mm-primary mr-3"></span>Get in
              Touch
            </h2>{" "}
            {/* Centered on small, left on medium+ */}
            <p className="text-gray-700 leading-relaxed mb-4">
              Materials & More Enterprise (M&M)
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Corporate Office:</span> Setu
              Homes, 55-Box Nagar, Zoo Road, Mirpur-1, Dhaka-1216
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Sales Office:</span> 1244/1,
              Kamrangar Chala, Mouchak, Kaliakoir, Gazipur
            </p>
            <p className="text-gray-700 leading-relaxed mb-1">
              <span className="font-semibold">Contact No.:</span> +88 01755
              736243, +88 01819 757777
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Email:</span>
              <br />
              <a
                href="mailto:sales@materialsnmore.com"
                className="hover:underline text-mm-primary"
              >
                sales@materialsnmore.com
              </a>
              ,
              <br />
              <a
                href="mailto:mnmenterprise777@gmail.com"
                className="hover:underline text-mm-primary"
              >
                mnmenterprise777@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* NEW SECTION: Our Location with Map */}
        <section className="py-12 px-4 md:px-8 bg-gray-50">
          {" "}
          {/* Different background for visual separation */}
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              {/* Orange vertical line from image_aaabbd.png */}
              <span className="block h-8 w-1 bg-mm-primary mr-3"></span>Our
              Location
            </h2>{" "}
            {/* Centered heading */}
            {/* Map Container */}
            <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-lg">
              {" "}
              {/* Fixed height for map, adjusted for responsiveness */}
              {/*
              IMPORTANT: Replace the src below with your actual Google Maps embed URL.
              1. Go to Google Maps.
              2. Search for your location (e.g., "Setu Homes, 55-Box Nagar, Zoo Road, Mirpur-1, Dhaka-1216").
              3. Click "Share" -> "Embed a map".
              4. Copy the `src` attribute value from the `<iframe>` code provided by Google Maps.
            */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.337324779809!2d90.34874855999311!3d23.806601036529095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0e215c830e7%3A0x869f7421dd9e996c!2sSetu%20Homes!5e0!3m2!1sen!2sbd!4v1754347774599!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Company Location Map"
              />
            </div>
          </div>
        </section>

        {/* Enquiry Form Section (Remains the same) */}
        <section className="py-12 px-4 md:px-8 bg-white">
          <ContactUsForm />
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
