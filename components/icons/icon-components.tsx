import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Custom SVG Icons for design sites
export const DribbbleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.5 6.5c-.6 2.07-1.85 3.84-3.5 5.07-.36-.63-.79-1.25-1.28-1.83 1.07-.42 2.04-.98 2.86-1.67.45-.38.87-.78 1.25-1.2.23-.18.44-.37.67-.37zm-1.5 7.5c-1.5 1.5-3.5 2.5-5.5 2.5s-4-1-5.5-2.5c1.5-1.5 3.5-2.5 5.5-2.5s4 1 5.5 2.5z"/>
  </svg>
);

export const PinterestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49-.1-.9-.18-2.27.04-3.25.2-.89 1.32-5.6 1.32-5.6s-.34-.67-.34-1.66c0-1.56.9-2.72 2.03-2.72.96 0 1.42.72 1.42 1.58 0 .96-.61 2.4-.93 3.73-.26 1.12.56 2.04 1.67 2.04 2.01 0 3.35-2.59 3.35-5.66 0-2.34-1.58-4.1-4.21-4.1-3.06 0-4.93 2.25-4.93 4.77 0 .87.25 1.49.65 1.97.18.22.21.31.14.56-.05.19-.17.67-.22.86-.07.27-.23.33-.53.2-1.49-.61-2.19-2.25-2.19-4.09 0-3.06 2.44-6.73 7.27-6.73 3.87 0 6.42 2.8 6.42 5.78 0 3.95-2.19 6.92-5.42 6.92-1.08 0-2.09-.58-2.43-1.32 0 0-.58 2.27-.7 2.72-.22.82-.65 1.62-1.05 2.28C10.18 21.91 11.09 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
);

export const BehanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="text-white">
    <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
  </svg>
);

// Design Site Icon Component with Tooltip
export const DesignSiteIcon = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex items-center justify-center group">
        <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center group-hover:bg-white/30 transition-colors cursor-pointer">
          {children}
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p>{name}</p>
    </TooltipContent>
  </Tooltip>
);