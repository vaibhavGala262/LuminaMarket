import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, DollarSign, ShoppingBag, Loader2 } from 'lucide-react';
import { orderAPI } from '../services/api.js';

export const OrderHistory = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await orderAPI.getUserOrders();
            if (response.success) {
                setOrders(response.data);
            }
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="relative p-6 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Package className="w-7 h-7 mr-3 text-primary" />
                        My Orders
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">View your order history</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-slate-500">Loading your orders...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={fetchOrders}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
                            <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-primary transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                                >
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-lg font-bold text-slate-900">
                                                <DollarSign className="w-5 h-5" />
                                                {order.totalAmount.toFixed(2)}
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-3 border-t border-slate-100 pt-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900 truncate">
                                                        {item.productName}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right font-medium text-slate-900">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
