'use client';

import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    pendingListings: 0,
    openReports: 0,
    pendingVerifications: 0,
    totalUsers: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isUniversityAdmin = user?.role === 'university-admin';
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This would be implemented on your backend
        const response = await fetch('http://localhost:3001/api/v1/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // For now we'll use mock data
        // In real implementation, you would use data from the response
        setTimeout(() => {
          // Mock data
          setStats({
            pendingListings: 8,
            openReports: 4,
            pendingVerifications: 12,
            totalUsers: isUniversityAdmin ? 230 : 1450
          });

          setRecentReports([
            { id: 1, type: 'Listing', reason: 'Inappropriate content', date: '2023-05-20' },
            { id: 2, type: 'User', reason: 'Fake profile', date: '2023-05-19' },
            { id: 3, type: 'Listing', reason: 'Price too high', date: '2023-05-18' },
          ]);

          setPendingListings([
            { id: 1, title: 'Study Desk', price: 75, date: '2023-05-20' },
            { id: 2, title: 'Engineering Books', price: 120, date: '2023-05-19' },
            { id: 3, title: 'Dorm Refrigerator', price: 180, date: '2023-05-18' },
          ]);

          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, isUniversityAdmin]);

  return (
    <ProtectedRoute adminOnly={true}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Admin type banner */}
            <div className={`p-4 mb-6 rounded-lg ${isUniversityAdmin ? 'bg-purple-100 border-purple-200' : 'bg-blue-100 border-blue-200'} border`}>
              <p className="font-medium">
                {isUniversityAdmin 
                  ? `You are logged in as a University Admin for ${user?.adminUniversity?.name || 'your university'}.` 
                  : 'You are logged in as a Global Admin with access to all platform data.'}
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 uppercase">Pending Listings</p>
                <p className="text-2xl font-bold">{stats.pendingListings}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                <p className="text-sm text-gray-600 uppercase">Open Reports</p>
                <p className="text-2xl font-bold">{stats.openReports}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 uppercase">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-sm text-gray-600 uppercase">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Listings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Pending Listings</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingListings.map((listing) => (
                        <tr key={listing.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${listing.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}