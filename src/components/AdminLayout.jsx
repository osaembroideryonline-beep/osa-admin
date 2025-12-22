import { useState } from 'react';
import { LayoutDashboard, Package, Users, Plus, Menu, X } from 'lucide-react';

export default function AdminLayout({ children, activePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'add-product', label: 'Add Designs', icon: Plus, href: '/add-product' },
    { id: 'products', label: 'Designs', icon: Package, href: '/products' },
    { id: 'add-machinery', label: 'Add Spares', icon: Plus, href: '/add-machinery' },
    { id: 'machinery', label: 'Spares', icon: Package, href: '/machinery' },
    { id: 'add-embroidery-machine', label: 'Add Embroidery Machine', icon: Plus, href: '/add-embroidery-machine' },
    { id: 'embroidery-machines', label: 'Embroidery Machines', icon: Package, href: '/embroidery-machines' },
    { id: 'users', label: 'Users', icon: Users, href: '/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="https://res.cloudinary.com/dobuwrfn8/image/upload/v1765785794/osamainlogowide_qa3saa.png" className='w-24' alt="" />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img src="https://res.cloudinary.com/dobuwrfn8/image/upload/v1765785794/osamainlogowide_qa3saa.png" className='w-24 md:w-32' alt="" />
          </div>
          <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
