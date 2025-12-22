import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Trash2, Search, Eye, Edit } from 'lucide-react';
import { api } from '../config/api';
import EditMachineryModal from '../components/EditMachineryModal';

const MachineCardSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
  </tr>
);

export default function Machinery() {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState(null);

  useEffect(() => {
    fetchMachinery();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [machines, searchQuery]);

  const fetchMachinery = async () => {
    try {
      setLoading(true);
      const data = await api.fetchMachinery();
      setMachines(data);
    } catch (error) {
      setToast({ message: error.message || 'Failed to fetch machinery', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...machines];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.machine_id.toLowerCase().includes(query) ||
        (m.brand && m.brand.toLowerCase().includes(query)) ||
        (m.description && m.description.toLowerCase().includes(query))
      );
    }

    setFilteredMachines(filtered);
  };

  const handleDeleteClick = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteMachinery(machineToDelete.machine_id);
      setToast({ message: 'Machinery deleted successfully', type: 'success' });
      fetchMachinery();
    } catch (error) {
      setToast({ message: error.message || 'Failed to delete machinery', type: 'error' });
    } finally {
      setMachineToDelete(null);
    }
  };

  const handleEditClick = (machine) => {
    setMachineToEdit(machine);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (formDataFromModal) => {
    try {
      // formDataFromModal already has machine_id and all the data from EditMachineryModal
      await api.editMachinery(formDataFromModal);

      setToast({ message: "Machinery updated successfully", type: "success" });
      fetchMachinery();

    } catch (error) {
      setToast({ message: error.message || "Failed to update machinery", type: "error" });
    } finally {
      setShowEditModal(false);
      setMachineToEdit(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <AdminLayout activePage="machinery">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Machinery</h1>
          <p className="text-gray-600 mt-2">Manage your machinery catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search machinery by name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg opacity-50"
            />
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Machine Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Color</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(8)].map((_, i) => (
                  <MachineCardSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="machinery">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Machinery</h1>
        <p className="text-gray-600 mt-2">Manage your machinery catalog</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search machinery by name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {searchQuery && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing {filteredMachines.length} of {machines.length} machinery
          </span>
        </div>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No machinery found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[180px]">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[120px]">Brand</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[120px]">Machine Type</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[100px]">Color</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[100px]">Size</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">Price</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">Stock</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">Edit</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMachines.map((machine) => (
                  <tr key={machine.machine_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      {machine.images_urls && machine.images_urls.length > 0 && machine.images_urls[0] ? (
                        <img
                          src={machine.images_urls[0]}
                          alt={machine.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Eye className="text-gray-400" size={24} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 flex-1 min-w-[180px]">
                      <div className="font-semibold text-gray-900">{machine.name}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[120px]">{machine.brand || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[120px]">{machine.machine_type || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[100px]">{machine.color || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 flex-1 min-w-[100px]">{machine.size || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-red-600 text-sm">${machine.discount_price || machine.price}</div>
                      {machine.discount_price && (
                        <div className="text-xs text-gray-500 line-through">${machine.price}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{machine.stock_count || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleEditClick(machine)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        title="Edit"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteClick(machine)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMachineToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Machinery"
        message={`Are you sure you want to delete "${machineToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {showEditModal && (
        <EditMachineryModal
          machine={machineToEdit}
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
