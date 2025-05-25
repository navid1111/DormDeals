'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for authentication check to complete
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (adminOnly && user?.role !== 'admin' && user?.role !== 'university-admin') {
        // If admin only route but user is not admin
        router.push('/dashboard/user');
      }
    }
  }, [loading, isAuthenticated, router, adminOnly, user]);

  // Show loading state or nothing while checking authentication
  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // For admin routes, check if user is admin
  if (adminOnly && user?.role !== 'admin' && user?.role !== 'university-admin') {
    return null; // Will be redirected by the useEffect
  }

  // If everything is fine, render the children
  return <>{children}</>;
}
