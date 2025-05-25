'use client';

import { useEffect, useState } from 'react';
// import { blistingService } from '../../../services/moderateService';
import { moderationService } from '../../../services/moderateService';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

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
        setLoading(true);

        // Fetch pending listings and count using moderationService
        const [pendingListingsRes, pendingCount] = await Promise.all([
          moderationService.getPendingListings(),
          moderationService.getPendingListingsCount()
        ]);

        // No recentReports in moderationService, so leave as empty or implement if needed
        setStats({
          pendingListings: pendingCount,
          openReports: 0, // No reports in moderationService
          pendingVerifications: 0,
          totalUsers: isUniversityAdmin ? 230 : 1450 // Replace with real data if available
        });

        setPendingListings(
          pendingListingsRes.data.map(l => ({
            id: l._id,
            title: l.title,
            price: l.price,
            date: new Date(l.createdAt).toISOString().split('T')[0]
          }))
        );

        setRecentReports([]); // No recentReports in moderationService

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, isUniversityAdmin]);

  // Approve handler
  const handleApprove = async (listingId) => {
    try {
      await moderationService.approveListing(listingId);
      // Remove the approved listing from the UI
      setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
      setStats((prev) => ({
        ...prev,
        pendingListings: prev.pendingListings - 1
      }));
    } catch (error) {
      // Optionally handle error (e.g., show a toast)
      console.error('Failed to approve listing:', error);
    }
  };

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
                            {/* Review button can stay or be removed */}
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleApprove(listing.id)}
                            >
                              Approve
                            </button>
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