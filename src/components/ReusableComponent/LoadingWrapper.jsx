import { useEffect, useState } from "react";
import { useNavigationType, useLocation } from "react-router-dom";
import LoadingRainz from "./LoadingRainz";
function LoadingWrapper({ children }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    // Simulate loading delay or actual data fetching
    const timer = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [location]);

  return loading ? <LoadingRainz /> : children;
}

export default LoadingWrapper;
