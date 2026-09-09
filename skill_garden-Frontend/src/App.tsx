import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { OverviewPage } from './pages/dashboard/OverviewPage'
import { LearningPathPage } from './pages/dashboard/LearningPathPage'
import { SkillDetailPage } from './pages/dashboard/SkillDetailPage'

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="learning-path/:id" element={<LearningPathPage />} />
                    <Route path="skill/:id" element={<SkillDetailPage />} />
                    <Route path="garden" element={<OverviewPage />} />
                    <Route path="*" element={<OverviewPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
