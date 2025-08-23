import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import axios from "axios"

export default function AddCategory() {
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const isAdmin =
    isAuthenticated &&
    String(user?.user?.role || user?.role || "").toLowerCase() === "admin";

  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | success | error

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      category_name: "",
      imageFile: null
    },
    mode: "onTouched"
  });

  if (!isAdmin) return <Navigate to="/" replace />;

  // Image preview
  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  // Plug your: getSignature -> Cloudinary upload -> backend save here
  const onSubmit = async (values) => {
    try {
      setMsgType("info");
      setMsg("Submitting...");
      console.log(values)
       const files = values.imageFile[0]
            const { category_name } = values;
            const signaturess = await axiosClient.post("/admin/signature",{
               Product_category: "own" ,
               Product_name: category_name
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
             category_image: uploadResponse.data.secure_url  ,
             category_name: category_name ,
             category_image_publicID: uploadResponse.data.public_id
            }

            const savedata = await axiosClient.post('/admin/add/category',reqSendData)
      await new Promise((r) => setTimeout(r, 600)); // demo delay
      setMsgType("success");
      setMsg("✅ Category submitted (wire backend in onSubmit).");
      reset();
      setPreview(null);
    } catch (err) {
      setMsgType("error");
      setMsg(err?.response?.data?.message || err?.message || "❌ Submission failed");
    }
  };

  // Styles (high-contrast, amber theme)
  const labelCls = "block text-base font-semibold text-gray-900 mb-1";
  const inputCls =
    "block w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500";
  const errorCls = "mt-1 text-sm text-red-600";
  const bannerCls = {
    info: "bg-blue-100 text-blue-900 border border-blue-300",
    success: "bg-green-100 text-green-900 border border-green-300",
    error: "bg-red-100 text-red-900 border border-red-300"
  }[msgType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-amber-200 p-4 flex justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-amber-900 tracking-tight">
          Add Category
        </h1>
        <span className="text-sm text-gray-700">
          Admin: {user?.user?.name || user?.name || "—"}
        </span>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* Status Banner */}
        {msg && <div className={`mb-5 rounded-lg px-4 py-3 ${bannerCls}`}>{msg}</div>}

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-amber-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Category Name */}
            <div>
              <label className={labelCls}>Category Name</label>
              <input
                className={inputCls}
                placeholder="e.g., Mango Pickles"
                {...register("category_name", {
                  required: "Category name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                  maxLength: { value: 80, message: "Maximum 80 characters" }
                })}
              />
              {errors.category_name && (
                <p className={errorCls}>{errors.category_name.message}</p>
              )}
            </div>

            {/* Category Image */}
            <div>
              <label className={labelCls}>Category Image</label>
              <input
                type="file"
                accept="image/*"
                {...register("imageFile", { required: "Image is required" })}
                onChange={onPickFile}
                className="block w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer text-gray-400"
              />
              {errors.imageFile && <p className={errorCls}>{errors.imageFile.message}</p>}

              {/* Preview */}
              <div className="mt-4 aspect-video border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No image selected</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Add Category"}
              </button>
              <button
                type="button"
                onClick={() => { reset(); setPreview(null); setMsg(""); }}
                className="border text-gray-600 border-gray-300 px-5 py-2 rounded-lg bg-white hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
