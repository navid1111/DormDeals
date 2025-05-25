'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiDollarSign, FiEye, FiTag, FiUpload, FiX } from 'react-icons/fi';
import { listingService } from '../../../../services/listingService';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../context/AuthContext';

export default function CreateListing() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
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
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }
    
    setFormData({
      ...formData,
      images: files
    });
  };

  // Remove image from preview
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  // Handle form navigation
  const nextStep = () => {
    if (activeStep === 1) {
      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Please fill in all required fields in this section');
        return;
      }
    } else if (activeStep === 2) {
      if (formData.pricingType === 'fixed' && !formData.price) {
        toast.error('Please enter a price for your listing');
        return;
      }
    }
    
    setActiveStep(activeStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
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
        visibilityMode: formData.visibilityMode,
        images: formData.images
      };

      // Use the listingService instead of a direct fetch call
      await listingService.createListing(listingData);
      
      toast.success('Listing created successfully!', { id: 'createListing' });
      
      // Redirect to the user's listings page
      // router.push('/dashboard/user/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Failed to create listing', { id: 'createListing' });
    } finally {
      setLoading(false);
    }
  };

  // Progress indicator
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3].map(step => (
            <div 
              key={step} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={activeStep >= 1 ? "text-blue-600 font-medium" : ""}>Basic Information</span>
          <span className={activeStep >= 2 ? "text-blue-600 font-medium" : ""}>Details & Pricing</span>
          <span className={activeStep >= 3 ? "text-blue-600 font-medium" : ""}>Images & Visibility</span>
        </div>
      </div>
    );
  };

  // Render step 1: Basic Information
  const renderStep1 = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiTag className="mr-2 text-blue-600" /> Basic Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Computer Science Textbook"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Provide details about your listing. The more specific you are, the better!"
              value={formData.description}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/2000 characters
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render step 2: Details & Pricing
  const renderStep2 = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiDollarSign className="mr-2 text-blue-600" /> Details & Pricing
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.listingType === 'item' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, listingType: 'item'})}
              >
                <div className="font-medium">Item</div>
                <div className="text-sm text-gray-500">Physical products, books, electronics, etc.</div>
              </div>
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.listingType === 'service' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, listingType: 'service'})}
              >
                <div className="font-medium">Service</div>
                <div className="text-sm text-gray-500">Tutoring, assistance, skill-based offerings</div>
              </div>
            </div>
          </div>

          {formData.listingType === 'item' && (
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {conditions.map(condition => (
                  <div
                    key={condition}
                    className={`p-2 border text-center rounded-md cursor-pointer text-sm transition duration-200
                      ${formData.condition === condition 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setFormData({...formData, condition})}
                  >
                    {condition}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.pricingType === 'fixed' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, pricingType: 'fixed'})}
              >
                <div className="font-medium">Fixed Price</div>
                <div className="text-sm text-gray-500">Set a specific price for your item</div>
              </div>
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.pricingType === 'free' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, pricingType: 'free'})}
              >
                <div className="font-medium">Free</div>
                <div className="text-sm text-gray-500">Offer your item at no cost</div>
              </div>
            </div>
          </div>

          {formData.pricingType === 'fixed' && (
            <div className="mt-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (BDT) *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">৳</span>
                </div>
                <input
                  type="text"
                  name="price"
                  id="price"
                  className="pl-7 pr-12 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
          )}

          {formData.pricingType === 'free' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                <span className="ml-3 text-green-700">Your item will be listed for free and available to all eligible users.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render step 3: Images & Visibility
  const renderStep3 = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiEye className="mr-2 text-blue-600" /> Images & Visibility
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility *</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.visibilityMode === 'university' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, visibilityMode: 'university'})}
              >
                <div className="font-medium">University Only</div>
                <div className="text-sm text-gray-500">Only visible to students from your university</div>
              </div>
              <div
                className={`p-4 border rounded-lg cursor-pointer transition duration-200
                  ${formData.visibilityMode === 'public' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData({...formData, visibilityMode: 'public'})}
              >
                <div className="font-medium">Public</div>
                <div className="text-sm text-gray-500">Visible to everyone on DormDeals</div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-2 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload images</span>
                    <input 
                      id="images" 
                      name="images" 
                      type="file" 
                      className="sr-only" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5 files, 5MB each
                </p>
              </div>
            </div>
          </div>

          {/* Image previews */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Array.from(formData.images).map((image, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <FiX />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                    Image {index + 1} • {(image.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Listing Preview</h3>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="font-semibold text-lg">{formData.title || "Your listing title"}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formData.category ? `${formData.category} • ` : ""}
                {formData.listingType === 'item' ? formData.condition : 'Service'} • 
                {formData.pricingType === 'free' ? ' Free' : formData.price ? ` ৳${formData.price}` : ' ৳0'}
              </div>
              <div className="mt-3 text-sm text-gray-700 line-clamp-3">
                {formData.description || "Your listing description will appear here."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">Create New Listing</span>
              {loading && (
                <div className="ml-3 h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              )}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Share your items or services with the campus community
            </p>
          </div>

          {renderProgressBar()}

          <form onSubmit={handleSubmit}>
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
            {activeStep === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400"
                >
                  {loading ? 'Creating...' : 'Create Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ProtectedRoute>
  );
}