import React from "react";
import { Palette } from "lucide-react";

interface NavbarProps {
  onReset: () => void;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf9f6]/90 backdrop-blur-md">
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={onReset} 
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <Palette 
            className="w-6 h-6 text-stone-900 group-hover:scale-105 transition-transform shrink-0" 
            strokeWidth={2}
          />
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Huey
          </span>
        </div>
      </div>
    </header>
  );
};


