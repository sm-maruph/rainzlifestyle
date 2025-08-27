import React, { useState, useEffect } from "react";
import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/banners`);
        setBanners(res.data);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setBanners([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide only if banners exist
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  if (loading) {
    return (
       <div className="w-full aspect-[16/9] max-h-[200px] md:max-h-[350px] lg:max-h-[420px] flex items-center justify-center bg-gray-100 overflow-hidden">
      <div className="w-full h-full bg-gray-200 animate-pulse">
        <div className="h-full w-full bg-gray-300 rounded-md" />
      </div>
    </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full aspect-[16/9] max-h-[200px] md:max-h-[350px] lg:max-h-[420px] flex items-center justify-center bg-gray-100 overflow-hidden">
      <div className="w-full h-full bg-gray-200 animate-pulse">
        <div className="h-full w-full bg-gray-300 rounded-md" />
      </div>
    </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] max-h-[700px] md:max-h-[650px] lg:max-h-[650px] overflow-hidden bg-gray-100">
      {banners.map((banner, idx) => (
        <img
          key={banner.id}
          src={banner.image_url}
          alt={banner.title}
          className={`absolute top-0 left-0 w-full h-full object-fill transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/1200x675/CCCCCC/000000?text=Banner+${idx + 1}`;
          }}
        />
      ))}

      {/* Navigation buttons */}
      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-orange-500 transition z-30"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-orange-500 transition z-30"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute left-1/2 bottom-3 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full focus:outline-none transition ${
              idx === current ? "bg-orange-500 scale-110" : "bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
