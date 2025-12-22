import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Upload, X, FileUp, CheckCircle, CircleAlert } from 'lucide-react';
import { api } from '../config/api';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: 'Digital embroidery design file by OSA Embroidery, compatible with computerized embroidery machines. Professionally digitized for smooth stitching and reliable results. This is a digital download only; no physical item will be shipped.',
    price: '',
    discount_price: '',
    category: '',
    sub_category: '',
    brand: '',
    in_stock: true,
  });

  const [images, setImages] = useState([]);
  const [downloadableFiles, setDownloadableFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [fileEntries, setFileEntries] = useState([{ id: 1, machineType: '', file: null }]);
  const [nextId, setNextId] = useState(2);

  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const categories = [
  "Blouse",
  "Buttes",
  "3D Embossed",
  "3D Flower",
  "Animals",
  "Apparel",
  "Alphabets",
  "Animations",
  "Beads",
  "Boatneck",
  "Borders",
  "Butterfly",
  "Cartoon",
  "Celebrity",
  "Chudidar",
  "Coding",
  "Gods",
  "Kids",
  "Kurta",
  "Lehanga",
  "Logos",
  "Photos",
  "Saree",
  "Sequence",
  "Floral",
  "Ethnic",
  "Traditional",
  "Modern",
  "Festival",
  "others",
  ];
  const machineTypes = ['DST', 'JEF', 'PES', 'EXP', 'VP3', 'XXX'];



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

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      setDownloadableFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
    }
  };

  const removeFile = (fileKey) => {
    setDownloadableFiles(prev => {
      const updated = { ...prev };
      delete updated[fileKey];
      return updated;
    });
  };

  const handleMachineTypeChange = (id, value) => {
    setFileEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, machineType: value } : entry
      )
    );
  };

  const handleFileEntryChange = (id, file) => {
    setFileEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, file } : entry
      )
    );
  };

  const addFileEntry = () => {
    setFileEntries(prev => [...prev, { id: nextId, machineType: '', file: null }]);
    setNextId(prev => prev + 1);
  };

  const removeFileEntry = (id) => {
    setFileEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') errors.push('Product Name');
    if (!formData.price || formData.price === '') errors.push('Price');
    if (!formData.category || formData.category.trim() === '') errors.push('Category');
    if (!formData.sub_category || formData.sub_category.trim() === '') errors.push('Sub Category');
    if (!formData.brand || formData.brand.trim() === '') errors.push('Brand');
    if (!formData.description || formData.description.trim() === '') errors.push('Description');
    if (images.length === 0) errors.push('Product Images (at least 1)');
    
    // Check if first file entry has both machine type and file
    if (fileEntries[0].machineType === '' || fileEntries[0].file === null) {
      errors.push('Design File (machine type and .zip file)');
    }

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

      // Add form fields (text data)
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('discount_price', formData.discount_price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('sub_category', formData.sub_category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('in_stock', formData.in_stock);

      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Add downloadable files dynamically (dst, jef, pes, etc.)
      // Key must match backend parameter name exactly
      fileEntries.forEach(entry => {
        if (entry.machineType && entry.file instanceof File) {
          formDataToSend.append(entry.machineType.toLowerCase(), entry.file);
        }
      });

      await api.addProduct(formDataToSend);

      // Show success animation
      setIsComplete(true);

      setTimeout(() => {
        setToast({ message: 'Product added successfully!', type: 'success' });
        setFormData({
          name: '',
          description: '',
          price: '',
          discount_price: '',
          category: '',
          sub_category: '',
          brand: '',
          in_stock: true,
        });
        setImages([]);
        setImagePreviews([]);
        setFileEntries([{ id: 1, machineType: '', file: null }]);
        setNextId(2);
        setIsSubmitting(false);
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      setIsComplete(false);
      setToast({ message: error.message || 'Failed to add product', type: 'error' });
    }
  };

  return (
    <AdminLayout activePage="add-product">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new product to your catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                placeholder="Enter sub category"
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
                placeholder="Enter product description"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded outline-0  focus:ring-red-600"
                />
                <span className="text-sm font-semibold text-gray-700">In Stock</span>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images <span className="text-red-600">*</span></h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-contain rounded-lg border border-gray-300"
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
                <p className="text-sm text-gray-600">Click to upload product images</p>
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

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Design Files</h3>
              <p className="text-sm text-gray-500">Optional - Add design files for different machine types</p>
            </div>

            {/* File Entries List */}
            <div className="space-y-3 mb-6">
              {fileEntries.map((entry, index) => (
                <div key={entry.id} className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
                  {/* Machine Type Selector */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Machine Type {index === 0 && <span className="text-red-600">*</span>}
                    </label>
                    <select
                      value={entry.machineType}
                      onChange={(e) => handleMachineTypeChange(entry.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Select machine type</option>
                      {machineTypes.map(type => {
                        const isAlreadySelected = fileEntries.some(e => e.machineType === type && e.id !== entry.id);
                        return !isAlreadySelected && (
                          <option key={type} value={type}>{type}</option>
                        );
                      })}
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Upload File {index === 0 && <span className="text-red-600">*</span>}
                    </label>
                    <label className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors text-sm">
                      <FileUp className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {entry.file ? entry.file.name : 'Choose .zip file'}
                      </span>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => handleFileEntryChange(entry.id, e.target.files[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Remove Button */}
                  <div className="w-full lg:w-auto">
                    {fileEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFileEntry(entry.id)}
                        className="w-full lg:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200"
                      >
                        <X size={16} />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              type="button"
              onClick={addFileEntry}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Add More Machine Type</span>
            </button>

            <p className="text-xs text-gray-500 mt-4">
              💡 Upload only ZIP files containing design files for each machine type (DST, JEF, PES, EXP, VIP, XXX).
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Add Product"
        message="Are you sure you want to add this product to the catalog?"
        confirmText="Add Product"
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Adding Product</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Please wait while we process your product...
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Added!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Your product has been successfully added to the catalog.
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
