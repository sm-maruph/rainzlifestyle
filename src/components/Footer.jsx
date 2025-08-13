// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center relative border-t border-gray-200">
  {/* Payment Icons */}
  <div className="flex space-x-4 mb-2 md:mb-0">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" className="h-4 object-contain" />
    <img src="https://ts3.mm.bing.net/th?id=OIP.Y6-wJg-HiIJqiI8nok881AHaFr&pid=15.1" alt="Visa" className="h-4 object-contain" />
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 object-contain" />
  </div>

  {/* Copyright Information */}
  <p className="text-gray-600 text-xs md:text-sm text-center md:text-right">
    Copyright &copy; 2025 <span className="font-semibold">Materials & More Enterprise (M&M)</span> All rights reserved.
  </p>

  {/* Developed By */}
  <p className="text-gray-600 text-xs md:text-sm text-center md:text-left mt-4 md:mt-0 md:ml-4">
    Developed by{' '}
    <a
      href="https://theatives.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-mm-primary hover:underline font-semibold"
    >
      Theatives
    </a>
  </p>
</footer>

  );
};

export default Footer;
