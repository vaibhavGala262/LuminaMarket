import React, { useState } from 'react';
import { Sparkles, Search, X, Loader2 } from 'lucide-react';

export const AIAssistant = ({ onSearch, isOpen, onClose, isSearching }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, true); // True for AI search
    }
  };

  const suggestions = [
    "I need a gift for a tech lover under $200",
    "Something to wear for a summer beach party",
    "Home decor for a modern living room",
    "Essential gear for a home office setup"
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 transition-opacity">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative p-6 pb-0">
            <button 
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Gemini Shopping Assistant</h2>
                    <p className="text-sm text-slate-500">Describe what you're looking for in natural language.</p>
                </div>
            </div>
        </div>

        {/* Search Input */}
        <div className="px-6 pb-6">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'I need a durable backpack for hiking...'"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-lg"
                    autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                
                <button 
                    type="submit"
                    disabled={!query.trim() || isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex items-center"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Thinking...
                        </>
                    ) : (
                        <>
                            Ask AI <Sparkles className="w-3 h-3 ml-2" />
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* Suggestions */}
        <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Try asking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setQuery(suggestion);
                            // Optional: Auto-submit on click or just fill
                        }}
                        className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:shadow-md transition-all"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

