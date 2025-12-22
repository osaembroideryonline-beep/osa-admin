import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Upload, X, CheckCircle, CircleAlert } from 'lucide-react';
import { api } from '../config/api';

export default function AddEmbroideryMachine() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    machine_type: '',
    needle_count: '',
    head_count: '',
    max_embroidery_area: '',
    max_spm: '',
    file_formats: [],
    auto_thread_trimmer: false,
    auto_color_change: false,
    thread_break_detection: false,
    usb: false,
    wifi: false,
    price: '',
    discount_price: '',
    stock_count: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [fileFormatInput, setFileFormatInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const machineTypes = ['Single Head', 'Multi-Head', 'Home', 'Commercial'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const addFileFormat = () => {
    if (fileFormatInput.trim()) {
      setFormData(prev => ({
        ...prev,
        file_formats: [...prev.file_formats, fileFormatInput.toUpperCase()]
      }));
      setFileFormatInput('');
    }
  };

  const removeFileFormat = (index) => {
    setFormData(prev => ({
      ...prev,
      file_formats: prev.file_formats.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') errors.push('Machine Name');
    if (!formData.brand || formData.brand.trim() === '') errors.push('Brand');
    if (!formData.model || formData.model.trim() === '') errors.push('Model');
    if (!formData.machine_type || formData.machine_type.trim() === '') errors.push('Machine Type');
    if (!formData.description || formData.description.trim() === '') errors.push('Description');
    if (!formData.needle_count || formData.needle_count === '') errors.push('Needle Count');
    if (!formData.head_count || formData.head_count === '') errors.push('Head Count');
    if (!formData.max_embroidery_area || formData.max_embroidery_area.trim() === '') errors.push('Max Embroidery Area');
    if (!formData.max_spm || formData.max_spm === '') errors.push('Max SPM');
    if (formData.file_formats.length === 0) errors.push('File Formats (at least 1)');
    if (!formData.price || formData.price === '') errors.push('Price');
    if (!formData.discount_price || formData.discount_price === '') errors.push('Discount Price');
    if (!formData.stock_count || formData.stock_count === '') errors.push('Stock Count');
    if (images.length === 0) errors.push('Machine Images (at least 1)');

    if (errors.length > 0) {
      setValidationError(errors);
      return false;
    }
    return true;
  };

  const handleConfirmSubmit = () => {
    if (!validateForm()) return;
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsComplete(false);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('machine_type', formData.machine_type);
      formDataToSend.append('needle_count', formData.needle_count);
      formDataToSend.append('head_count', formData.head_count);
      formDataToSend.append('max_embroidery_area', formData.max_embroidery_area);
      formDataToSend.append('max_spm', formData.max_spm);
      formDataToSend.append('auto_thread_trimmer', formData.auto_thread_trimmer);
      formDataToSend.append('auto_color_change', formData.auto_color_change);
      formDataToSend.append('thread_break_detection', formData.thread_break_detection);
      formDataToSend.append('usb', formData.usb);
      formDataToSend.append('wifi', formData.wifi);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('discount_price', formData.discount_price);
      formDataToSend.append('stock_count', formData.stock_count);

      formData.file_formats.forEach(format => {
        formDataToSend.append('file_formats', format);
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await api.addEmbroideryMachine(formDataToSend);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsComplete(true);

      setTimeout(() => {
        setToast({ message: 'Embroidery machine added successfully!', type: 'success' });
        setFormData({
          name: '',
          description: '',
          brand: '',
          model: '',
          machine_type: '',
          needle_count: '',
          head_count: '',
          max_embroidery_area: '',
          max_spm: '',
          file_formats: [],
          auto_thread_trimmer: false,
          auto_color_change: false,
          thread_break_detection: false,
          usb: false,
          wifi: false,
          price: '',
          discount_price: '',
          stock_count: '',
        });
        setImages([]);
        setImagePreviews([]);
        setFileFormatInput('');
        setIsSubmitting(false);
        setIsComplete(false);
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      setIsComplete(false);
      setToast({ message: error.message || 'Failed to add machine', type: 'error' });
    }
  };

  return (
    <AdminLayout activePage="add-embroidery-machine">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Embroidery Machine</h1>
          <p className="text-gray-600 mt-2">Add a new embroidery machine to your inventory</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Machine Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="e.g., Brother SE400"
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
                placeholder="e.g., Brother, Janome"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="e.g., SE400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Machine Type
              </label>
              <select
                name="machine_type"
                value={formData.machine_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select type</option>
                {machineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              placeholder="Enter machine description"
            />
          </div>

          {/* Technical Specifications */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Specifications</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Needle Count
                </label>
                <input
                  type="number"
                  name="needle_count"
                  value={formData.needle_count}
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="e.g., 12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Head Count
                </label>
                <input
                  type="number"
                  name="head_count"
                  value={formData.head_count}
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                 placeholder="e.g., 1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Embroidery Area
                </label>
                <input
                  type="text"
                  name="max_embroidery_area"
                  value={formData.max_embroidery_area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                  placeholder="e.g., 100mm x 100mm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Stitches Per Minute (SPM)
                </label>
                <input
                  type="number"
                  name="max_spm"
                  value={formData.max_spm}
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="e.g., 850"
                />
              </div>
            </div>

            {/* File Formats */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supported File Formats
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={fileFormatInput}
                  onChange={(e) => setFileFormatInput(e.target.value)}
                  placeholder="e.g., DST, JEF, PES"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addFileFormat}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              {formData.file_formats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.file_formats.map((format, index) => (
                    <div key={index} className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-gray-700">{format}</span>
                      <button
                        type="button"
                        onClick={() => removeFileFormat(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="auto_thread_trimmer"
                  checked={formData.auto_thread_trimmer}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Auto Thread Trimmer</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="auto_color_change"
                  checked={formData.auto_color_change}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Auto Color Change</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="thread_break_detection"
                  checked={formData.thread_break_detection}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Thread Break Detection</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="usb"
                  checked={formData.usb}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">USB Port</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="wifi"
                  checked={formData.wifi}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">WiFi Connectivity</span>
              </label>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
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
                placeholder="e.g., 10"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Images <span className="text-red-600">*</span></h3>

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
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload machine images</p>
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

          <div className="flex gap-4">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Machine
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="Add Embroidery Machine"
        message="Are you sure you want to add this machine to inventory?"
        confirmText="Add Machine"
        variant="success"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
            {!isComplete ? (
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Adding Machine</h3>
                <p className="text-gray-600 text-center text-sm">
                  Please wait while we process your machine...
                </p>
                <div className="mt-6 flex gap-1 justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="relative bg-green-50 rounded-full p-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Machine Added!</h3>
                <p className="text-gray-600 text-center text-sm">
                  Your embroidery machine has been successfully added.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
