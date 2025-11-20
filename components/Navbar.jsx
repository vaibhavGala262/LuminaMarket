import React from 'react';
import { ShoppingCart, Search, Sparkles, Menu } from 'lucide-react';

export const Navbar = ({ 
  cartCount, 
  onCartClick, 
  onSearchClick, 
  onHomeClick,
  onNewArrivalsClick,
  onAboutClick,
  activeView
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={onHomeClick}>
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg mr-2">
               <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Lumina Market</span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={onHomeClick} 
              className={`transition-colors font-medium ${activeView === 'shop' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              Shop
            </button>
            <button 
              onClick={onNewArrivalsClick} 
              className={`transition-colors font-medium ${activeView === 'new-arrivals' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              New Arrivals
            </button>
            <button 
              onClick={onAboutClick} 
              className={`transition-colors font-medium ${activeView === 'about' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              About
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onSearchClick}
              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-full transition-all"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <button 
              onClick={onCartClick}
              className="relative p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-full transition-all"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

