import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { register as SignUp, login } from "../redux/AuthSlice";
import { useDispatch, useSelector } from "react-redux";

export default function AuthPage({ mode = "login" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const rawError = useSelector((state) => state.auth.error);
  const isLogin = mode === "login";
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = (data) => {
    if (mode === "login") {
      dispatch(login(data));
    } else {
      dispatch(SignUp(data));
    }
  };

  // Sanitizing error before showing
  const errorMessage =
    typeof rawError === "string"
      ? rawError
      : rawError?.message
      ? rawError.message
      : null;

  const safeErrorMessage =
    typeof errorMessage === "string" && errorMessage.includes("<!DOCTYPE html>")
      ? "Unexpected server error. Please try again."
      : errorMessage;

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 md:p-8 border border-amber-100">
        {/* Title */}
        <h1 className="text-2xl font-bold text-amber-900 mb-6 text-center font-serif">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h1>

        {/* Backend error */}
        {safeErrorMessage && (
          <div className="mb-4 text-center text-red-600 font-semibold text-sm">
            {safeErrorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name - Only for Register */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-amber-300 rounded-lg 
                           text-gray-900 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-amber-300 rounded-lg 
                         text-gray-900 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-amber-300 rounded-lg 
                           text-gray-900 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-amber-700 hover:text-amber-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password - Only for Register */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg 
                             text-gray-900 placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-sm text-amber-700 hover:text-amber-900"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 
                       text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Switch between login/register */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-amber-700 font-medium hover:underline"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-amber-700 font-medium hover:underline"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
