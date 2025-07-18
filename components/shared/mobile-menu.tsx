import React from 'react';
import { Instagram, Twitter, Facebook, X } from 'lucide-react';
import Button from '@/components/shared/button';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => (
  <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="absolute right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-md p-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-xl font-medium text-white">Navejo</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="space-y-6">
        <a href="#mission" className="block text-white hover:text-gray-300 transition-colors uppercase text-lg">
          Features
        </a>
        <a href="#services" className="block text-white hover:text-gray-300 transition-colors uppercase text-lg">
          Pricing
        </a>
        <a href="#contact" className="block text-white hover:text-gray-300 transition-colors uppercase text-lg">
          Contact
        </a>
        <Link href="/auth/sign-in">
  <Button className="w-full uppercase mt-6 group relative overflow-hidden">
    Sign In
  </Button>
</Link>
       
      </nav>
      
      <div className="mt-12 pt-8 border-t border-white/20">
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Instagram">
            <Instagram size={20} />
          </a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Twitter">
            <Twitter size={20} />
          </a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Facebook">
            <Facebook size={20} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default MobileMenu;