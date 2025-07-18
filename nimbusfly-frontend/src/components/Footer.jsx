import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Branding & Newsletter */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-2">NimbusFly</h2>
            <p className="text-gray-400 mb-4">Your journey, our passion.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email for newsletter" 
                className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none"
              />
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/about-us" className="text-gray-300 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Airline Login */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Airline Management</h3>
            <ul className="space-y-2">
              <li><a href="/admin/login" className="text-gray-300 hover:text-blue-400 transition-colors">Airline Login</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0 ml-110">
            © 2025 NimbusFly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;