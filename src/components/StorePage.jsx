import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import pages from "../storePages.json";

export default function StorePage() {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const page = pages[pathname.replace(/\/$/, "")];
  if (!page) return null;
  const email = settings.supportEmail || "rainzlifestyle.official@gmail.com";
  return (
    <article className="mx-auto max-w-4xl px-5 py-10 sm:py-16 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link to="/">Home</Link><span className="mx-2">/</span>{page.title}</nav>
      <header className="mb-8 border-b border-gray-200 pb-8">
        <p className="text-sm uppercase tracking-widest text-gray-500">Rainz Lifestyle</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{page.title}</h1>
        <p className="mt-4 leading-relaxed text-gray-600">{page.description}</p>
      </header>
      {page.sections.map(([heading, text]) => (
        <section key={heading} className="mb-7"><h2 className="mb-3 text-xl font-semibold">{heading}</h2><p className="leading-7">{text}</p></section>
      ))}
      <aside className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Contact Rainz Lifestyle</h2>
        <p className="mt-3"><a href={`mailto:${email}`}>{email}</a></p>
        {settings.supportPhone && <p className="mt-2"><a href={`tel:${settings.supportPhone.replace(/[^+\d]/g, "")}`}>{settings.supportPhone}</a></p>}
        {settings.address && <p className="mt-2">{settings.address}{settings.city ? `, ${settings.city}` : ""}</p>}
        {settings.hours && <p className="mt-2">Customer service hours: {settings.hours}</p>}
        <div className="mt-5 flex flex-wrap gap-5"><Link to="/men">Shop Men</Link><Link to="/track-order">Track Order</Link><Link to="/cancellation-return-policy">Cancellation & Returns</Link></div>
      </aside>
    </article>
  );
}
