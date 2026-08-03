import React from "react";

const BRAND = "var(--brand)";

// 4-point sparkle from the logo's crown
const Sparkle = ({ size = 22, color = "#fff", style, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    style={style}
    fill={color}
    aria-hidden="true"
  >
    <path d="M12 0c.6 6.2 1.2 6.8 7.4 7.4C13.2 8 12.6 8.6 12 24c-.6-15.4-1.2-16-7.4-16.6C10.8 6.8 11.4 6.2 12 0z" />
  </svg>
);

const LoadingRainz = () => {
  const letters = "RAINZ".split("");
  const particles = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Soft radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 55%)",
        }}
      />

      {/* Drifting particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {particles.map((_, i) => {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 320 + 80;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          const size = Math.random() * 6 + 2;
          return (
            <span
              key={i}
              className="absolute rounded-full rz-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: "50%",
                top: "55%",
                backgroundColor: Math.random() > 0.5 ? BRAND : "#111827",
                opacity: 0.0,
                animationDuration: `${Math.random() * 1.5 + 1.5}s`,
                animationDelay: `${Math.random() * 1}s`,
                "--tx": `${tx}px`,
                "--ty": `${ty}px`,
              }}
            />
          );
        })}
      </div>

      {/* Sparkle crown */}
      <div className="relative z-10 flex items-end gap-2 mb-3">
        <Sparkle size={16} color={BRAND} className="rz-twinkle" style={{ animationDelay: "0s", filter: `drop-shadow(0 0 6px ${BRAND})` }} />
        <Sparkle size={26} color="#111827" className="rz-twinkle" style={{ animationDelay: ".2s" }} />
        <Sparkle size={20} color={BRAND} className="rz-twinkle" style={{ animationDelay: ".1s", filter: `drop-shadow(0 0 6px ${BRAND})` }} />
        <Sparkle size={30} color="#111827" className="rz-twinkle" style={{ animationDelay: ".3s" }} />
      </div>

      {/* RAINZ wordmark */}
      <div className="z-10 flex items-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {letters.map((ch, i) => (
          <span
            key={i}
            className="rz-letter text-6xl md:text-8xl font-light"
            style={{
              color: BRAND,
              letterSpacing: "0.12em",
              animationDelay: `${i * 0.06}s`,
              textShadow: "0 0 18px color-mix(in srgb, var(--brand) 20%, transparent)",
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Subtitle */}
      <p
        className="z-10 mt-2 text-xs md:text-sm font-medium text-gray-500 rz-fade"
        style={{ letterSpacing: "0.5em", paddingLeft: "0.5em", animationDelay: "0.45s" }}
      >
        LIFESTYLE
      </p>

      {/* Shimmer progress bar */}
      <div className="z-10 mt-8 h-[3px] w-44 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full w-1/3 rounded-full rz-shimmer"
          style={{ background: `linear-gradient(90deg, transparent, ${BRAND}, transparent)` }}
        />
      </div>

      {/* Inline animations (no external CSS needed) */}
      <style>{`
        @keyframes rzParticle {
          0%   { transform: translate(-50%, -50%) translate(0,0) scale(.6); opacity: 0; }
          25%  { opacity: .7; }
          100% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
        .rz-particle { animation-name: rzParticle; animation-iteration-count: infinite; animation-timing-function: ease-out; }

        @keyframes rzTwinkle {
          0%, 100% { transform: scale(.7) rotate(0deg); opacity: .35; }
          50%      { transform: scale(1.15) rotate(45deg); opacity: 1; }
        }
        .rz-twinkle { color: #fff; animation: rzTwinkle 1.1s ease-in-out infinite; }

        @keyframes rzLetter {
          0%   { opacity: 0; transform: translateY(18px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .rz-letter { display: inline-block; opacity: 0; animation: rzLetter .4s ease forwards; }

        @keyframes rzFade { to { opacity: 1; } }
        .rz-fade { opacity: 0; animation: rzFade .5s ease forwards; }

        @keyframes rzShimmer {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(450%); }
        }
        .rz-shimmer { animation: rzShimmer 0.9s linear infinite; }
      `}</style>
    </div>
  );
};

export default LoadingRainz;
