import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../../services/listingService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import BidModal from './BidModal';
import { toast } from 'react-hot-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingService.getListing(id);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await listingService.deleteListing(id);
      navigate('/dashboard/user/listings');
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const formatPrice = (price, pricingType) => {
    if (pricingType === 'free') return 'Free';
    if (pricingType === 'bidding') return 'Open to Bidding';
    if (pricingType === 'hourly') return `${price}/hour`;
    return `${price}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const isOwner = user && listing && listing.owner._id === user.id;
  const canBid = user && listing && listing.pricingType === 'bidding' && !isOwner && listing.status === 'active';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <button
          onClick={() => navigate('/listings')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {listing.images && listing.images.length > 0 ? (
              <div>
                <div className="mb-4">
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg shadow-md"
                  />
                </div>
                {listing.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${listing.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">No Image Available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                {getStatusBadge(listing.status)}
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(listing.price, listing.pricingType)}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  {listing.category}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  {listing.listingType === 'item' ? 'Item' : 'Service'}
                </span>
                {listing.condition && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {listing.condition}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {listing.owner && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    {listing.owner.profileImage ? (
                      <img
                        src={listing.owner.profileImage}
                        alt={`${listing.owner.firstName} ${listing.owner.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {listing.owner.firstName?.charAt(0)}{listing.owner.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {listing.owner.firstName} {listing.owner.lastName}
                      </p>
                      {listing.owner.verificationStatus && (
                        <span className="text-sm text-green-600">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {listing.bids && listing.bids.length > 0 && isOwner && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold mb-2">Bids ({listing.bids.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {listing.bids.map((bid, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">${bid.amount}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {bid.message && (
                          <p className="text-sm text-gray-600 mt-1">{bid.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/listings/${id}/edit`)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit Listing
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {canBid && (
                    <button
                      onClick={() => setShowBidModal(true)}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Place Bid
                    </button>
                  )}
                  <button
                    onClick={() => toast.success('Contact feature coming soon!')}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Contact Seller
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <BidModal
          listing={listing}
          onClose={() => setShowBidModal(false)}
          onBidSubmitted={fetchListing}
        />
      )}
    </div>
  );
};

export default ListingDetail;