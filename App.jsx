import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIAssistant } from './components/AIAssistant';
import { AuthModal } from './components/AuthModal.jsx';
import { OrderHistory } from './components/OrderHistory.jsx';
import { Category } from './types.js';
import { productAPI, cartAPI, searchAPI } from './services/api.js';
import { RefreshCw, Search, SlidersHorizontal, Star, Loader2 } from 'lucide-react';

const App = () => {
  // --- Global State ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('shop');

  // --- Auth ---
  const { isAuthenticated } = useAuth();

  // --- Cart State ---
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- Search & Filter State ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Search specific
  const [searchResults, setSearchResults] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // --- Auth State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Side filters
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [minRating, setMinRating] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- Effects ---
  // Fetch products on mount and reset cart when auth changes
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [isAuthenticated]);

  // Fetch products when filters change
  useEffect(() => {
    if (view !== 'about' && !searchResults) {
      fetchProducts();
    }
  }, [view, activeCategory, priceRange, minRating]);

  // --- API Functions ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        category: activeCategory !== 'All' ? activeCategory : undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        minRating: minRating > 0 ? minRating : undefined,
        newArrivals: view === 'new-arrivals' ? 'true' : undefined
      };

      const response = await productAPI.getAll(filters);

      if (response.success) {
        // Normalize product IDs (MongoDB uses _id, convert to id for frontend)
        const normalizedProducts = response.data.map(p => ({
          ...p,
          id: p._id || p.id
        }));
        setProducts(normalizedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      if (!isAuthenticated) {
        setCart([]);
        return;
      }

      setCartLoading(true);
      const response = await cartAPI.get();

      if (response.success && response.data) {
        // Normalize cart items
        const normalizedCart = response.data.items.map(item => {
          const product = item.product;
          return {
            ...product,
            id: product._id || product.id,
            quantity: item.quantity
          };
        });
        setCart(normalizedCart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // If unauthorized, clear cart
      if (err.message.includes('unauthorized') || err.message.includes('Authentication')) {
        setCart([]);
      }
    } finally {
      setCartLoading(false);
    }
  };

  // --- Cart Logic ---
  const addToCart = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await cartAPI.addItem(product.id || product._id, 1);
      await fetchCart(); // Refresh cart
      setIsCartOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.message.includes('unauthorized') || err.message.includes('Authentication')) {
        setIsAuthModalOpen(true);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const updateQuantity = async (id, delta) => {
    try {
      const item = cart.find(item => item.id === id);
      if (!item) return;

      const newQuantity = item.quantity + delta;
      if (newQuantity < 1) {
        await removeFromCart(id);
        return;
      }

      await cartAPI.updateItem(id, newQuantity);
      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Error updating quantity:', err);
      // Show specific error message
      if (err.message.includes('stock')) {
        alert('Cannot increase quantity - insufficient stock available');
      } else {
        alert('Failed to update quantity. Please try again.');
      }
    }
  };

  const removeFromCart = async (id) => {
    try {
      await cartAPI.removeItem(id);
      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await cartAPI.checkout();
      if (response.success) {
        // Cart will be empty after checkout, refresh it
        await fetchCart();
        return response;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  };

  // --- Filtering Logic ---
  const filteredProducts = useMemo(() => {
    let result = searchResults || products;

    // If we have search results, use them directly
    if (searchResults) {
      return result;
    }

    // Apply client-side filters (price and rating are handled server-side, but we keep for consistency)
    result = result.filter(p => {
      const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
      const ratingMatch = minRating === 0 || p.rating >= minRating;
      return priceMatch && ratingMatch;
    });

    return result;
  }, [products, searchResults, priceRange, minRating]);

  // --- Handlers ---
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchResults(null); // Clear search when changing category
    setLastQuery('');
    setView('shop');
  };

  const handleSearch = async (query, isAI) => {
    if (!query.trim()) return;

    setAiLoading(true);
    setLastQuery(query);
    setView('shop'); // Ensure we are on shop view to see results

    try {
      if (isAI) {
        // Use AI search via backend - it returns full products
        const response = await searchAPI.aiSearch(query);

        if (response.success && response.data) {
          // Normalize product IDs
          const normalizedProducts = response.data.map(p => ({
            ...p,
            id: p._id || p.id
          }));
          setSearchResults(normalizedProducts);
        } else {
          setSearchResults([]);
        }
      } else {
        // Text search via backend
        const response = await productAPI.getAll({ search: query });
        if (response.success) {
          const normalizedProducts = response.data.map(p => ({
            ...p,
            id: p._id || p.id
          }));
          setSearchResults(normalizedProducts);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setAiLoading(false);
      setIsSearchOpen(false);
      setActiveCategory('All'); // Reset category pill to avoid confusion
    }
  };

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchResults(null);
    setLastQuery('');
    setPriceRange({ min: 0, max: 500 });
    setMinRating(0);
    setView('shop');
  };

  const categories = ['All', ...Object.values(Category)];

  // --- Render Helpers ---
  const renderAboutPage = () => (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-gradient-to-r from-primary to-secondary w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-lg transform rotate-12">
        <RefreshCw className="text-white w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-6">About Lumina Market</h1>
      <div className="prose prose-lg mx-auto text-slate-600">
        <p className="mb-6">
          Lumina Market isn't just another online store. We are a demonstration of what happens when
          modern web technologies meet cutting-edge Artificial Intelligence.
        </p>
        <p className="mb-6">
          Built with the MERN stack and powered by
          Google's Gemini 2.5 Flash, our goal is to make shopping intuitive, natural, and fast.
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Our Mission</h3>
        <p>
          To reduce the friction between "I need something for..." and "I found it."
          By understanding context through AI, we move beyond simple keyword matching.
        </p>
      </div>
      <button
        onClick={() => setView('shop')}
        className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-primary transition-all shadow-lg hover:shadow-primary/30"
      >
        Start Shopping
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        cartCount={cart.reduce((a, c) => a + (c.quantity || 0), 0)}
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onHomeClick={resetFilters}
        onNewArrivalsClick={() => { setView('new-arrivals'); setSearchResults(null); setLastQuery(''); }}
        onAboutClick={() => { setView('about'); }}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onViewOrders={() => setIsOrderHistoryOpen(true)}
        activeView={view}
      />

      {/* Hero Banner (Only on Main Shop View, no Search) */}
      {view === 'shop' && !lastQuery && activeCategory === 'All' && !loading && (
        <div className="relative bg-slate-900 py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" alt="Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              The Future of Shopping is Here
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Experience our AI-powered assistant to find exactly what you need in seconds.
            </p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-slate-900 bg-white hover:bg-slate-50 transition-all"
            >
              Try AI Search
            </button>
          </div>
        </div>
      )}

      {view === 'about' ? renderAboutPage() : (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              {searchResults !== null ? (
                <span className="flex items-center">
                  Search Results: "{lastQuery}"
                  <button onClick={resetFilters} className="ml-4 text-sm text-primary hover:underline flex items-center font-medium bg-primary/10 px-3 py-1 rounded-full">
                    <RefreshCw className="w-3 h-3 mr-1" /> Clear Search
                  </button>
                </span>
              ) : view === 'new-arrivals' ? 'New Arrivals' :
                activeCategory === 'All' ? 'All Products' : activeCategory
              }
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-slate-600">Loading products...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Filter Sidebar */}
              <aside className={`lg:w-64 w-full flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>

                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-slate-500">Close</button>
                </div>

                {/* Category List (Vertical for Sidebar) */}
                {view === 'shop' && !searchResults && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
                            ? 'bg-slate-100 text-primary'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Filter */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 rounded-md"
                          placeholder="Min"
                        />
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 rounded-md"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${minRating === stars ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center mr-2 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < stars ? 'fill-current' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        & Up
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setPriceRange({ min: 0, max: 500 }); setMinRating(0); }}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-900 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
                >
                  Reset Filters
                </button>
              </aside>

              {/* Mobile Filter Toggle */}
              <div className="w-full lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center justify-center w-full py-3 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700 font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900">No products match your criteria</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                      Try adjusting your price range, rating filter, or search query to find what you're looking for.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-lg hover:shadow-primary/25"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Lumina Market</h3>
              <p className="text-slate-500 text-sm">
                The premium destination for modern lifestyle products.
                Powered by advanced AI to help you shop smarter.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button className="hover:text-primary text-left">Contact Us</button></li>
                <li><button className="hover:text-primary text-left">Shipping Policy</button></li>
                <li><button className="hover:text-primary text-left">Returns</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button className="hover:text-primary text-left">Twitter</button></li>
                <li><button className="hover:text-primary text-left">Instagram</button></li>
                <li><button className="hover:text-primary text-left">Facebook</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Lumina Market. Built with Passion.
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <AIAssistant
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        isSearching={aiLoading}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <OrderHistory
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />
    </div>
  );
};

const AppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;

