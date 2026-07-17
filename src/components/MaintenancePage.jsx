// src/components/MaintenancePage.jsx — animated "be right back" screen.
// Self-contained colours (does NOT depend on theme tokens) so text is always legible.
import { Link } from "react-router-dom";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useSettings } from "../context/SettingsContext";

const SOCIALS = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "instagram", Icon: InstagramIcon },
  { key: "youtube", Icon: YouTubeIcon },
  { key: "tiktok", Icon: MusicNoteIcon },
  { key: "whatsapp", Icon: WhatsAppIcon },
];

export default function MaintenancePage() {
  const { settings } = useSettings();
  const storeName = settings.storeName || "RAINZLIFESTYLE";
  const social = settings.social || {};

  const socialHref = (key, val) => {
    if (!val) return null;
    if (key === "whatsapp") {
      const digits = String(val).replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    return val;
  };

  const activeSocials = SOCIALS
    .map((s) => ({ ...s, href: socialHref(s.key, social[s.key]) }))
    .filter((s) => s.href);

  return (
    <div className="mnt-root">
      {/* animated background orbs */}
      <div className="mnt-orb mnt-orb-1" />
      <div className="mnt-orb mnt-orb-2" />
      <div className="mnt-orb mnt-orb-3" />
      <div className="mnt-grid" />

      <div className="mnt-content">
        {/* Logo */}
        <div className="mnt-logo-wrap">
          {settings.logo ? (
            <img src={settings.logo} alt={storeName} className="mnt-logo" />
          ) : (
            <span className="mnt-logo mnt-logo-fallback">{storeName[0]}</span>
          )}
        </div>

        <h1 className="mnt-brand">{storeName}</h1>
        <div className="mnt-rule" />

        {/* Animated needle / stitch loader */}
        <div className="mnt-loader" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>

        <h2 className="mnt-title">
          We&rsquo;ll be <span className="mnt-shimmer">right back</span>
        </h2>

        <p className="mnt-sub">
          We&rsquo;re tailoring something special behind the scenes.
          The store will be back online shortly — thanks for your patience.
        </p>

        {/* progress shimmer */}
        <div className="mnt-progress" aria-hidden="true"><div className="mnt-progress-bar" /></div>

        {/* Contact */}
        {(settings.supportPhone || settings.supportEmail) && (
          <div className="mnt-card">
            <p className="mnt-card-title">Need help in the meantime?</p>
            <div className="mnt-contact-list">
              {settings.supportPhone && (
                <a href={`tel:${settings.supportPhone}`} className="mnt-contact">
                  <PhoneOutlinedIcon style={{ fontSize: 16 }} /> {settings.supportPhone}
                </a>
              )}
              {settings.supportEmail && (
                <a href={`mailto:${settings.supportEmail}`} className="mnt-contact">
                  <MailOutlineIcon style={{ fontSize: 16 }} /> {settings.supportEmail}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Socials */}
        {activeSocials.length > 0 && (
          <div className="mnt-socials">
            {activeSocials.map(({ key, Icon, href }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={key} className="mnt-social">
                <Icon style={{ fontSize: 20 }} />
              </a>
            ))}
          </div>
        )}

        {/* Staff entrance — the way back in if maintenance was left on */}
        <p className="mnt-staff">
          Store staff? <Link to="/login" className="mnt-staff-link">Sign in here</Link>
        </p>
      </div>

      <style>{`
        .mnt-root {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          overflow: hidden;
          background: linear-gradient(160deg, #0B0B12 0%, #14101F 45%, #1B1020 100%);
          font-family: inherit;
        }

        /* soft floating colour orbs */
        .mnt-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: .5;
          pointer-events: none;
        }
        .mnt-orb-1 { width: 380px; height: 380px; background: #E11D48; top: -120px; left: -100px; animation: mntFloat1 14s ease-in-out infinite; }
        .mnt-orb-2 { width: 320px; height: 320px; background: #7C3AED; bottom: -110px; right: -90px; animation: mntFloat2 17s ease-in-out infinite; }
        .mnt-orb-3 { width: 260px; height: 260px; background: #DB2777; top: 45%; left: 60%; opacity: .28; animation: mntFloat3 20s ease-in-out infinite; }
        @keyframes mntFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,50px) scale(1.15)} }
        @keyframes mntFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,-40px) scale(1.1)} }
        @keyframes mntFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-70px,40px)} }

        /* faint grid texture */
        .mnt-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
        }

        .mnt-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          text-align: center;
          animation: mntRise .7s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes mntRise { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform:none; } }

        /* logo */
        .mnt-logo-wrap { display: inline-block; position: relative; background: linear-gradient(135deg, #E11D48, #7C3AED); border-radius: 20px; padding: 4px; }
        .mnt-logo-wrap::after {
          content: ""; position: absolute; inset: -10px; border-radius: 20px;
          border: 1px solid rgb(255, 255, 255);
          animation: mntPulse 3s ease-in-out infinite;
        }
        @keyframes mntPulse { 0%,100%{ transform: scale(1); opacity:.7 } 50%{ transform: scale(1.08); opacity:.25 } }
        .mnt-logo {
          height: 68px; width: 68px; border-radius: 16px; object-fit: cover; display: block;
          box-shadow: 0 10px 40px rgba(0,0,0,.5);
        }
        .mnt-logo-fallback {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #E11D48, #7C3AED);
          color: #fff; font-weight: 900; font-size: 28px;
        }

        .mnt-brand {
          margin-top: 18px;
          font-size: 22px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase;
          color: #FFFFFF;
        }
        .mnt-rule {
          width: 54px; height: 2px; margin: 14px auto 0;
          background: linear-gradient(90deg, transparent, #E11D48, transparent);
        }

        /* animated stitch loader */
        .mnt-loader { margin: 34px auto 0; display: flex; gap: 7px; justify-content: center; }
        .mnt-loader span {
          width: 7px; height: 7px; border-radius: 9999px; background: #E11D48;
          animation: mntBounce 1.3s ease-in-out infinite;
        }
        .mnt-loader span:nth-child(2){ animation-delay:.12s; background:#F43F5E }
        .mnt-loader span:nth-child(3){ animation-delay:.24s; background:#DB2777 }
        .mnt-loader span:nth-child(4){ animation-delay:.36s; background:#A855F7 }
        .mnt-loader span:nth-child(5){ animation-delay:.48s; background:#7C3AED }
        @keyframes mntBounce { 0%,60%,100%{ transform: translateY(0); opacity:.45 } 30%{ transform: translateY(-11px); opacity:1 } }

        .mnt-title {
          margin-top: 26px;
          font-size: 30px; line-height: 1.15; font-weight: 800;
          color: #FFFFFF;
        }
        @media (min-width: 640px) { .mnt-title { font-size: 38px; } }

        /* shimmering gradient text */
        .mnt-shimmer {
          background: linear-gradient(90deg,#E11D48 0%,#F472B6 25%,#A855F7 50%,#F472B6 75%,#E11D48 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: mntShine 3.5s linear infinite;
        }
        @keyframes mntShine { to { background-position: 200% center; } }

        .mnt-sub {
          margin: 14px auto 0; max-width: 380px;
          font-size: 14px; line-height: 1.7;
          color: rgba(255,255,255,.62);
        }

        /* indeterminate progress */
        .mnt-progress {
          margin: 28px auto 0; width: 190px; height: 3px; border-radius: 9999px;
          background: rgba(255,255,255,.12); overflow: hidden;
        }
        .mnt-progress-bar {
          width: 40%; height: 100%; border-radius: 9999px;
          background: linear-gradient(90deg,#E11D48,#A855F7);
          animation: mntSlide 1.8s ease-in-out infinite;
        }
        @keyframes mntSlide { 0%{ transform: translateX(-100%) } 100%{ transform: translateX(350%) } }

        /* contact card */
        .mnt-card {
          margin-top: 34px; padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.045);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        .mnt-card-title { font-size: 13px; font-weight: 700; color: #FFFFFF; margin-bottom: 10px; }
        .mnt-contact-list { display: flex; flex-direction: column; gap: 8px; }
        .mnt-contact {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          color: #FDA4AF; transition: color .2s;
        }
        .mnt-contact:hover { color: #FFFFFF; }

        /* socials */
        .mnt-socials { margin-top: 22px; display: flex; justify-content: center; gap: 8px; }
        .mnt-social {
          height: 40px; width: 40px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.7);
          border: 1px solid rgba(255,255,255,.12);
          transition: transform .2s, background .2s, color .2s;
        }
        .mnt-social:hover { background: rgba(255,255,255,.12); color: #fff; transform: translateY(-2px); }

        .mnt-staff { margin-top: 40px; font-size: 11px; color: rgba(255,255,255,.35); }
        .mnt-staff-link { color: #FDA4AF; font-weight: 700; text-decoration: none; }
        .mnt-staff-link:hover { color: #fff; text-decoration: underline; }

        @media (prefers-reduced-motion: reduce) {
          .mnt-orb, .mnt-loader span, .mnt-progress-bar, .mnt-shimmer,
          .mnt-content, .mnt-logo-wrap::after { animation: none !important; }
          .mnt-shimmer { -webkit-text-fill-color: #F472B6; color: #F472B6; }
        }
      `}</style>
    </div>
  );
}
