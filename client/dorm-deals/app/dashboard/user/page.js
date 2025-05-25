'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { listingService } from '../../../services/listingService';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 0,
    completedTransactions: 0,
    savedListings: 0,
    newMessages: 0
  });
  const [listings, setListings] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's own listings using the new method
        const listingsData = await listingService.getMyListings({ limit: 5 });
        
        // Calculate stats based on real data
        const activeListingsCount = listingsData.data.filter(listing => listing.status === 'active').length;
        const completedListingsCount = listingsData.data.filter(listing => listing.status === 'sold').length;
        
        // Fetch saved listings count (assuming there's an endpoint for this)
        // For now, we'll use a mock count
        const savedListingsCount = 5;
        
        // Fetch messages count (assuming there's an endpoint for this)
        // For now, we'll use a mock count
        const newMessagesCount = 3;
        
        // Update stats
        setStats({
          activeListings: activeListingsCount,
          completedTransactions: completedListingsCount,
          savedListings: savedListingsCount,
          newMessages: newMessagesCount
        });

        // Update listings
        setListings(listingsData.data.map(listing => ({
          id: listing._id,
          title: listing.title,
          price: listing.price || 0,
          status: listing.status,
          views: listing.viewCount || 0,
          date: new Date(listing.createdAt).toISOString().split('T')[0]
        })));

        // For meetups, we'll keep mock data for now
        // In a real implementation, you would fetch meetups from your API
        setMeetups([
          { id: 1, item: 'Chemistry Notes', with: 'Jane Doe', date: '2023-05-25 14:30', location: 'University Library' },
          { id: 2, item: 'Biology Textbook', with: 'John Smith', date: '2023-05-28 10:00', location: 'Student Center' }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* User welcome message */}
            <div className="p-4 mb-6 rounded-lg bg-blue-50 border border-blue-100">
              <p className="font-medium">
                Welcome back, {user?.firstName || 'User'}! Here's what's happening with your account.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 uppercase">Active Listings</p>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
                <Link href="/dashboard/user/listings" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  View all
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-sm text-gray-600 uppercase">Completed Transactions</p>
                <p className="text-2xl font-bold">{stats.completedTransactions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 uppercase">Saved Listings</p>
                <p className="text-2xl font-bold">{stats.savedListings}</p>
                <Link href="/dashboard/user/saved" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  View all
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 uppercase">New Messages</p>
                <p className="text-2xl font-bold">{stats.newMessages}</p>
                <Link href="/dashboard/user/messages" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  View all
                </Link>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Listings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Your Listings</h2>
                  <Link href="/dashboard/user/listings" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {listings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {listings.map((listing) => (
                          <tr key={listing.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <Link href={`/listings/${listing.id}`} className="hover:text-blue-600">
                                {listing.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {listing.price > 0 ? `$${listing.price}` : 'Free'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.views}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                {listing.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">You don't have any listings yet</p>
                )}
              </div>

              {/* Upcoming Meetups */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Upcoming Meetups</h2>
                  <Link href="/dashboard/user/meetups" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {meetups.length > 0 ? (
                  <div className="space-y-4">
                    {meetups.map((meetup) => (
                      <div key={meetup.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{meetup.item}</p>
                            <p className="text-sm text-gray-500">With: {meetup.with}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{meetup.date}</p>
                            <p className="text-sm text-gray-500">{meetup.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No upcoming meetups</p>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/user/create-listing" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center">
                  Create New Listing
                </Link>
                <Link href="/dashboard/user/messages" className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center">
                  Check Messages
                </Link>
                <Link href="/meetups/schedule" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center">
                  Schedule Meetup
                </Link>
                <Link href="/dashboard/user/profile" className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-4 text-center">
                  Edit Profile
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

// Helper function to get the appropriate color for listing status
function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'sold':
      return 'bg-blue-100 text-blue-800';
    case 'deleted':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}