/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from "react-router-dom";
import { User, Bell, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Auctions", path: "/auctions" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Bidzone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-neutral-900",
                isActive(link.path) ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center bg-neutral-100 rounded-full px-3 py-1.5 gap-2 border border-neutral-200 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
          <Search size={16} className="text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search auctions..." 
            className="bg-transparent border-none outline-none text-sm w-32 md:w-48"
          />
        </div>

        <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <Link to="/login" className="hidden md:block">
          <button className="btn-primary py-1.5 px-4 text-sm">Sign In</button>
        </Link>

        <button 
          className="md:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-neutral-200 p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-lg font-medium py-2",
                isActive(link.path) ? "text-neutral-900" : "text-neutral-500"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-neutral-100">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="btn-primary w-full">Sign In</button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
