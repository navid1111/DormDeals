'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function UserListings() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`http://localhost:3000/api/v1/listings?status=${filter}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        
        setListings(data.data.map(listing => ({
          id: listing._id,
          title: listing.title,
          price: listing.price || 0,
          status: listing.status,
          category: listing.category,
          listingType: listing.listingType,
          condition: listing.condition,
          views: listing.viewCount || 0,
          createdAt: new Date(listing.createdAt).toLocaleDateString(),
          image: listing.images && listing.images.length > 0 ? listing.images[0] : null
        })));
        
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchListings();
    }
  }, [token, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Listings</h1>
          <Link 
            href="/dashboard/user/create-listing" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Create New Listing
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['all', 'active', 'pending', 'sold', 'deleted'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${filter === tab 
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <Link href={`/listings/${listing.id}`}>
                      <div className="h-48 bg-gray-200 relative">
                        {listing.image ? (
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <p className="text-gray-500">No image</p>
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            <Link href={`/listings/${listing.id}`} className="hover:text-blue-600">
                              {listing.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {listing.category} • {listing.listingType === 'item' ? listing.condition : 'Service'}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {listing.price > 0 ? `৳${listing.price}` : 'Free'}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          {listing.views} views • Listed on {listing.createdAt}
                        </p>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/dashboard/user/edit-listing/${listing.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all'
                    ? "You haven't created any listings yet."
                    : `You don't have any ${filter} listings.`}
                </p>
                <Link 
                  href="/dashboard/user/create-listing" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Listing
                </Link>
              </div>
            )}
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