import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { GetAllProduct } from "../redux/getdata";
import axiosClient from "../utils/axiosClient";

export default function DeleteProduct() {
  const { data = [], loading, error } = useSelector(
    (state) => state.getdata || {}
  );
  const dispatch = useDispatch();
  const [deletingId, setDeletingId] = useState(null);

  if (loading) return <h1 className="text-center text-lg">Loading...</h1>;
  if (error) return <h1 className="text-center text-lg text-red-600">{error}</h1>;

  const actualdata = data.data || [];

  const handleDelete = async (id, publicId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const res = await axiosClient.delete(`/admin/delete/${id}`, {
        data: { public_id: publicId },
        withCredentials: true
      });
      alert(res.data.message || "Deleted");
      dispatch(GetAllProduct());
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-amber-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-amber-900 mb-6 border-b border-amber-200 pb-2">
        Delete Product Page
      </h1>

      {actualdata.length === 0 ? (
        <p className="text-gray-700">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actualdata.map((prod) => (
            <div
              key={prod._id}
              className="border border-amber-200 rounded-lg bg-white shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={prod.product_image}
                alt={prod.product_name}
                className="h-48 w-full object-cover border-b border-amber-100"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {prod.product_name}
                </h2>
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium text-gray-800">{prod.product_category}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Price: <span className="font-medium text-gray-800">₹{prod.product_price}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: <span className="font-medium">{prod.product_quantity}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Added: {new Date(prod.createdAt).toLocaleString()}
                </p>

                <button
                  onClick={() => handleDelete(prod._id, prod.image_publicID)}
                  disabled={deletingId === prod._id}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition disabled:opacity-60"
                >
                  {deletingId === prod._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
