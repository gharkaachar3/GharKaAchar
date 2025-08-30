import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Homes from "./pages/Homes";
import ProductPage from "./pages/PDP";
import CartPage from "./pages/Cart";
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
import CategoriesPage from "./pages/Categories";
import { check } from "./redux/AuthSlice";
import { setCartFromBackend } from "./redux/CartSlice";
import { fetchAllData } from "./redux/getdata";
import CleanHeader from "./pages/Header";
import PaymentCallback from "./components/paymentCallback"; 
import Terms from './pages/Terms';
import Privacy from './pages/Privecy'; // Fixed typo from Privecy to Privacy
import Refund from './pages/Refund';
import About from './pages/About';
import Contact from './pages/Contact';
import OrdersPage from "./pages/ODP"; // Renamed for clarity
import OrderDetailsPage from "./pages/ODPdashboard"; // Renamed for clarity

// ✅ Enhanced ProtectedRoute Component
function ProtectedRoute({ isAuthenticated, role, allowedRoles, children, redirectTo = "/login" }) {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// ✅ FIXED AuthRoute Component - NO MORE MULTIPLE REDIRECTS
function AuthRoute({ isAuthenticated, children }) {
  const location = useLocation();
  
  // ✅ Simply don't render auth pages if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    console.log("🎯 User already authenticated, redirecting to:", from);
    return <Navigate to={from} replace />;
  }
  
  // ✅ Show auth page if not authenticated
  return children;
}

function App() {
  const { cart: localCart } = useSelector((s) => s.cart);
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const role = user?.user?.role || user?.role;
  const cartCount = localCart.length;
  const [forceLoaded, setForceLoaded] = useState(false);

  useEffect(() => {
    console.log('🚀 App initializing...');
    
    const emergencyTimer = setTimeout(() => {
      console.log('🚨 Emergency timeout - forcing app to load');
      setForceLoaded(true);
    }, 5000);

    dispatch(fetchAllData())
      .then(() => console.log('✅ Data fetched successfully'))
      .catch(err => console.log('❌ Data fetch failed:', err));
    
    dispatch(check())
      .unwrap()
      .then((data) => {
        console.log('✅ Auth check successful:', data);
        clearTimeout(emergencyTimer);
        setForceLoaded(true);
        if (data?.user?.cart) {
          dispatch(setCartFromBackend(data.user.cart));
        }
      })
      .catch((err) => {
        console.log('❌ Auth check failed:', err);
        clearTimeout(emergencyTimer);
        setForceLoaded(true);
      });

    return () => clearTimeout(emergencyTimer);
  }, [dispatch]);

  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">GharKaAchar</h2>
          <p className="text-amber-700 font-medium mb-2">Loading your delicious experience...</p>
          <p className="text-amber-600 text-sm">This shouldn't take long</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CleanHeader cartCount={cartCount} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homes />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/category/:categoryName" element={<CategoriesPage />} />
        
        {/* ✅ ADDED: Policy and Information Pages */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ✅ PAYMENT CALLBACK ROUTE - Added Here */}
        <Route 
          path="/payment-callback" 
          element={
            // <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <PaymentCallback />
            // </ProtectedRoute>
          } 
        />

        {/* ✅ Auth Routes - Fixed to prevent multiple redirects */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage mode="login" />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage mode="register" />
            )
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ✅ CHECKOUT ROUTE - Add this if you need a dedicated checkout page */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <CartPage /> {/* or create a separate Checkout page */}
            </ProtectedRoute>
          }
        />

        {/* Order Management Routes */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/orders/:orderId"  
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items/add"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items/delete"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <DeleteProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/add"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <Addcategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/remove"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <DeleteCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners/add"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <AddBanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners/delete"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <DeleteBanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/add-admin"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <AddAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/remove-admin"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              role={role} 
              allowedRoles={["admin"]}
            >
              <RemoveAdmins />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-amber-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;