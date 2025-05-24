'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Check if user is logged in when the app loads
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);
        
        // Fetch user data from API
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      const { token: authToken, data: userData } = data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData.user);

      // Redirect based on role
      if (userData.user.role === 'admin' || userData.user.role === 'university-admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return { error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if needed
      if (token) {
        await fetch('http://localhost:3000/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up local storage and state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      router.push('/');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: error.message };
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
