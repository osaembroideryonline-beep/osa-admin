import React, { useState } from "react";
import { X, Upload, CheckCircle } from "lucide-react";

const EditMachineryModal = ({ machine, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...machine,
  });

  const [existingImages, setExistingImages] = useState(machine.images_urls || []);
  const [newImages, setNewImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (e) => {
    const { name, type, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
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

  const handleRemoveNew = (preview) => {
    setNewImages((prev) => prev.filter((img) => img.preview !== preview));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setIsComplete(false);
      const formDataToSend = new FormData();
      
      // Always add machine_id (required by backend)
      formDataToSend.append("machine_id", machine.machine_id);

      // Send all non-empty fields (backend will only update what's provided)
      const fieldsToSend = [
        "name",
        "description",
        "price",
        "discount_price",
        "brand",
        "machine_type",
        "color",
        "size",
        "stock_count",
      ];

      fieldsToSend.forEach((field) => {
        const value = formData[field];
        // Send the field if it has a value (even if unchanged)
        if (value !== null && value !== undefined && value !== "") {
          formDataToSend.append(field, value);
        }
      });

      // Check if images were modified (removed or added)
      const originalImageUrls = machine.images_urls || [];
      const imagesWereModified = 
        existingImages.length !== originalImageUrls.length || 
        newImages.length > 0;

      // Send image_urls if images were modified
      if (imagesWereModified) {
        // Add remaining image URLs (after removals)
        if (existingImages && existingImages.length > 0) {
          existingImages.forEach((url) => {
            if (url && url.trim() !== "") {
              formDataToSend.append("image_urls", url);
            }
          });
        }

        // Add new image files
        if (newImages && newImages.length > 0) {
          newImages.forEach(({ file }) => {
            formDataToSend.append("images", file);
          });
        }
      }

      // Call submit immediately
      onSubmit(formDataToSend);

      // Ensure loading state shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success animation
      setIsComplete(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      console.error("Error updating machinery:", err);
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Machinery</h2>
        <p className="text-gray-600 mb-6">Update details and save changes</p>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Machine ID</label>
              <input
                type="text"
                name="machine_id"
                value={formData.machine_id ?? ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Machinery Name</label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ""}
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
              <label className="block font-semibold text-gray-700 mb-2">Machine Type</label>
              <input
                type="text"
                name="machine_type"
                value={formData.machine_type ?? ""}
                onChange={handleChange}
                placeholder="e.g., DST, JEF, Both"
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

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Size</label>
              <input
                type="text"
                name="size"
                value={formData.size ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Stock Count</label>
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

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
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Machinery Images
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
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveExisting(img);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 cursor-pointer transition-opacity"
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
                        onClick={() => handleRemoveNew(img.preview)}
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
                <p className="text-sm text-gray-600">Click to upload machinery images</p>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Updating Machinery</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Please wait while we update your machinery...
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Machinery Updated!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Your machinery has been successfully updated.
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

export default EditMachineryModal;
