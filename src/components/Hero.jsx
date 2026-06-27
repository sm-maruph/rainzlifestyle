// src/components/Hero.jsx — carousel driven by hero_slides (managed in /admin/hero)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHeroSlides } from "../api";
const BRAND = "#fffffffd";

const Hero = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getHeroSlides()
      .then((data) => alive && setSlides(Array.isArray(data) ? data : []))
      .catch(() => alive && setSlides([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const go = (s) => s?.link && navigate(s.link);

  const maxH = "max-h-[500px] md:max-h-[650px] lg:max-h-[700px]";

  if (loading) {
    return <div className={`w-full aspect-[16/9] ${maxH} bg-gray-100 overflow-hidden`}><div className="h-full w-full bg-gray-200 animate-pulse" /></div>;
  }

  if (slides.length === 0) {
    return (
      <div className={`w-full aspect-[16/9] ${maxH} flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden`}>
        <div className="text-center text-gray-400">
          <p className="text-lg font-semibold">RAINZLIFESTYLE</p>
          <p className="text-sm">Add hero slides in the admin panel to feature them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-[16/9] ${maxH} overflow-hidden`} style={{ backgroundColor: "var(--secondary)" }}>
      {slides.map((s, idx) => (
        <img
          key={s.id}
          src={s.image}
          alt={s.title}
          onClick={() => go(s)}
          className={`absolute top-0 left-0 w-full h-full object-fit transition-opacity duration-1000 ease-in-out ${s.link ? "cursor-pointer" : ""} ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1600x600/CCCCCC/000000?text=${encodeURIComponent(s.title || "Slide")}`; }}
        />
      ))}

      {/* Text overlay with glassmorphism – vertically & horizontally centred */}
      {(slides[current]?.title || slides[current]?.subtitle || slides[current]?.buttonText) && (
        <div className="absolute inset-0 z-20 flex items-center justify-end px-8 py-8 md:px-12 lg:px-20 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            {/* Glass container */}
            <div className="p-4 md:p-8 rounded-2xl text-white text-center">
              {slides[current].title && (
                <h2 className="text-2xl md:text-5xl font-extrabold leading-tight" style={{ color: BRAND }}>
                  {slides[current].title}
                </h2>
              )}
              {slides[current].subtitle && (
                <p className="text-sm md:text-lg font-medium opacity-90 mt-2" style={{ color: BRAND }}>
                  {slides[current].subtitle}
                </p>
              )}
              {slides[current].buttonText && (
                <button
                  onClick={() => go(slides[current])}
                  className="mt-5 inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-gray-900 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  {slides[current].buttonText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {slides.length > 1 && (
        <>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-rose-600 hover:text-white transition z-30" onClick={prev} aria-label="Previous Slide">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-rose-600 hover:text-white transition z-30" onClick={next} aria-label="Next Slide">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex space-x-2 z-30">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`w-3 h-3 rounded-full transition ${idx === current ? "bg-rose-600 scale-110" : "bg-white"}`} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;