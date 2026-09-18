// skill_garden-Frontend/src/components/ProtectedRoute.tsx

import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface RoleProtectedRouteProps {
    allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'USER'>;
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isInitialized, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            checkAuth();
        }
    }, [isInitialized, checkAuth]);

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#3F49C8] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-[#4A5568]">Đang tải dữ liệu chứng thực...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
    const { user } = useAuthStore();

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
