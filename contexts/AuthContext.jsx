import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user on mount if token exists
    useEffect(() => {
        const loadUser = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    if (response.success) {
                        setUser(response.user);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error loading user:', error);
                    removeAuthToken();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const register = async (username, email, password) => {
        const response = await authAPI.register(username, email, password);
        if (response.success) {
            setAuthToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
        }
        return response;
    };

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        if (response.success) {
            setAuthToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
        }
        return response;
    };

    const logout = () => {
        removeAuthToken();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
