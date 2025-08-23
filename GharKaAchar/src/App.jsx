import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router"; // ✅ FIXED
import { useDispatch, useSelector } from "react-redux";

import Homes from "./pages/Homes";
import ProductPage from "./pages/PDP";
import CartPage from "./pages/Cart";
import CategoriesPage from "./pages/Categories";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AddProduct from "./pages/Additems";
import DeleteProduct from "./pages/deleteProduct";
import Addcategory from "./pages/Addcategory";
import DeleteCategories from "./pages/deleteCategory";
import AddBanner from "./pages/Addbanner";
import DeleteBanner from "./pages/dltBanner";
import AddAdmin from "./pages/AddAdmin";
import RemoveAdmins from "./pages/removeAdmin";

import { check } from "./redux/AuthSlice";
import { setCartFromBackend } from "./redux/CartSlice";
import { fetchAllData } from "./redux/getdata";
import CleanHeader from "./pages/Header"; // ✅ Updated import

// ProtectedRoute wrapper component
function ProtectedRoute({ isAuthenticated, role, allowedRoles, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const { cart: localCart } = useSelector((s) => s.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const role = user?.user?.role || user?.role;
  const cartCount = localCart.length;

  useEffect(() => {
    dispatch(fetchAllData());
    dispatch(check())
      .unwrap()
      .then((data) => {
        if (data?.user?.cart) {
          dispatch(setCartFromBackend(data.user.cart));
        }
      })
      .catch((err) => console.error("Check failed:", err));
  }, [dispatch]);

  return ( 
         
    <>
      
       <CleanHeader cartCount={cartCount} />

    
      

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homes />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<CategoriesPage />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <AuthPage mode="login" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <AuthPage mode="register" /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items/add"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items/delete"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <DeleteProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/add"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <Addcategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/remove"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <DeleteCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners/add"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <AddBanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners/delete"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <DeleteBanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/add-admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <AddAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/remove-admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={["admin"]}>
              <RemoveAdmins />
            </ProtectedRoute>
          }
        />
      </Routes>
      </>
  );
}

export default App;
