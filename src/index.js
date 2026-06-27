import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from "./context/SettingsContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
root.render(
  <React.StrictMode>
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();