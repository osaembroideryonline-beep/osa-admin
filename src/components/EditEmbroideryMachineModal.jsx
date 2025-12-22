import React, { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { api } from '../config/api';

const EditEmbroideryMachineModal = ({ machine, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(machine);
  const [existingImages, setExistingImages] = useState(machine.images_urls || []);
  const [newImages, setNewImages] = useState([]);
  const [fileFormatInput, setFileFormatInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const machineTypes = ['Single Head', 'Multi-Head', 'Home', 'Commercial'];

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRemoveExisting = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const handleAddNew = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages(prev => [...prev, ...mapped]);
  };

  const handleRemoveNew = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const addFileFormat = () => {
    if (fileFormatInput.trim() && !formData.file_formats.includes(fileFormatInput.toUpperCase())) {
      setFormData(prev => ({
        ...prev,
        file_formats: [...(prev.file_formats || []), fileFormatInput.toUpperCase()]
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

  const handleSubmit = async () => {
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowConfirm(false);
      setIsSubmitting(true);
      const startTime = Date.now();

      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images_urls' || key === 'machine_id' || key === 'created_at' || key === 'updated_at') return;
        
        if (Array.isArray(value) && key === 'file_formats') {
          value.forEach(format => formDataToSend.append('file_formats', format));
        } else if (!Array.isArray(value)) {
          formDataToSend.append(key, value || '');
        }
      });

      // Handle images
      const originalImageCount = existingImages.length;
      const newImageCount = newImages.length;
      const imagesWereModified = originalImageCount !== (machine.images_urls || []).length || newImageCount > 0;

      if (imagesWereModified) {
        // Add existing images to keep
        existingImages.forEach(url => {
          formDataToSend.append('image_urls', url);
        });

        // Add new images
        newImages.forEach(({ file }) => {
          formDataToSend.append('images', file);
        });
      }

      const updated = await api.editEmbroideryMachine(machine.machine_id, formDataToSend);
      
      // Ensure minimum 1 second loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setIsComplete(true);
      
      // Auto close after 2.5 seconds total
      setTimeout(() => {
        onSubmit(updated);
        onClose();
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || 'Error updating machine');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Save Changes?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to update this machine? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 bg-green-600 py-2 rounded-lg text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Success Popup */}
      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center z-70">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm">
            {isComplete ? (
              <>
                <div className="flex flex-col items-center animate-in fade-in duration-500">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="relative bg-green-50 rounded-full p-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Embroidery Machine Updated!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Your Embroidery Machine has been successfully updated in the catalog.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">updating Embroidery Machine</h3>
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
            )}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Machine</h2>
        <p className="text-gray-600 mb-6">Update machine details and save changes</p>

        <div>
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Machine Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Machine Type</label>
              <select
                name="machine_type"
                value={formData.machine_type || ''}
                onChange={handleChange}
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
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Needle Count</label>
                <input
                  type="number"
                  name="needle_count"
                  value={formData.needle_count || ''}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Head Count</label>
                <input
                  type="number"
                  name="head_count"
                  value={formData.head_count || ''}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Max Embroidery Area</label>
                <input
                  type="text"
                  name="max_embroidery_area"
                  value={formData.max_embroidery_area || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Max SPM</label>
                <input
                  type="number"
                  name="max_spm"
                  value={formData.max_spm || ''}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* File Formats */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">Supported Formats</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={fileFormatInput}
                  onChange={(e) => setFileFormatInput(e.target.value)}
                  placeholder="e.g., DST"
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
              {formData.file_formats && formData.file_formats.length > 0 && (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  name="auto_thread_trimmer"
                  checked={formData.auto_thread_trimmer || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Auto Thread Trimmer</span>
              </label>

              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  name="auto_color_change"
                  checked={formData.auto_color_change || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Auto Color Change</span>
              </label>

              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  name="thread_break_detection"
                  checked={formData.thread_break_detection || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Thread Break Detection</span>
              </label>

              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  name="usb"
                  checked={formData.usb || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">USB Port</span>
              </label>

              <label className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  name="wifi"
                  checked={formData.wifi || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">WiFi Connectivity</span>
              </label>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-gray-200 pt-6 mb-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
               onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                step="0.01"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Discount Price</label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price || ''}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                step="0.01"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Stock Count</label>
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count || ''}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Images</h3>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-3">Existing Images</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div key={img} className="relative group">
                      <img
                        src={img}
                        alt="existing"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(img)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <p className="text-sm text-gray-600">Click to upload machine images</p>
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
              className={`flex-1 bg-red-600 py-3 rounded-lg text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'animate-pulse' : ''
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmbroideryMachineModal;
