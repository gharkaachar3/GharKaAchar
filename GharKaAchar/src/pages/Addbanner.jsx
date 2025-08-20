// pages/AddBanner.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import axios from "axios";
const CATEGORY_OPTIONS = ["achar", "papad", "mango"];

export default function AddBanner() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      category: CATEGORY_OPTIONS[0],
      imageFile: null,
    },
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const onImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (values) => {
    console.log(values)
     const files = values.imageFile[0]
            const { name } = values;
            const signaturess = await axiosClient.post("/admin/signature",{
               Product_category: "banner" ,
               Product_name: values.category
            });
            console.log(signaturess)
            const {signature , public_id , uploadUrl , timestamp , cloud_name , CLOUDINARY_API_KEY } = signaturess.data
             const formData = new FormData();
            formData.append('file', files);
            formData.append('api_key', CLOUDINARY_API_KEY);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
      
            const uploadResponse = await axios.post(uploadUrl, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
      
            console.log(uploadResponse)
           const reqSendData = {
        banner_image: uploadResponse.data.secure_url,
        banner_category: values.category,
        banner_publicId: uploadResponse.data.public_id  // ✅ Changed from category_publicId
    }
            const savedata = await axiosClient.post('/admin/add/banner',reqSendData)
            console.log(reqSendData);
            console.log(savedata);

    console.log("Add Banner submit:", {
      category: values.category,
      imageFile: values?.imageFile?.[0] || null,
    });
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-amber-900 mb-6">
          Add Banner
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg border border-amber-200 bg-white p-6"
        >
          {/* Image input with label */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4 file:rounded-md
                         file:border-0 file:text-sm file:font-medium
                         file:bg-amber-600 file:text-white
                         hover:file:bg-amber-700 focus:outline-none"
              {...register("imageFile", {
                required: "Image is required",
                validate: {
                  fileSelected: (files) =>
                    (files && files.length > 0) || "Please select an image",
                },
              })}
              onChange={onImageChange}
            />
            {errors?.imageFile?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.imageFile.message}
              </p>
            ) : null}

            {/* Larger Preview */}
            {previewUrl ? (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full max-w-lg rounded object-cover border border-amber-100"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='192'><rect width='100%' height='100%' fill='%23FFE8B3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%238B5E00'>No Preview</text></svg>";
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* Category select with label */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Category
            </label>
            <select
              className="block w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              {...register("category", { required: "Category is required" })}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors?.category?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.category.message}
              </p>
            ) : null}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Add Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
