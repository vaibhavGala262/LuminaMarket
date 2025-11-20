import React from 'react';
import { Plus, Star } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // Fallback image if the main one fails
            e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
            {product.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-xl font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          <button 
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-primary transition-colors shadow-lg hover:shadow-primary/30 active:scale-95"
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

