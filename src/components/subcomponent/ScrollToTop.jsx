// src/components/ScrollToTop.jsx
import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa"; // Make sure react-icons is installed
const BRAND = "var(--brand)";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 right-[22px] z-40 flex h-9 w-9 items-center justify-center rounded-full text-xs text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90 md:bottom-6 md:right-[30px]"
        style={{ backgroundColor: BRAND }} aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>
    )
  );
};

export default ScrollToTop;
