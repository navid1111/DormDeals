import React from 'react';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatPrice = (price, pricingType) => {
    if (pricingType === 'free') return 'Free';
    if (pricingType === 'bidding') return 'Bidding';
    if (pricingType === 'hourly') return `$${price}/hr`;
    return `$${price}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/listings/${listing._id}`}>
        <div className="relative">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge(listing.status)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 truncate">
            {listing.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(listing.price, listing.pricingType)}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {listing.category}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{listing.listingType === 'item' ? 'Item' : 'Service'}</span>
            {listing.condition && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {listing.condition}
              </span>
            )}
          </div>
          
          {listing.owner && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                By {listing.owner.firstName} {listing.owner.lastName}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;