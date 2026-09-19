import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/auth/LoginPage'
import { SkillCatalogPage } from '../pages/dashboard/SkillCatalogPage'
import { LearningPathPage } from '../pages/dashboard/LearningPathPage'
import { VideoLearningPage } from '../pages/dashboard/VideoLearningPage'
import { QuizRoomPage } from '../pages/dashboard/QuizRoomPage'
import { PDFMaterialsManagementPage } from '../pages/admin/PDFMaterialsManagementPage'
import { AdminRolePermissionPage } from '../pages/superadmin/AdminRolePermissionPage'

const renderPage = (page: React.ReactElement, route = '/', routePattern = '*') => render(
    <MemoryRouter initialEntries={[route]}>
        <Routes>
            <Route path={routePattern} element={page} />
        </Routes>
    </MemoryRouter>
)

describe('page smoke tests', () => {
    it('renders the login page', () => {
        renderPage(<LoginPage />)
        expect(screen.getAllByText(/đăng nhập/i).length).toBeGreaterThan(0)
    })

    it('renders the skill catalog', () => {
        renderPage(<SkillCatalogPage />)
        expect(screen.getByText(/khám phá kỹ năng it/i)).toBeInTheDocument()
    })

    it('renders the skill-specific learning path', () => {
        renderPage(<LearningPathPage />, '/dashboard/learning-path/3', '/dashboard/learning-path/:id')
        expect(screen.getByText(/database sql & mysql architect/i)).toBeInTheDocument()
    })

    it('renders the skill-specific video lesson and persists notes', () => {
        renderPage(<VideoLearningPage />, '/dashboard/video-lesson/3', '/dashboard/video-lesson/:id')
        expect(screen.getAllByText(/index, query plan/i).length).toBeGreaterThan(0)
        expect(localStorage.getItem('skillgarden-video-notes-3')).toBeTruthy()
    })

    it('locks the quiz until video and PDF are completed', () => {
        renderPage(<QuizRoomPage />, '/dashboard/quiz-room/1', '/dashboard/quiz-room/:id')
        expect(screen.getByText(/quiz đang bị khóa/i)).toBeInTheDocument()
        expect(screen.getByText(/xem video bài học/i)).toBeInTheDocument()
        expect(screen.getAllByText(/đọc tài liệu pdf/i).length).toBeGreaterThan(0)
    })

    it('renders the PDF materials management page', () => {
        renderPage(<PDFMaterialsManagementPage />)
        expect(screen.getByText(/quản lý tài liệu pdf/i)).toBeInTheDocument()
    })

    it('renders the role permissions page', () => {
        renderPage(<AdminRolePermissionPage />)
        expect(screen.getAllByText(/phân quyền/i).length).toBeGreaterThan(0)
    })
})
