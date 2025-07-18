import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/shared/navbar';
import HeroSection from '@/components/shared/home/hero';
import FeaturesComponent from '@/components/shared/home/features';
import PricingSection from '@/components/shared/home/pricing';
// import ContactSection from '@/components/shared/home/contact';
import Footer from '@/components/shared/footer';

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden flex flex-col" 
           style={{
             backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/images/hero.png')`
           }}>
        <Navbar />
        <HeroSection />
        <FeaturesComponent />
        <PricingSection />
        {/* <ContactSection /> */}
        <Footer />

      </div>
    </TooltipProvider>
  );
}