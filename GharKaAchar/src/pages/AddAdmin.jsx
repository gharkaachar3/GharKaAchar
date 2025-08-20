import React from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";

export default function AddAdmin() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    // You can replace the endpoint below with your actual backend route
    try {
      const res = await axiosClient.post("/admin/add", data);
      alert("Admin added successfully!");
      reset();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add admin");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-amber-900 mb-6">
          Add New Admin
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg border border-amber-200 bg-white p-6 shadow"
        >
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              className="block w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <input
              type="password"
              className="block w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
