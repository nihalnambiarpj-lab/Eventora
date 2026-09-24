import { useState } from 'react';
import { LayoutDashboard, Calendar, Building2, Ticket, Users, LogOut, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ activeTab, setActiveTab, onExitAdmin, children }) {
  const { user, logout } = useAuth();

  const NAV_ITEMS = [
    { id: 'overview', label: 'Analytics Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Event Manager', icon: Calendar },
    { id: 'venues', label: 'Venues & Layouts', icon: Building2 },
    { id: 'bookings', label: 'Bookings Log', icon: Ticket },
    { id: 'users', label: 'User Directory', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Eventora</span>
              <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider">SaaS Admin</span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* User Badge & Store Exit */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </button>

          <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
            <div className="flex items-center gap-2 truncate">
              <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{user?.name}</span>
            </div>
            <button onClick={logout} className="hover:text-white text-gray-500" title="Sign Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-950 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
