import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router";

const Tile = ({ title, subtitle, onClick, icon }) => (
  <button
    onClick={onClick}
    className="group rounded-xl border border-amber-200 p-5 bg-white hover:shadow-lg transition text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
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

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-amber-800 text-amber-50 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold font-serif">Admin Panel</h1>
          <span className="text-sm opacity-90">
            Welcome, {user?.user?.name || user?.name || "Admin"}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="mb-6">
          <h2 className="text-xl font-bold text-amber-900">Quick Actions</h2>
          <p className="text-gray-600">Manage items, categories, banners, and admins.</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Add Items */}
          <Tile
            title="Add Items"
            subtitle="Create new products"
            onClick={() => navigate("/admin/items/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />

          {/* Delete Items */}
          <Tile
            title="Delete Items"
            subtitle="Remove existing products"
            onClick={() => navigate("/admin/items/delete")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-2h6a1 1 0 011 1v1H8V6a1 1 0 011-1z" />
              </svg>
            }
          />

          {/* Add Category */}
          <Tile
            title="Add Category"
            subtitle="Create new category"
            onClick={() => navigate("/admin/categories/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
              </svg>
            }
          />

          {/* Remove Category */}
          <Tile
            title="Remove Category"
            subtitle="Delete a category"
            onClick={() => navigate("/admin/categories/remove")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            }
          />

          {/* Add Banner */}
          <Tile
            title="Add Banner"
            subtitle="Upload homepage banner"
            onClick={() => navigate("/admin/banners/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 19h18M5 5v14m14-14v14M8 9h8v6H8z" />
              </svg>
            }
          />

          {/* Delete Banner */}
          <Tile
            title="Delete Banner"
            subtitle="Remove an existing banner"
            onClick={() => navigate("/admin/banners/delete")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />

          {/* Add Admin */}
          <Tile
            title="Add Admin"
            subtitle="Promote a user to admin"
            onClick={() => navigate("/admin/users/add-admin")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5V6m0 12v1.5M6 12H4.5M19.5 12H18M7.5 7.5l-1.06-1.06M17.56 17.56L16.5 16.5M7.5 16.5l-1.06 1.06M17.56 6.44L16.5 7.5" />
              </svg>
            }
          />

          {/* Remove Admin */}
          <Tile
            title="Remove Admin"
            subtitle="Demote admin to user"
            onClick={() => navigate("/admin/users/remove-admin")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            }
          />
        </div>
      </main>
    </div>
  );
}
