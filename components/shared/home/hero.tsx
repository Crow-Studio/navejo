import React from 'react';
import { Twitter, Chrome } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Button from '@/components/shared/button';
import { DribbbleIcon, PinterestIcon, BehanceIcon,  } from '@/components/icons/icon-components';
import GrainOverlay from '@/components/shared/GrainOverlay';

const HeroSection = () => {
  const inspirationSites = [
    { name: 'Twitter', icon: <Twitter size={20} className="text-white" /> },
    { name: 'Dribbble', icon: <DribbbleIcon /> },
    { name: 'Pinterest', icon: <PinterestIcon /> },
    { name: 'Behance', icon: <BehanceIcon /> },
    { name: 'Chrome', icon: <Chrome size={20} className="text-white" /> }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 bg-cover bg-center bg-no-repeat relative oveflow-hidden"
       style={{
           backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/images/hero.png')`
         }}>
        <GrainOverlay />
      {/* Main Content */}
      <main id="main-content" className="flex flex-col justify-center items-start px-4 md:px-8 py-6 sm:py-8 md:py-12 lg:py-20 text-white max-w-4xl flex-1">
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light mb-4 md:mb-6 lg:mb-8 leading-tight">
            Bring order <br/> to your creative chaos
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 lg:mb-12 max-w-lg leading-relaxed opacity-90">
            A powerful bookmarking workspace built for frontend engineers and designers. Collect, organize, and share your most valuable links — all in one place.
          </p>
          
          <Button size="large" className="uppercase bg-white text-black hover:bg-gray-100 group relative overflow-hidden w-fit px-4 py-2 text-sm sm:text-base">
           Create Bookmark
          </Button>
        </div>
      </main>

      {/* Bottom Content - Using flex positioning instead of absolute */}
      <div className="px-4 md:px-8 py-4 md:py-6 lg:py-8 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
          <div className="text-white">
            {/* Empty space for layout balance */}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 md:space-x-8 relative w-full sm:w-auto justify-end">
            {/* Desktop line */}
            <div className="hidden md:block absolute right-full top-1/2 transform -translate-y-1/2 w-16 lg:w-24 h-px bg-white/40 mr-6 lg:mr-8"></div>
            
            {/* Mobile and Desktop: Unified icon list */}
            <div className="flex flex-row space-x-3 sm:space-x-4">
              {inspirationSites.map((site) => (
                <Tooltip key={site.name}>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                      {site.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{site.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection