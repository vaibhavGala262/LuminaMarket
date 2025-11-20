import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';

export const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto">
          <div className="h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-primary" />
                Your Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-900">Your cart is empty</p>
                    <p className="text-slate-500">Looks like you haven't added anything yet.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex py-2">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3 className="line-clamp-1 mr-2"><a href="#">{item.name}</a></h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded-l-lg disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-2 font-medium text-slate-900 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded-r-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="font-medium text-red-500 hover:text-red-600 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !checkoutSuccess && (
              <div className="border-t border-slate-100 px-6 py-6 bg-slate-50/50">
                <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-slate-500 mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <button
                  className="w-full flex items-center justify-center rounded-full border border-transparent bg-primary px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-indigo-700 transition-all hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    setIsCheckingOut(true);
                    try {
                      await onCheckout();
                      setCheckoutSuccess(true);
                      setTimeout(() => {
                        setCheckoutSuccess(false);
                        onClose();
                      }, 2000);
                    } catch (error) {
                      console.error('Checkout failed:', error);
                      alert('Checkout failed. Please try again.');
                    } finally {
                      setIsCheckingOut(false);
                    }
                  }}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>
                <div className="mt-4 flex justify-center text-center text-sm text-slate-500">
                  <p>
                    or
                    <button
                      type="button"
                      className="font-medium text-primary hover:text-indigo-500 ml-1"
                      onClick={onClose}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {checkoutSuccess && (
              <div className="border-t border-slate-100 px-6 py-8 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h3>
                    <p className="text-slate-600">Thank you for your purchase.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

