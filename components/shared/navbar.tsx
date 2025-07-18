'use client';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Button from '@/components/shared/button';
import MobileMenu from '@/components/shared/mobile-menu';
import Link from 'next/link';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 text-white relative z-10">
        <div className="flex items-center space-x-3">
          <span className="text-lg md:text-xl font-medium">Navejo</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#mission" 
            className="hover:text-gray-300 transition-colors uppercase focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
          >
            Features
          </a>
          <a 
            href="#services" 
            className="hover:text-gray-300 transition-colors uppercase focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
          >
            Pricing
          </a>
          <a 
            href="#contact" 
            className="hover:text-gray-300 transition-colors uppercase focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
          >
            Contact
          </a>
          
          <Link href="/auth/sign-in">
  <Button className="uppercase group relative overflow-hidden cursor-pointer">
    Sign In
  </Button>
</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-2"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;