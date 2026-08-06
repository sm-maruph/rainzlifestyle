import { useEffect, useState } from "react";
import LoadingRainz from "./LoadingRainz";

// Module state survives client-side navigation but resets on a full browser reload.
let landingLoaderShown = false;

function LoadingWrapper({ children }) {
  const [loading, setLoading] = useState(() => !landingLoaderShown);

  useEffect(() => {
    if (!loading) return undefined;
    landingLoaderShown = true;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      {children}
      {loading && <LoadingRainz />}
    </>
  );
}

export default LoadingWrapper;
