import React, { useState } from "react";
import { X, Upload, FileUp, Check, CheckCircle } from "lucide-react";
import { api } from "../config/api";

const EditProductModal = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...product,
    in_stock: product.in_stock ?? true,
  });

  const [existingImages, setExistingImages] = useState(product.images_urls || []);
  const [newImages, setNewImages] = useState([]);
  const [fileEntries, setFileEntries] = useState([{ id: 1, machineType: '', file: null }]);
  const [nextId, setNextId] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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
  const machineTypes = ["DST", "JEF", "PES", "EXP", "VP3", "XXX"];

  // Get already selected machine types (from product.machine_type)
  const existingMachineTypes = Array.isArray(product.machine_type) 
    ? product.machine_type.map(t => t.toUpperCase()) 
    : [];

  // Get machine types available for dropdown (exclude already added ones)
  const getAvailableMachineTypes = () => {

    return machineTypes.filter(type => !existingMachineTypes.includes(type));
    
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const handleRemoveExisting = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleAddNew = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...mapped]);
  };

  const handleRemoveNew = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setIsComplete(false);
      const formDataToSend = new FormData();

      // Add form fields (text data) - only send required fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('discount_price', formData.discount_price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('sub_category', formData.sub_category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('in_stock', formData.in_stock);

      // Check if images were modified
      const originalImageUrls = product.images_urls || [];
      const imagesWereModified = 
        existingImages.length !== originalImageUrls.length || 
        newImages.length > 0;

      // Always send images (required by backend)
      if (imagesWereModified) {
        // send kept existing URLs
        existingImages.forEach((url) => {
          formDataToSend.append("image_urls", url);
        });

        // send newly added images
        newImages.forEach(({ file }) => {
          formDataToSend.append("images", file);
        });
      } else {
        // No image changes - send existing images as URLs only
        existingImages.forEach((url) => {
          formDataToSend.append("image_urls", url);
        });
      }

      // Add downloadable files dynamically (dst, jef, pes, etc.)
      // Key must match backend parameter name exactly
      fileEntries.forEach(entry => {
        if (entry.machineType && entry.file instanceof File) {
          formDataToSend.append(entry.machineType.toLowerCase(), entry.file);
        }
      });

      const updated = await api.editProduct(product.id, formDataToSend);

      // Show success state
      setIsComplete(true);
      setTimeout(() => {
        onSubmit(updated);
        onClose();
      }, 2500);
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || "Error updating product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h2>
        <p className="text-gray-600 mb-6">Update details and save changes</p>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Form fields */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Sub Category</label>
              <input
                type="text"
                name="sub_category"
                value={formData.sub_category ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Discount Price</label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600"
                />
                <span className="font-semibold text-gray-700">In Stock</span>
              </label>
            </div>
          </div>

          {/* IMAGES SECTION */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Images
            </h3>

            {/* Existing Images */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-3">Existing Images</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img} className="relative group">
                    <img 
                      src={img} 
                      alt="existing" 
                      className="w-full h-32 object-contain rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveExisting(img);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-3">New Images (Preview)</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {newImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img.preview} 
                        alt="preview" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNew(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload product images</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddNew}
                className="hidden"
              />
            </label>
          </div>

          {/* DESIGN FILES SECTION */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Design Files</h3>
              <p className="text-sm text-gray-500">Optional - Add design files for different machine types</p>
            </div>

            {/* Already Added Files */}
            {existingMachineTypes.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-3">Already Added Files</p>
                <div className="flex flex-wrap gap-2">
                  {existingMachineTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800"
                    >
                      <Check size={14} />
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* File Entries List */}
            <div className="space-y-3 mb-6">
              {fileEntries.map((entry, index) => (
                <div key={entry.id} className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
                  {/* Machine Type Selector */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Machine Type
                    </label>
                    <select
                      value={entry.machineType}
                      onChange={(e) => handleMachineTypeChange(entry.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Select machine type</option>
                      {getAvailableMachineTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Upload File
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

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 py-3 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 py-3 rounded-lg text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Popup Animation - Update Submission */}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Updating Product</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Please wait while we update your product...
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Updated!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Your product has been successfully updated.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductModal;
