import Homes from "./pages/Homes";
import ProductPage from "./pages/PDP";
import CartPage from "./pages/Cart";
import CategoriesPage from "./pages/Categories";
import { Routes, Route, Link, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin"
import { check } from "./redux/AuthSlice";
import { setCartFromBackend } from "./redux/CartSlice"; 
import { useEffect, useState } from "react";
import AddProduct from "./pages/Additems";
import { GetAllProduct } from "./redux/getdata";
import DeleteProduct from "./pages/deleteProduct";
import Addcategory from "./pages/Addcategory";
import DeleteCategories from "./pages/deleteCategory";
import AddBanner from "./pages/Addbanner";
import DeleteBanner from "./pages/dltBanner";
import AddAdmin from "./pages/AddAdmin";

// Icons
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const CartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${props.className || ""}`} fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4
       2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrackOrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3
       m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 
       4m0 13V4m0 0L9 7" />
  </svg>
);

function App() {
  const { cart: localCart } = useSelector((s) => s.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const data = user?.user;
  // console.log(data)

    const cartCount = localCart.length
  //   if(!isAuthenticated){
  //     dispatch(setCartFromBackend([]));
  //   }
  // // ✅ Session check + backend cart ko frontend me set karna
  useEffect(() => {
    dispatch(GetAllProduct());
    dispatch(check())
      .unwrap()
      .then((data) => {
        if (data?.user?.cart) {
          dispatch(setCartFromBackend(data?.user?.cart));
        }
      })
      .catch((err) => console.error("Check failed:", err));
  }, [dispatch]);

  return (
    <>
      {/* 🔹 Header */}
      <header className="sticky top-0 z-50 bg-amber-800 text-amber-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className="p-2 rounded-md hover:bg-amber-700 transition-colors md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon />
          </button>

          <h1 className="text-xl md:text-2xl font-bold font-serif">GharKaAchar</h1>

          <div className="flex items-center space-x-4">
            {/* Track Order */}
            <button className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-amber-700 transition-colors">
              <TrackOrderIcon />
              <span className="text-sm md:text-base">Track Order</span>
            </button>

            {/* Profile */}
            <Link to={"/profile"} className="p-2 rounded-md hover:bg-amber-700 transition-colors">
              <UserIcon />
            </Link>

            {/* Cart */}
            <Link
              to={"/cart"}
              className="p-2 rounded-md hover:bg-amber-700 transition-colors relative"
            >
              <CartIcon />
              <span className="absolute -top-1 -right-1 bg-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 🔹 Routes */}
      <Routes>
        <Route path="/" element={<Homes />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/login"
          element={!isAuthenticated ? <AuthPage mode="login" /> : <Navigate to={"/"} />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <AuthPage mode="register" /> : <Navigate to={"/"} />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to={"/register"} />}
        />
        {
          data?.role === "admin" && <Route path="/Admin" element={isAuthenticated || data?.role === "admin"?<Admin></Admin>:<Navigate to={"/"}></Navigate>} />
        }
        <Route path="/admin/items/add" element={isAuthenticated || data?.role === "admin"?<AddProduct></AddProduct>:<Navigate to={"/"}></Navigate>} />
        <Route path="/admin/items/delete" element={isAuthenticated || data?.role === "admin"?<DeleteProduct></DeleteProduct>:<Navigate to={"/"}></Navigate>} />
        <Route path="/admin/categories/add" element={isAuthenticated || data?.role === "admin"?<Addcategory></Addcategory>:<Navigate to={"/"}></Navigate>} />
        <Route path="/admin/categories/remove" element={ isAuthenticated || data?.role === "admin"?<DeleteCategories></DeleteCategories>:<Navigate to={"/"}></Navigate> }  />
        <Route path="/admin/banners/add" element={ isAuthenticated || data?.role === "admin"?<AddBanner></AddBanner>:<Navigate to={"/"}></Navigate> }  />
        <Route path="/admin/banners/delete" element={ isAuthenticated || data?.role === "admin"?<DeleteBanner></DeleteBanner>:<Navigate to={"/"}></Navigate> }  />
        <Route path="/admin/users/add-admin" element={ isAuthenticated || data?.role === "admin"?<AddAdmin></AddAdmin>:<Navigate to={"/"}></Navigate> }  />
      </Routes>
    </>
  );
}

export default App;
