import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import { Search, Mail, Calendar, Shield } from 'lucide-react';
import { api } from '../config/api';

const UserSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-3"></div><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
  </tr>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.fetchUsers();
      setUsers(data);
    } catch (error) {
      setToast({ message: error.message || 'Failed to fetch users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.id && user.id.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout activePage="users">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">View your registered users</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email, or ID..."
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0 focus:ring-red-600 focus:border-transparent opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold">Total Users:</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                0
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(8)].map((_, i) => <UserSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="users">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">View your registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:w-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-0  focus:ring-red-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-semibold">Total Users:</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
              {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No users found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-28">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[180px]">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 flex-1 min-w-[150px]">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-24">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-600">
                        {user.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold mr-3">
                          {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.first_name + " " + user.last_name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.mobile_number || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Shield size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {user.is_admin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              User
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
