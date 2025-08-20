import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/AuthSlice";
import { Link, useNavigate } from "react-router";
const image1 = new URL("../assets/download.jpeg", import.meta.url).href;

export default function Profile() {
  // Safely access user
  const {user} = useSelector((state) => state.auth?.user || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const goHome = () => navigate("/");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-white p-6 rounded-lg shadow text-center border border-amber-100">
          <p className="text-gray-700">You are not logged in.</p>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = String(user.role || "").toLowerCase() === "admin";

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-amber-100">
        {/* Back Arrow */}
        <button
          onClick={goHome}
          aria-label="Go back home"
          className="mb-4 -mt-2 -ml-2 p-2 rounded-full hover:bg-amber-100 text-amber-800 inline-flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={image1}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-4 border-amber-200 object-cover"
          />
        </div>

        <h1 className="text-2xl font-bold text-amber-900 font-serif text-center mb-6">
          My Profile
        </h1>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800">Full Name</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">{user.name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800">Email</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">{user.email || "N/A"}</p>
          </div>
         

        <hr className="my-6 border-amber-100" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Admin Panel (visible only for admins) */}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition"
            >
              Admin Panel
            </button>
          )}

          {/* My Orders Button */}
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            My Orders
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            Logout
          </button>

          {/* Reset Password Link */}
          <Link to="/reset-password" className="text-blue-700 underline text-center">
            Reset Password
          </Link>

          {/* Delete Account Link */}
          <Link to="/delete-account" className="text-blue-700 underline text-center">
            Delete Account
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
