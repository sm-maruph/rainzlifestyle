import React, { useLayoutEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";

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

// New admin dashboard (sidebar shell + landing page)
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProducts from "./components/admin/AdminProducts";
import AdminCategories from "./components/admin/AdminCategories";
import AdminOrders from "./components/admin/AdminOrders";
import AdminDiscounts from "./components/admin/AdminDiscounts";
import AdminSale from "./components/admin/AdminSale";
import AdminCustomers from "./components/admin/AdminCustomers";
import AdminSettings from "./components/admin/AdminSettings";
import RequireAdmin from "./components/admin/RequireAdmin";

import Partners from "./components/Partner";
import BottomHeader from "./components/BottomHeader";
import Footer from "./components/Footer";
import "./App.css";
import AutoScrollUp from "./components/subcomponent/AutoScrollUp";
import ScrollToTop from "./components/subcomponent/ScrollToTop";
import LoadingWrapper from "./components/ReusableComponent/LoadingWrapper";

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Both /howdy (old admin) and /admin (new dashboard) hide the storefront chrome
  const isAdminPage =
    location.pathname.startsWith("/howdy") || location.pathname.startsWith("/admin");

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

  return (
    <>
      {!isAdminPage && (
        <Navbar
          ref={navRef}
          user={user}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onLogout={logout}
        />
      )}
      <AutoScrollUp />

      <main
        className="w-full mx-auto min-h-screen bg-gray-100 overflow-x-hidden"
        style={{ paddingTop: isAdminPage ? 0 : navHeight }}
      >
        <LoadingWrapper>
          <Routes>
            {/* ===== Admin dashboard — guarded: only logged-in admins ===== */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="sale" element={<AdminSale />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

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