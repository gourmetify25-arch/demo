import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">admin_panel_settings</span>
          <span className="font-bold text-lg text-gray-900">Admin Panel</span>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          <Link
            to="/admin/dashboard"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/dashboard')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="material-symbols-outlined mr-3">dashboard</span>
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/products')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="material-symbols-outlined mr-3">inventory_2</span>
            Products
          </Link>
          <Link
            to="/admin/orders"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/orders')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="material-symbols-outlined mr-3">orders</span>
            Orders
          </Link>
          <Link
            to="/admin/brands"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/brands')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="material-symbols-outlined mr-3">branding_watermark</span>
            Brands
          </Link>
          <Link
            to="/admin/keywords"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/keywords')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="material-symbols-outlined mr-3">tag</span>
            Keywords
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link to="/" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <span className="material-symbols-outlined mr-3">logout</span>
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between md:justify-end">
          <div className="md:hidden flex items-center">
            <span className="material-symbols-outlined text-gray-600">menu</span>
            <span className="ml-2 font-bold text-gray-900">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Admin User</span>
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;