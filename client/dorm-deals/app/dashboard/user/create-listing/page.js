'use client';

import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateListing() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    listingType: 'item',
    pricingType: 'fixed',
    price: '',
    condition: 'Good',
    visibilityMode: 'university',
    images: []
  });

  // Categories
  const categories = [
    'Books',
    'Electronics',
    'Furniture',
    'Clothing',
    'Study Materials',
    'Tutoring Services',
    'Dormitory Supplies',
    'Transportation',
    'Events & Tickets',
    'Other'
  ];

  // Conditions for items
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle price field
  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setFormData({
        ...formData,
        price: value
      });
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      images: Array.from(e.target.files)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      toast.loading('Creating your listing...', { id: 'createListing' });

      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Please fill in all required fields', { id: 'createListing' });
        setLoading(false);
        return;
      }

      if (formData.pricingType === 'fixed' && !formData.price) {
        toast.error('Please enter a price for your listing', { id: 'createListing' });
        setLoading(false);
        return;
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        listingType: formData.listingType,
        pricingType: formData.pricingType,
        price: formData.pricingType === 'free' ? 0 : parseFloat(formData.price),
        condition: formData.listingType === 'item' ? formData.condition : undefined,
        visibilityMode: formData.visibilityMode
      };

      const response = await fetch('http://localhost:3000/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      // Handle image uploads if there are any
      if (formData.images.length > 0) {
        // Image upload functionality would go here
        console.log('Would upload images for listing ID:', data.data._id);
      }

      toast.success('Listing created successfully!', { id: 'createListing' });
      
      // Redirect to the user's listings page
      router.push('/dashboard/user/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Failed to create listing', { id: 'createListing' });
    } finally {
      setLoading(false);
    }
  };

  // Conditional pricing section based on pricing type
  const renderPricingSection = () => {
    if (formData.pricingType === 'free') {
      return (
        <div className="bg-green-50 p-3 rounded-md my-3">
          <p className="text-green-700">This item will be listed for free.</p>
        </div>
      );
    } else if (formData.pricingType === 'fixed') {
      return (
        <div className="mt-3">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (BDT) *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">৳</span>
            </div>
            <input
              type="text"
              name="price"
              id="price"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={formData.price}
              onChange={handlePriceChange}
              required={formData.pricingType === 'fixed'}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">BDT</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Listing</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields as before... */}
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science Textbook"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Provide details about your listing"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listing Type */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Listing Type</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="listingType"
                      value="item"
                      checked={formData.listingType === 'item'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">Item</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="listingType"
                      value="service"
                      checked={formData.listingType === 'service'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">Service</span>
                  </label>
                </div>
              </div>

              {/* Condition for items */}
              {formData.listingType === 'item' && (
                <div className="mb-4">
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.condition}
                    onChange={handleChange}
                    required={formData.listingType === 'item'}
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Pricing Type *</label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pricingType"
                      value="fixed"
                      checked={formData.pricingType === 'fixed'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">Fixed Price</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pricingType"
                      value="free"
                      checked={formData.pricingType === 'free'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">Free</span>
                  </label>
                </div>
              </div>

              {renderPricingSection()}
            </div>

            {/* Visibility */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visibility</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Who can see this listing? *</label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibilityMode"
                      value="university"
                      checked={formData.visibilityMode === 'university'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">My University Only</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibilityMode"
                      value="public"
                      checked={formData.visibilityMode === 'public'}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">Public</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
              
              <div className="mb-4">
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Upload Images (Optional)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload up to 5 images (JPG, PNG). Max size: 5MB each.
                </p>
              </div>

              {/* Preview images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from(formData.images).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}