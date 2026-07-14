// src/components/Hero.jsx — carousel with optional separate mobile image per slide.
// Desktop shows s.image (wide). Mobile shows s.mobileImage if provided (taller, no crop),
// otherwise falls back to s.image. Whole image always shown (no crop), height follows the image.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHeroSlides } from "../api";

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

  if (loading) {
    return <div className="w-full bg-gray-100 overflow-hidden" style={{ aspectRatio: "16 / 9" }}><div className="h-full w-full bg-gray-200 animate-pulse" /></div>;
  }

  if (slides.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        <div className="text-center text-gray-400">
          <p className="text-lg font-semibold">RAINZLIFESTYLE</p>
          <p className="text-sm">Add hero slides in the admin panel to feature them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden leading-[0]">
      {slides.map((s, idx) => {
        const active = idx === current;
        const hasMobile = !!s.mobileImage;
        return (
          <picture
            key={s.id}
            onClick={() => go(s)}
            className={`block w-full transition-opacity duration-1000 ease-in-out ${s.link ? "cursor-pointer" : ""} ${
              active ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0"
            }`}
          >
            {/* Mobile source (taller image) if provided */}
            {hasMobile && <source media="(max-width: 640px)" srcSet={s.mobileImage} />}
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-[220px] sm:h-[380px] md:h-auto object-cover md:object-contain block select-none"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1600x900/CCCCCC/000000?text=${encodeURIComponent(s.title || "Slide")}`; }}
            />
          </picture>
        );
      })}

      {/* Text overlay */}
      {(slides[current]?.title || slides[current]?.subtitle || slides[current]?.buttonText) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-end px-6 md:px-12 lg:px-20 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="p-2 md:p-8 rounded-2xl text-white text-center">
              {slides[current].title && (
                <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
                  {slides[current].title}
                </h2>
              )}
              {slides[current].subtitle && (
                <p className="text-xs sm:text-base md:text-lg font-medium opacity-90 mt-1 md:mt-2 text-white drop-shadow">
                  {slides[current].subtitle}
                </p>
              )}
              {slides[current].buttonText && (
                <button
                  onClick={() => go(slides[current])}
                  className="mt-2 md:mt-5 inline-block rounded-full bg-white px-5 py-2 md:px-8 md:py-3 text-xs md:text-sm font-bold transition-colors hover:opacity-90"
                  style={{ color: "var(--primary)" }}
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
          <button className="absolute left-3 top-1/2 -translate-y-1/2 text-white p-1.5 md:p-2 drop-shadow-lg hover:opacity-70 transition z-30" onClick={prev} aria-label="Previous Slide">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white p-1.5 md:p-2 drop-shadow-lg hover:opacity-70 transition z-30" onClick={next} aria-label="Next Slide">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex space-x-2 z-30">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition ${idx === current ? "bg-rose-600 scale-110" : "bg-white/80"}`} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;