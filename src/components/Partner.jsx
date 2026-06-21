// src/components/Partners.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT = "#F4A340";

/**
 * Partner data.
 * - `name` is required (used as the alt text + text fallback).
 * - `logo` is optional: pass an image URL to render the real logo.
 *   When omitted, the name renders as a styled text chip so the grid
 *   still looks complete while you collect assets.
 */
const PARTNERS = [

  {
    name: "Bangladesh Navy",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Bangladesh_Navy_Seal.svg/512px-Bangladesh_Navy_Seal.svg.png",
  },
  {
    name: "Bangladesh Army",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Seal_of_the_Bangladesh_Army.svg/512px-Seal_of_the_Bangladesh_Army.svg.png",
  },
  {
    name: "U.S. Army",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Seal_of_the_United_States_Army.svg/512px-Seal_of_the_United_States_Army.svg.png",
  },
  {
    name: "Prothom Alo",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/65/Prothom_Alo_logo.svg",
  },
  {
    name: "Nutrition International",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nutrition_International_logo.png",
  },
  {
    name: "HP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
  },
  {
    name: "British High Commission",
  },
  {
    name: "DBC News",
  },
  {
    name: "Bangladesh Coast Guard",
  },
  {
    name: "Bangladesh Air Force",
  },
  {
    name: "Walton",
  },
  {
    name: "Runner",
  },
  {
    name: "GAIN",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/GAIN_logo.png",
  },
  {
    name: "PHP Family",
  },
  {
    name: "Ericsson",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Ericsson-Logo.svg",
  },
  {
    name: "Digital World 2020",
  },
  {
    name: "Special Security Force",
  },
  {
    name: "UNDP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/UNDP_logo.svg",
  },
  {
    name: "SK+F",
  },
  {
    name: "United Nations",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
  },
  {
    name: "Qatar Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Qatar_Airways_Logo.svg",
  },
  {
    name: "Confidence Group",
  },
  {
    name: "NICCA",
  },
  {
    name: "MIST",
  },
];

const GP_LOGO = null; // pass a URL string to show the partner's brand mark inline

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const LogoCell = ({ partner }) => (
  <div className="flex h-20 items-center justify-center px-2">
    {partner.logo ? (
      <img
        src={partner.logo}
        alt={partner.name}
        className="max-h-12 max-w-full object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
      />
    ) : (
      <span className="text-center text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800">
        {partner.name}
      </span>
    )}
  </div>
);

const Partners = ({
  title = "Work with us Today",
  description = "We are proud to work with over a thousand brands and organizations that we call friends. As your partner, we value long-term relationships and collaborate toward results.",
  partners = PARTNERS,
  perPage = 24, // 6 cols × 4 rows on desktop; wraps responsively below
}) => {
  const pages = chunk(partners, perPage);
  const [page, setPage] = useState(0);
  const total = pages.length;

  const go = (dir) => setPage((p) => (p + dir + total) % total);

  return (
    <section className="bg-white py-16 px-4">
      <div className="mx-auto max-w-6xl text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h2>

        <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-lg text-gray-700 md:text-xl">
          We are the official merchandising partner of
          {GP_LOGO ? (
            <img src={GP_LOGO} alt="Partner" className="inline h-6 object-contain" />
          ) : (
            <span className="font-semibold" style={{ color: "#2da9e1" }}>
              your brand
            </span>
          )}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-500">
          {description}
        </p>

        {/* Carousel */}
        <div className="mt-12 flex items-center gap-2 md:gap-4">
          {total > 1 && (
            <button
              onClick={() => go(-1)}
              aria-label="Previous partners"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {pages[page].map((p) => (
              <LogoCell key={p.name} partner={p} />
            ))}
          </div>

          {total > 1 && (
            <button
              onClick={() => go(1)}
              aria-label="Next partners"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Page dots */}
        {total > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === page ? 20 : 8,
                  backgroundColor: i === page ? ACCENT : "#D1D5DB",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Partners;
