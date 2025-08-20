// pages/DeleteCategories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { getAllcategories } from "../redux/getdata";
import axiosClient from "../utils/axiosClient";

// Loading shimmer row
const RowShimmer = () => (
  <div className="w-full rounded-lg border border-amber-200 bg-white p-3">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded bg-amber-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-amber-100 rounded animate-pulse" />
        <div className="h-3 w-1/5 bg-amber-100 rounded animate-pulse" />
      </div>
      <div className="h-9 w-24 bg-amber-100 rounded animate-pulse" />
    </div>
  </div>
);

// Single row with form submit
function DeleteRowForm({ category, onSubmitExternal, disabled }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      id: category?._id,
      public_id: category?.category_image_publicID,
    },
  });

  const onSubmit = (values) => {
    if (onSubmitExternal) onSubmitExternal(values, category);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full rounded-lg border border-amber-200 bg-white p-3 ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={category?.category_image}
          alt={category?.category_name}
          className="h-12 w-12 rounded object-cover border border-amber-100"
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='%23FFE8B3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%238B5E00'>No Img</text></svg>";
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium truncate">
            {category?.category_name || "Untitled"}
          </p>
          <p className="text-gray-500 text-xs">
            {category?.createdAt
              ? new Date(category.createdAt).toLocaleString()
              : ""}
          </p>
        </div>

        {/* Hidden fields for submit */}
        <input type="hidden" {...register("id")} />
        <input type="hidden" {...register("public_id")} />

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label={`Delete ${category?.category_name || "category"}`}
        >
          Delete
        </button>
      </div>
    </form>
  );
}

export default function DeleteCategories() {
  const dispatch = useDispatch();
  const { categories, loading = false, error = null } =
    useSelector((state) => state.getdata || {});
  const [localError, setLocalError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [localList, setLocalList] = useState(null);

  // Normalize categories to a flat array (supports array or {data:[]})
  const list = useMemo(() => {
    const fromState =
      Array.isArray(categories) ? categories : categories?.data || [];
    return Array.isArray(fromState) ? fromState : [];
  }, [categories]);

  // Sync localList with store when not deleting
  useEffect(() => {
    if (busyId == null) {
      setLocalList(list);
    }
  }, [list, busyId]);

  // Initial fetch
  useEffect(() => {
    dispatch(getAllcategories());
  }, [dispatch]);

  const handleDeleteSubmit = async ({ id, public_id }, original) => {
    setLocalError(null);
    try {
      setBusyId(id);

      // Optimistic remove
      setLocalList((prev) =>
        Array.isArray(prev) ? prev.filter((x) => x?._id !== id) : prev
      );

      // If backend expects public_id, send it in DELETE body:
      // const res = await axiosClient.delete(`/admin/delete/category/${id}`, { data: { public_id } });
      const res = await axiosClient.delete(`/admin/delete/category/${id}`);

      // Consider 2xx with success !== false as success
      const success =
        res?.status >= 200 &&
        res?.status < 300 &&
        (res?.data?.success !== false);

      if (!success) {
        // Revert by re-fetching if server signals failure
        await dispatch(getAllcategories());
        const serverMsg = res?.data?.message;

        // Suppress noisy “Product not found”
        if (serverMsg && !/product not found/i.test(serverMsg)) {
          setLocalError(serverMsg);
        }
      }
      // else: success; optimistic UI already applied
    } catch (e) {
      // If 404, treat as success (already gone)
      if (e?.response?.status === 404) {
        setBusyId(null);
        return;
      }

      // On real error, re-fetch to restore
      await dispatch(getAllcategories());

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Delete failed";

      // Suppress noisy “Product not found”
      if (!/product not found/i.test(String(msg))) {
        setLocalError(msg);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-amber-900 mb-6">
          Delete Categories
        </h1>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-white p-4 text-red-700">
            {String(error)}
          </div>
        ) : null}

        {localError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-white p-4 text-red-700">
            {String(localError)}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RowShimmer key={i} />
            ))}
          </div>
        ) : !Array.isArray(localList) || localList.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-white p-6 text-gray-700">
            No categories found.
          </div>
        ) : (
          <div className="space-y-3">
            {localList.map((cat) => (
              <DeleteRowForm
                key={cat?._id}
                category={cat}
                onSubmitExternal={handleDeleteSubmit}
                disabled={busyId === cat?._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
