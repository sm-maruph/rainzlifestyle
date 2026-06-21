import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/Navbar";
import LandingComponent from "./components/LandingPage";
import CategoryPage from "./components/CategoryPage";
import ProductDetail from "./components/ProductDetail";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import ReusableHome from "./components/ReusableComponent/ReusableHome";
import AdminLogin from "./components/AdminLogin";
import AdminHome from "./components/AdminComponent/AdminHome";
import Partners from "./components/Partner";
import BottomHeader from "./components/BottomHeader";
import Footer from "./components/Footer";
import "./App.css";
import ProductDetails from "./components/ReusableComponent/ProductDetails";
import AutoScrollUp from "./components/subcomponent/AutoScrollUp";
import ScrollToTop from "./components/subcomponent/ScrollToTop";
import { jwtDecode } from "jwt-decode";
import LoadingWrapper from "./components/ReusableComponent/LoadingWrapper";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith("/howdy");

  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  // Function to check if token is valid and not expired
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      // decoded.exp is in seconds, convert to ms and compare with current time
      if (decoded.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Logout helper
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
    if (isAdminPage) {
      navigate("/howdy"); // Redirect to admin login on logout
    }
  };

  // Save token on login
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("adminToken", newToken);
    navigate("/howdy");
  };

  // On mount or token change, validate token, if invalid logout
  useEffect(() => {
    if (token && !isTokenValid(token)) {
      handleLogout();
    }
  }, [token]);

  return (
    <>
      {!isAdminPage && <Navbar />}
      <AutoScrollUp />
      <main
        className={`w-full mx-auto min-h-screen bg-gray-100 ${isAdminPage ? "" : "mt-8 lg:pt-20"
          }`}
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
            <Route path="/" element={<LandingComponent />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/new-arrivals" element={<CategoryPage />} />
            <Route path="/:category" element={<CategoryPage />} />
            <Route path="/:category/:subcategory" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/:category" element={<ReusableHome />} />
              <Route path="/:category/:subcategory" element={<ReusableHome />} />
              <Route
                path="/:category/:subcategory/:id"
                element={<ProductDetails />}
              />
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
