import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Trash2, Search, Filter, Eye, Edit, X } from 'lucide-react';
import { api } from '../config/api';
import EditProductModal from '../components/EditProductModal';

const STATIC_CATEGORIES = [
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
  "Kurthi",
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

const ProductCardSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
  </tr>
);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allCategories] = useState(STATIC_CATEGORIES);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isShowingSubCategorySelection, setIsShowingSubCategorySelection] = useState(false);

  // Fetch initial products with pagination
  const fetchProducts = useCallback(async (initialLoad = true) => {
    try {
      if (initialLoad) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const data = await api.fetchProductsInfiniteScroll(50, initialLoad ? 0 : offset);
      const newProducts = data.products || [];

      if (initialLoad) {
        setProducts(newProducts);
        setOffset(50);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setOffset(prev => prev + 50);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      setToast({ message: error.message || 'Failed to fetch products', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);


  // Fetch subcategories
  const fetchSubCategories = useCallback(async (category) => {
    try {
      setLoadingSubCategories(true);
      const data = await api.fetchSubCategories(category);
      
      let subs = [];
      if (Array.isArray(data)) {
        subs = data;
      } else if (data?.data && Array.isArray(data.data)) {
        subs = data.data;
      } else if (data?.sub_category_names && Array.isArray(data.sub_category_names)) {
        subs = data.sub_category_names;
      }

      setSubCategories(subs);
      setIsShowingSubCategorySelection(subs.length > 0);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  }, []);

  // Fetch products by subcategory
  const fetchProductsBySubCategory = useCallback(async (category, subCategory) => {
  try {
    setLoading(true);
    const data = await api.fetchProductsBySubCategory(category, subCategory);

    const productsList = data.products || data || [];
    setProducts(productsList);      // 👈 SET PRODUCTS HERE
    setOffset(productsList.length);
    setHasMore(false);               // stop infinite scroll for subcategory
  } catch (error) {
    setToast({ message: error.message || 'Failed to fetch products', type: 'error' });
  } finally {
    setLoading(false);
  }
}, []);


  // Initial load
  useEffect(() => {
    fetchProducts(true);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(p => p.sub_category === selectedSubCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubCategory, searchQuery]);

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setIsShowingSubCategorySelection(false);
    setFilteredProducts([]);

    if (category !== 'all') {
      await fetchSubCategories(category);
    } else {
      setSubCategories([]);
    }
  };

const handleSubCategoryChange = useCallback(async (subCategory) => {
  setSelectedSubCategory(subCategory);
  setIsShowingSubCategorySelection(false);

  await fetchProductsBySubCategory(selectedCategory, subCategory);
}, [selectedCategory]);


  const handleLoadMore = () => {
    fetchProducts(false);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteProduct(productToDelete.id);
      setToast({ message: 'Product deleted successfully', type: 'success' });
      fetchProducts(true);
    } catch (error) {
      setToast({ message: error.message || 'Failed to delete product', type: 'error' });
    } finally {
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedProduct) => {
    try {
      const formData = new FormData();

      const textFields = [
        "name",
        "description",
        "price",
        "discount_price",
        "in_stock",
        "sub_category",
        "category",
        "brand",
        "machine_type",
        "color",
        "size",
        "stock_count",
      ];

      textFields.forEach((field) => {
        if (updatedProduct[field] !== undefined && updatedProduct[field] !== null) {
          formData.append(field, updatedProduct[field]);
        }
      });

      if (updatedProduct.images && updatedProduct.images.length > 0) {
        updatedProduct.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (updatedProduct.dst instanceof File) {
        formData.append("dst", updatedProduct.dst);
      }

      if (updatedProduct.jef instanceof File) {
        formData.append("jef", updatedProduct.jef);
      }

      await api.editProduct(productToEdit.id, formData);
      setToast({ message: "Product updated successfully", type: "success" });
      fetchProducts(true);
    } catch (error) {
      setToast({ message: error.message || "Failed to update product", type: "error" });
    } finally {
      setShowEditModal(false);
      setProductToEdit(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="products">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>

        {/* Search & Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 md:px-6 py-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name, brand, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Category Navigation Bar - Desktop */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Loading */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sub Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="products">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">Manage your product catalog</p>
      </div>

      {/* Search & Basic Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 md:px-6 py-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
            />
          </div>

                {/* Category Navigation Bar - Desktop */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              disabled={loadingSubCategories}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${loadingSubCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        </div>
      </div>




      {/* Breadcrumbs & Subcategory Selection */}
      {loadingSubCategories ? (
        // Show skeleton while loading subcategories
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <p className="text-gray-600 mb-4">
            Choose a subcategory in <span className="font-semibold">{selectedCategory}</span>
          </p>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (selectedCategory !== 'all' || selectedSubCategory) && subCategories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 ">
            <button
              onClick={() => handleCategoryChange('all')}
              className="text-red-600 hover:underline font-medium"
            >
              All
            </button>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <button
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className="text-red-600 hover:underline font-medium"
                >
                  {selectedCategory}
                </button>
              </>
            )}
            {selectedSubCategory && (
              <>
                <span>/</span>
                <span className="font-semibold text-gray-900">{selectedSubCategory}</span>
              </>
            )}
          </div>

          {/* Subcategory Selection View */}
          {isShowingSubCategorySelection && !selectedSubCategory && (
            <div>
              <p className="text-gray-600 mb-4">
                Choose a subcategory in <span className="font-semibold">{selectedCategory}</span>
              </p>
              {subCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No subcategories found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubCategoryChange(sub)}
                      className="w-full py-4 rounded-xl border text-xl lg:text-4xl font-semibold tracking-wide text-center transition-all  text-red-600 cursor-pointer border-red-600 hover:bg-red-50"
                    >
                      {selectedCategory} - OSA - {sub.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      
      {/* Products Table */}
      {loadingSubCategories ? (
        // Show skeleton while loading subcategories
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sub Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : isShowingSubCategorySelection && !selectedSubCategory ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Select a subcategory to view products</p>
        </div>
      ) : filteredProducts.length === 0 && !loadingMore ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">
            {selectedCategory !== 'all' ? `No products found in this category. Add products to ${selectedCategory}` : 'No products found matching your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[180px]">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[140px]">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[140px]">Sub Category</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">Price</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[140px]">File Types</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">Edit</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        {product.images_urls && product.images_urls.length > 0 && product.images_urls[0] ? (
                          <img
                            src={product.images_urls[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Eye className="text-gray-400" size={24} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 flex-1 min-w-[180px]">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        {product.brand && (
                          <div className="text-sm text-gray-600">{product.brand}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[140px]">{product.category || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[140px]">{product.sub_category || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-red-600 text-sm">${product.discount_price || product.price}</div>
                        {product.discount_price && (
                          <div className="text-xs text-gray-500 line-through">${product.price}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[140px]">
                        {product.machine_type && Array.isArray(product.machine_type) && product.machine_type.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.machine_type.map((type) => (
                              <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {type.toLowerCase()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          title="Edit"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {loadingMore && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More Button */}
          {hasMore && !loadingMore && filteredProducts.length > 0 && (
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Load More Products
              </button>
            </div>
          )}

          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-center mt-8 py-6">
              <p className="text-gray-500 text-lg">All products loaded</p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {showEditModal && (
        <EditProductModal
          product={productToEdit}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
