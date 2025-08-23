import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import axios from "axios"

export default function AddProduct() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const isAdmin =
    isAuthenticated &&
    String(user?.user?.role || user?.role || "").toLowerCase() === "admin";
    const { categories  } = useSelector(state=>state.getdata);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");



  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "",
      imageFile: null
    },
    mode: "onTouched"
  });

  if (!isAdmin) return <Navigate to="/" replace />;

  const nameVal = watch("name");
  const categoryVal = watch("category");

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    try {
      setMsgType("info");
      setMsg("Submitting...");
      console.log(values);
      const files = values.imageFile[0]
      const { name , category , description , imageFile , price , quantity } = values;
      const signaturess = await axiosClient.post("/admin/signature",{
         Product_category: category ,
         Product_name: name
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

      const reqSendData = {
      product_name: name ,
      product_category: category ,
      product_image: uploadResponse.data.secure_url ,
      image_publicID: uploadResponse.data.public_id ,
      product_description: description ,
      product_quantity: quantity,
      product_price:price
      }
      const saveData = await axiosClient.post("/admin/add",reqSendData);
      await new Promise((r) => setTimeout(r, 800)); 
      setMsgType("success");
      setMsg("✅ Product submitted successfully (integrate backend API)");
      reset();
      setPreview(null);
      // navigate("/admin");
    } catch (err) {
      setMsgType("error");
      setMsg(err?.message || "❌ Submission failed");
    }
  };

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
          Add Product
        </h1>
        <span className="text-sm text-gray-700">
          Admin: {user?.user?.name || user?.name || "—"}
        </span>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {msg && <div className={`mb-5 rounded-lg px-4 py-3 ${bannerCls}`}>{msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Name */}
              <div>
                <label className={labelCls}>Product Name</label>
                <input
                  className={inputCls}
                  placeholder="e.g., Sweet Pickles"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className={errorCls}>{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder="Short description..."
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className={errorCls}>{errors.description.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className={labelCls}>Price</label>
                <input
                  className={inputCls}
                  placeholder="e.g., 249"
                  {...register("price", { required: "Price is required" })}
                />
                {errors.price && <p className={errorCls}>{errors.price.message}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className={labelCls}>Quantity</label>
                <input
                  className={inputCls}
                  placeholder="e.g., 500g or 10pcs"
                  {...register("quantity", { required: "Quantity is required" })}
                />
                {errors.quantity && <p className={errorCls}>{errors.quantity.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <select
                  className={inputCls}
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">— Select Category —</option>
                  {categories?.data?.map((c) => (
                    <option key={c} value={c.category_name}>{c.category_name}</option>
                  ))}
                </select>
                {errors.category && <p className={errorCls}>{errors.category.message}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => { reset(); setPreview(null); setMsg(""); }}
                  className="border border-gray-300 px-5 py-2 rounded-lg bg-red-400  hover:bg-red-200"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Image picker + preview */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-black">Product Image</h2>
            <input
              type="file"
              accept="image/*"
              {...register("imageFile", { required: "Image is required" })}
              onChange={onPickFile}
              className="block w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer text-black"
            />
            {errors.imageFile && <p className={errorCls}>{errors.imageFile.message}</p>}

            <div className="mt-4 aspect-video border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No image selected</span>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-700">
              <div className="flex justify-between"><span className="font-medium">Name:</span> <span>{nameVal || "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Category:</span> <span>{categoryVal || "—"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

