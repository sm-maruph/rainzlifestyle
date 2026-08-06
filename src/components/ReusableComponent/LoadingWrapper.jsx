import { useEffect, useState } from "react";
import LoadingRainz from "./LoadingRainz";

const LANDING_LOADED_KEY = "rainz_landing_loaded";

function LoadingWrapper({ children }) {
  const [loading, setLoading] = useState(() => sessionStorage.getItem(LANDING_LOADED_KEY) !== "true");

  useEffect(() => {
    if (!loading) return undefined;

    const timer = setTimeout(() => {
      sessionStorage.setItem(LANDING_LOADED_KEY, "true");
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]);

  return loading ? <LoadingRainz /> : children;
}

export default LoadingWrapper;
