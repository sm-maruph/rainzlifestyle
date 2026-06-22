import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/Navbar";
import LandingComponent from "./components/LandingPage";
import CategoryPage from "./components/CategoryPage";
import ProductDetail from "./components/ProductDetail";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import Wishlist from "./components/Wishlist";
import Cart from "./components/Cart";
import TrackOrder from "./components/TrackOrder";
import Stores from "./components/Stores";
import SalePage from "./components/SalePage";

import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import AdminLogin from "./components/AdminLogin";
import AdminHome from "./components/AdminComponent/AdminHome";
import Partners from "./components/Partner";
import BottomHeader from "./components/BottomHeader";
import Footer from "./components/Footer";
import "./App.css";
import AutoScrollUp from "./components/subcomponent/AutoScrollUp";
import ScrollToTop from "./components/subcomponent/ScrollToTop";
import { jwtDecode } from "jwt-decode";
import LoadingWrapper from "./components/ReusableComponent/LoadingWrapper";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith("/howdy");

  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  // Measure the fixed navbar so <main> always starts right below it (any screen size)
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(64);

  useLayoutEffect(() => {
    if (isAdminPage) {
      setNavHeight(0);
      return;
    }
    const el = navRef.current;
    if (!el) return;
    const measure = () => setNavHeight(el.offsetHeight || 0);
    measure();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro && ro.disconnect();
    };
  }, [isAdminPage]);

  // Check if token is valid and not expired
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) return false;
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
    if (isAdminPage) navigate("/howdy");
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("adminToken", newToken);
    navigate("/howdy");
  };

  useEffect(() => {
    if (token && !isTokenValid(token)) handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      {!isAdminPage && <Navbar ref={navRef} />}
      <AutoScrollUp />

      <main
        className="w-full mx-auto min-h-screen bg-gray-100 overflow-x-hidden"
        style={{ paddingTop: isAdminPage ? 0 : navHeight }}
      >
        <LoadingWrapper>
          <Routes>
            <Route
              path="/howdy"
              element={
                isTokenValid(token) ? (
                  <AdminHome token={token} onLogout={handleLogout} />
                ) : (
                  <AdminLogin onLogin={handleLogin} />
                )
              }
            />

            {/* Static routes (rank above the dynamic /:category in React Router v6) */}
            <Route path="/" element={<LandingComponent />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/new-arrivals" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/account/orders" element={<TrackOrder />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/sale" element={<SalePage />} />

            {/* Dynamic category / subcategory listing */}
            <Route path="/:category" element={<CategoryPage />} />
            <Route path="/:category/:subcategory" element={<CategoryPage />} />

            <Route
              path="*"
              element={
                <div className="p-10 text-center text-red-500 text-xl">
                  404 - Page Not Found
                </div>
              }
            />
          </Routes>
        </LoadingWrapper>
        <ScrollToTop />
      </main>

      {!isAdminPage && (
        <>
          <Partners />
          <BottomHeader />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;