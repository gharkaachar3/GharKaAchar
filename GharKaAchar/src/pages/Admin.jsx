import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router";
import Dashboard from "./Dashboard";

const Tile = ({ title, subtitle, onClick, icon, color }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl shadow-lg bg-gradient-to-br ${color.replace('from-', 'from-').replace('to-', 'to-').replace('-50', '-500').replace('-100', '-600')}`}>
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1 group-hover:text-slate-700">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  </button>
);

export default function Admin() {
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const navigate = useNavigate();

  // Guard: only admins can access
  const isAdmin = isAuthenticated && String(user?.user?.role || user?.role || "").toLowerCase() === "admin";
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const adminActions = [
    {
      title: "Add Items",
      subtitle: "Create new products",
      path: "/admin/items/add",
      color: "from-blue-50 to-indigo-50",
      gradientIcon: "from-blue-500 to-indigo-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      title: "Delete Items",
      subtitle: "Remove existing products",
      path: "/admin/items/delete",
      color: "from-red-50 to-rose-50",
      gradientIcon: "from-red-500 to-rose-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-2h6a1 1 0 011 1v1H8V6a1 1 0 011-1z" />
        </svg>
      )
    },
    {
      title: "Add Category",
      subtitle: "Create new category",
      path: "/admin/categories/add",
      color: "from-green-50 to-emerald-50",
      gradientIcon: "from-green-500 to-emerald-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
        </svg>
      )
    },
    {
      title: "Remove Category",
      subtitle: "Delete a category",
      path: "/admin/categories/remove",
      color: "from-orange-50 to-amber-50",
      gradientIcon: "from-orange-500 to-amber-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
        </svg>
      )
    },
    {
      title: "Add Banner",
      subtitle: "Upload homepage banner",
      path: "/admin/banners/add",
      color: "from-purple-50 to-violet-50",
      gradientIcon: "from-purple-500 to-violet-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Delete Banner",
      subtitle: "Remove existing banner",
      path: "/admin/banners/delete",
      color: "from-pink-50 to-rose-50",
      gradientIcon: "from-pink-500 to-rose-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    {
      title: "Add Admin",
      subtitle: "Promote user to admin",
      path: "/admin/users/add-admin",
      color: "from-cyan-50 to-blue-50",
      gradientIcon: "from-cyan-500 to-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: "Remove Admin",
      subtitle: "Demote admin to user",
      path: "/admin/users/remove-admin",
      color: "from-slate-50 to-gray-50",
      gradientIcon: "from-slate-500 to-gray-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(user?.user?.name || user?.name || "A")[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 font-medium">
              Welcome, {user?.user?.name || user?.name || "Admin"}
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard Section */}
      <Dashboard />

      {/* Quick Actions Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quick Actions</h2>
          <p className="text-slate-600">Manage your store's products, categories, banners, and admin users</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminActions.map((action, index) => (
            <Tile
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              onClick={() => navigate(action.path)}
              icon={action.icon}
              color={action.color}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
