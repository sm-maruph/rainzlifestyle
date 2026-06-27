// src/components/BottomHeader.jsx
import React from "react";
import { MapPin, Mail } from "lucide-react";

const BRAND = "var(--brand)";
const BottomHeader = () => {
  return (
    <div className="w-full bg-[#1a1a1a] py-1.5 px-3 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3 sm:text-sm leading-relaxed">
          {/* Corporate Office */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
            <div>
              <span className="font-semibold text-white/80">Corporate:</span>
              <span className="ml-0.5 text-white/70">
                Setu Homes, 55-Box Nagar, Zoo Road, Mirpur-1, Dhaka-1216
              </span>
            </div>
          </div>

          {/* Sales Office */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
            <div>
              <span className="font-semibold text-white/80">Sales:</span>
              <span className="ml-0.5 text-white/70">
                1244/1, Kamrangar Chala, Mouchak, Kaliakoir, Gazipur
              </span>
            </div>
          </div>

          {/* Email (plain text, no hyperlink) */}
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
            <div>
              <span className="font-semibold text-white/80">Email:</span>
              <span className="ml-0.5 text-white/70">
                ranzelifestyle.officisa@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;