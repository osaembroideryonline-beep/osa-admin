import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { api } from '../config/api';
import EditEmbroideryMachineModal from '../components/EditEmbroideryMachineModal';

const MachineCardSkeleton = () => (
  <tr>
    <td className="px-4 py-4"><div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></td>
  </tr>
);

export default function EmbroideryMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const data = await api.fetchEmbroideryMachines();
      setMachines(data);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (machine) => {
    setSelectedMachine(machine);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteEmbroideryMachine(selectedMachine.machine_id);
      setToast({ message: 'Machine deleted successfully!', type: 'success' });
      setShowConfirm(false);
      fetchMachines();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleEditClick = (machine) => {
    setSelectedMachine(machine);
    setShowEditModal(true);
  };

  const handleEditSubmit = ( ) => {
    setToast({ message: 'Machine updated successfully!', type: 'success' });
    fetchMachines();
  };

  const filteredMachines = machines.filter(machine =>
    machine.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout activePage="embroidery-machines">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Embroidery Machines</h1>
          <p className="text-gray-600 mt-2">Manage your embroidery machine inventory</p>
        </div>

        {/* Machines Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
          {loading ? (
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Image</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-28">Brand</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Machine Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Needles</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">SPM</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 w-16">Edit</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 w-16">Delete</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => <MachineCardSkeleton key={i} />)}
              </tbody>
            </table>
          ) : filteredMachines.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">{machines.length === 0 ? 'No machines yet' : 'No machines match your search'}</p>
            </div>
          ) : (
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Image</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-28">Brand</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Machine Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Needles</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">SPM</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 w-16">Edit</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 w-16">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMachines.map((machine) => (
                  <tr key={machine.machine_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      {machine.images_urls && machine.images_urls.length > 0 ? (
                        <img
                          src={machine.images_urls[0]}
                          alt={machine.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 w-32">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{machine.name}</p>
                        <p className="text-xs text-gray-600">{machine.model}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-28">
                      <p className="text-gray-700 text-sm">{machine.brand}</p>
                    </td>
                    <td className="px-4 py-4 w-32">
                      <p className="text-gray-700 text-sm">{machine.machine_type}</p>
                    </td>
                    <td className="px-4 py-4 w-20">
                      <p className="font-semibold text-gray-900 text-sm">${machine.discount_price ? machine.discount_price.toFixed(2) : machine.price.toFixed(2)}</p>
                      {machine.discount_price && (
                        <p className="text-xs text-gray-500 line-through">${machine.price.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 w-20">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        machine.stock_count > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {machine.stock_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-20">
                      <p className="text-gray-700 text-center text-sm">{machine.needle_count || '-'}</p>
                    </td>
                    <td className="px-4 py-4 w-20">
                      <p className="text-gray-700 text-center text-sm">{machine.max_spm || '-'}</p>
                    </td>
                    <td className="px-4 py-4 w-16">
                      <button
                        onClick={() => handleEditClick(machine)}
                        className="flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 rounded-lg py-1 px-2 transition-colors w-full"
                        title="Edit"
                      >
                        <Edit size={16} />
                        <span className="text-xs font-semibold">Edit</span>
                      </button>
                    </td>
                    <td className="px-4 py-4 w-16">
                      <button
                        onClick={() => handleDeleteClick(machine)}
                        className="flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 rounded-lg py-1 px-2 transition-colors w-full"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-semibold">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedMachine && (
        <EditEmbroideryMachineModal
          machine={selectedMachine}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Machine"
        message={`Are you sure you want to delete "${selectedMachine?.name}"? This action cannot be undone.`}
        confirmText="Delete Machine"
        variant="danger"
      />

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
