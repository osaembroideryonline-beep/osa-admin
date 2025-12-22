import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Upload, X, CheckCircle, CircleAlert } from 'lucide-react';
import { api } from '../config/api';

export default function AddMachinery() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    brand: '',
    machine_type: '',
    color: '',
    size: '',
    stock_count: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') errors.push('Machinery Name');
    if (!formData.price || formData.price === '') errors.push('Price');
    if (!formData.brand || formData.brand.trim() === '') errors.push('Brand');
    if (!formData.machine_type || formData.machine_type.trim() === '') errors.push('Machine Type');
    if (!formData.color || formData.color.trim() === '') errors.push('Color');
    if (!formData.size || formData.size.trim() === '') errors.push('Size');
    if (!formData.stock_count || formData.stock_count === '') errors.push('Stock Count');
    if (!formData.description || formData.description.trim() === '') errors.push('Description');
    if (images.length === 0) errors.push('Machinery Images (at least 1)');

    if (errors.length > 0) {
      setValidationError(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsComplete(false);
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await api.addMachinery(formDataToSend);

      // Show success animation
      setIsComplete(true);

      setTimeout(() => {
        setToast({ message: 'Machinery added successfully!', type: 'success' });
        setFormData({
          name: '',
          description: '',
          price: '',
          discount_price: '',
          brand: '',
          machine_type: '',
          color: '',
          size: '',
          stock_count: '',
        });
        setImages([]);
        setImagePreviews([]);
        setIsSubmitting(false);
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      setIsComplete(false);
      setToast({ message: error.message || 'Failed to add machinery', type: 'error' });
    }
  };

  return (
    <AdminLayout activePage="add-machinery">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Machinery</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new machinery to your catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Machinery Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter machinery name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Machine Type
              </label>
              <input
                type="text"
                name="machine_type"
                value={formData.machine_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="e.g., DST, JEF, Both"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Price
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter color"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter size"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Count
              </label>
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="Enter stock count"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter machinery description"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machinery Images <span className="text-red-600">*</span></h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 cursor-pointer transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload machinery images</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Machinery
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Add Machinery"
        message="Are you sure you want to add this machinery to the catalog?"
        confirmText="Add Machinery"
        variant="success"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Validation Error Popup */}
      {validationError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
                <div className="relative bg-red-50 rounded-full p-4">
                  <CircleAlert className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Missing Required Fields</h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Please fill in the following fields:
              </p>
              <ul className="w-full space-y-2 mb-6">
                {validationError.map((field, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setValidationError(null)}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Got It, Let Me Fix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Animation Popup */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
            {!isComplete ? (
              <>
                {/* Loading State */}
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Adding Machinery</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Please wait while we process your machinery...
                  </p>
                  <div className="mt-6 flex gap-1 justify-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="flex flex-col items-center animate-in fade-in duration-500">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="relative bg-green-50 rounded-full p-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Machinery Added!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Your machinery has been successfully added to the catalog.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
