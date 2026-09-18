// skill_garden-Frontend/src/App.tsx

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage'

import { DashboardLayout } from './layouts/DashboardLayout'
import { OverviewPage } from './pages/dashboard/OverviewPage'
import { LearningPathPage } from './pages/dashboard/LearningPathPage'
import { SkillDetailPage } from './pages/dashboard/SkillDetailPage'
import { VideoLearningPage } from './pages/dashboard/VideoLearningPage'
import { QuizRoomPage } from './pages/dashboard/QuizRoomPage'
import { GoalsBadgesPage } from './pages/dashboard/GoalsBadgesPage'
import { UserProfilePage } from './pages/dashboard/UserProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'

import { UserApprovalPage } from './pages/admin/UserApprovalPage'
import { CourseManagementPage } from './pages/admin/CourseManagementPage'
import { LessonManagementPage } from './pages/admin/LessonManagementPage'
import { CreateLessonVideoPage } from './pages/admin/CreateLessonVideoPage'
import { QuizBankManagementPage } from './pages/admin/QuizBankManagementPage'
import { CreateQuizQuestionPage } from './pages/admin/CreateQuizQuestionPage'
import { PDFMaterialsManagementPage } from './pages/admin/PDFMaterialsManagementPage'

// New User pages
import { MyGardenPage } from './pages/dashboard/MyGardenPage'
import { SkillCatalogPage } from './pages/dashboard/SkillCatalogPage'
import { LeaderboardPage } from './pages/dashboard/LeaderboardPage'
import { PlantSkillPage } from './pages/dashboard/PlantSkillPage'

// New Admin pages
import { PlantManagementPage } from './pages/admin/PlantManagementPage'
import { AchievementManagementPage } from './pages/admin/AchievementManagementPage'
import { GamificationConfigPage } from './pages/admin/GamificationConfigPage'

// New Super Admin pages
import { SuperAdminDashboardPage } from './pages/superadmin/SuperAdminDashboardPage'
import { AdminUserManagementPage } from './pages/superadmin/AdminUserManagementPage'
import { AdminRolePermissionPage } from './pages/superadmin/AdminRolePermissionPage'
import { SystemReportsPage } from './pages/superadmin/SystemReportsPage'
import { AuditLogsPage } from './pages/superadmin/AuditLogsPage'
import { SystemConfigPage } from './pages/superadmin/SystemConfigPage'

import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute'

/** Smart redirect component for /dashboard based on user role */
const DashboardRedirect: React.FC = () => {
    const { user } = useAuthStore()
    if (user?.role === 'SUPER_ADMIN') {
        return <Navigate to="/dashboard/superadmin" replace />
    }
    if (user?.role === 'ADMIN') {
        return <Navigate to="/dashboard/admin/approvals" replace />
    }
    return <OverviewPage />
}

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
                <Route path="/pending-approval" element={<PendingApprovalPage />} />

                {/* Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardRedirect />} />
                        <Route path="learning-path/:id" element={<LearningPathPage />} />
                        <Route path="skill/:id" element={<SkillDetailPage />} />
                        <Route path="video-lesson/:id" element={<VideoLearningPage />} />
                        <Route path="quiz-room/:id" element={<QuizRoomPage />} />
                        <Route path="goals-badges" element={<GoalsBadgesPage />} />
                        <Route path="profile" element={<UserProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        {/* User Routes */}
                        <Route path="garden" element={<MyGardenPage />} />
                        <Route path="skill-catalog" element={<SkillCatalogPage />} />
                        <Route path="skill/:id/plant" element={<PlantSkillPage />} />
                        <Route path="leaderboard" element={<LeaderboardPage />} />

                        {/* Admin LMS & Management Routes */}
                        <Route path="admin/approvals" element={<UserApprovalPage />} />
                        <Route path="admin/courses" element={<CourseManagementPage />} />
                        <Route path="admin/lessons" element={<LessonManagementPage />} />
                        <Route path="admin/create-video-lesson" element={<CreateLessonVideoPage />} />
                        <Route path="admin/quiz-bank" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><QuizBankManagementPage /></RoleProtectedRoute>} />
                        <Route path="admin/quiz-bank/create" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><CreateQuizQuestionPage /></RoleProtectedRoute>} />
                        <Route path="admin/pdf-materials" element={<PDFMaterialsManagementPage />} />
                        <Route path="admin/plants" element={<PlantManagementPage />} />
                        <Route path="admin/achievements" element={<AchievementManagementPage />} />
                        <Route path="admin/gamification" element={<GamificationConfigPage />} />

                        {/* Super Admin Executive Routes */}
                        <Route path="superadmin" element={<SuperAdminDashboardPage />} />
                        <Route path="superadmin/users" element={<AdminUserManagementPage />} />
                        <Route path="superadmin/permissions" element={<AdminRolePermissionPage />} />
                        <Route path="superadmin/reports" element={<SystemReportsPage />} />
                        <Route path="superadmin/audit-logs" element={<AuditLogsPage />} />
                        <Route path="superadmin/config" element={<SystemConfigPage />} />

                        <Route path="*" element={<DashboardRedirect />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
