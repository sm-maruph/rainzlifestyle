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
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Emblem_of_the_Bangladesh_Navy.svg",
  },
  {
    name: "Bangladesh Army",
    logo: "https://pbs.twimg.com/profile_images/1879504293189009409/NriEIeyh_400x400.jpg",
  },
  {
    name: "U.S. Army",
    logo: "https://img.magnific.com/premium-vector/united-states-army-logo-with-eagle-center_850624-230.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Prothom Alo",
    logo: "https://media.prothomalo.com/prothomalo/import/default/2016/03/15/4d3620a7127d4a031a05a962fcc4b253-palo-logo.jpg",
  },
  {
    name: "Nutrition International",
    logo: "https://nutritionintl.org/wp-content/uploads/2020/12/nutrition-international-logo-300x129-1.png",
  },
  {
    name: "HP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1280px-HP_logo_2012.svg.png",
  },
  {
    name: "British High Commission",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmaISX3HwzQTrL5o8sHLQagcBI8E8FbjQxwg&s",
  },
  {
    name: "DBC News",
    logo: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/feb2b938467901.57629b6275218.jpg",
  },
  {
    name: "Bangladesh Coast Guard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%95%E0%A7%8B%E0%A6%B8%E0%A7%8D%E0%A6%9F_%E0%A6%97%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%E0%A7%87%E0%A6%B0_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A7%80%E0%A6%95.svg/1280px-%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%95%E0%A7%8B%E0%A6%B8%E0%A7%8D%E0%A6%9F_%E0%A6%97%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%E0%A7%87%E0%A6%B0_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A7%80%E0%A6%95.svg.png",
  },
  {
    name: "Bangladesh Air Force",
    logo: "https://www.bssnews.net/assets/news_photos/2025/09/07/image-309373-1757243195.jpg",
  },
  {
    name: "Walton",
    logo: "https://static.vecteezy.com/system/resources/previews/068/705/998/non_2x/walton-logo-mobile-brand-electronics-company-official-icon-free-png.png",
  },
  {
    name: "Runner",
    logo: "https://www.tbsnews.net/sites/default/files/styles/big_2/public/images/2022/04/27/runner_logo.jpg",
  },
  {
    name: "GAIN",
    logo: "https://www.gainhealth.org/sites/default/files/brand-identity/GAIN_logo_RVB.png",
  },
  {
    name: "PHP Family",
    logo: "https://i.ytimg.com/vi/tnnVmCA78Fk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDF5wswi6Ko0Qd-TP_YGbAjvg_FJA",
  },
  {
    name: "Ericsson",
    logo: "https://e7.pngegg.com/pngimages/22/865/png-clipart-ericsson-japan-k-k-telecommunication-logo-business-business-blue-text-thumbnail.png",
  },
  {
    name: "Digital World 2020",
    logo: "https://static.vecteezy.com/system/resources/thumbnails/022/902/445/small/globe-logo-design-symbol-icon-premium-vector.jpg",

  },
  {
    name: "Special Security Force",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Insignia_of_the_Special_Security_Force.svg/500px-Insignia_of_the_Special_Security_Force.svg.png",

  },
  {
    name: "UNDP",
    logo: "https://www.atachcommunity.com/fileadmin/_processed_/a/e/csm_undp_logo_landscape_854813103b.png",
  },
  {
    name: "SK+F",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/SKF_logo.svg/2560px-SKF_logo.svg.pnghttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Law75EcoCP0XTINilS9398GOnkv-QnHXlA&s",
  },
  {
    name: "United Nations",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/UN_emblem_blue.svg/3840px-UN_emblem_blue.svg.png",
  },
  {
    name: "Qatar Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Qatar_Airways_Logo.svghttps://www.britishcouncil.or.th/sites/default/files/qatar_logo.jpg",
  },
  {
    name: "Confidence Group",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKRVqBQkT5yoXIHlakofDhiHr3MAW58EVKYg&s",
  },
  {
    name: "NICCA",
    logo: "https://marketplace.chemsec.org/api/file/logotype/209",
  },
  {
    name: "MIST",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Military_Institute_of_Science_and_Technology_Monogram.svg/1280px-Military_Institute_of_Science_and_Technology_Monogram.svg.png",
  },
];

const GP_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1280px-HP_logo_2012.svg.png"; // pass a URL string to show the partner's brand mark inline

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
        className="max-h-14 max-w-full object-contain opacity-100 grayscale-90 transition duration-300 hover:opacity-100 hover:grayscale-0"
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
