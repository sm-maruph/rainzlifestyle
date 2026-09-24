import { useId } from "react";
import { Link } from "react-router-dom";

export default function PolicyAgreement({ checked, onChange }) {
  const id = useId();
  return <div className="flex items-start gap-2 text-xs leading-5 text-gray-600">
    <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: "var(--brand)" }} required />
    <label htmlFor={id}>I have read and agree to the <Link className="underline" to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</Link>, <Link className="underline" to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and <Link className="underline" to="/cancellation-return-policy" target="_blank" rel="noopener noreferrer">Return &amp; Refund Policy</Link>.</label>
  </div>;
}
