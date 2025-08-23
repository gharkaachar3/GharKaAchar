import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GetAlladmins } from "../redux/getdata"; // Updated import name
import axiosClient from "../utils/axiosClient";
import { Toaster, toast } from "sonner";

export default function RemoveAdmins() {
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(GetAlladmins());
    }, [dispatch]);
    
    const { admins } = useSelector(state => state.getdata);
    const { user } = useSelector((state) => state.auth);
    
    // Current logged-in admin details
    const myDetails = user?.user || user;
    
    // All admins from API
    const adminsData = admins?.data || [];
    
    // Filter: Remove self + only show admins created after current admin
    const removableAdmins = adminsData.filter(admin => {
        // Don't show yourself
        if (admin._id === myDetails._id) return false;
        
        // Only show admins created after you (newer admins)
        const myCreatedAt = new Date(myDetails.createdAt);
        const adminCreatedAt = new Date(admin.createdAt);
        
        return adminCreatedAt > myCreatedAt;
    });

    const handleRemoveAdmin = async (adminId, adminName) => {
        try {
            const res = await axiosClient.delete(`/user/remove/admin/${adminId}`);
            toast.success(`${adminName} has been removed as admin!`, {
                duration: 4000,
                position: "top-center"
            });
            // Refresh the admin list
            dispatch( GetAlladmins());
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove admin", {
                duration: 4000,
                position: "top-center"
            });
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 p-6">
            <Toaster richColors position="top-center" />
            
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">
                    Remove Admins
                </h1>
                
                {removableAdmins.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600 text-lg">
                            No admins available to remove. You can only remove admins that were created after you.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-amber-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {removableAdmins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {admin.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemoveAdmin(admin._id, admin.name)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                >
                                                    Remove Admin
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
