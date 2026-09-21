import React, { useState, useRef, useEffect } from 'react'
import { User, Mail, Key, Save, Camera, Sparkles, X, Upload, Image as ImageIcon, Check, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../stores/authStore'
import { API_BASE_URL } from '../../services/authService'

export const UserProfilePage: React.FC = () => {
    const { user, updateUser } = useAuthStore()
    const [fullName, setFullName] = useState(user?.full_name || 'Nguyễn Anh Khoa')
    const [bio, setBio] = useState('Lập trình viên React & Node.js đam mê học hỏi và nuôi dưỡng khu vườn kỹ năng PLT Solutions.')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    // Avatar state & ref
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [selectedEmoji, setSelectedEmoji] = useState('🌱')
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const emojiList = ['🌱', '🌳', '🌸', '🌵', '🦁', '🦉', '🚀', '⭐', '🎓', '👑']

    useEffect(() => {
        if (user?.full_name) {
            setFullName(user.full_name)
        }
        if (user?.email) {
            const userAvatar = localStorage.getItem('skillgarden_avatar_' + user.email) || user.avatar_url || null
            setCustomAvatarUrl(userAvatar)
        }
    }, [user?.full_name, user?.email, user?.avatar_url])

    // Handle Local Image Upload from Computer (Scoped to user.email)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.email) return

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn một file hình ảnh hợp lệ (PNG, JPG, WEBP)!')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setCustomAvatarUrl(result)

            // Update Zustand authStore and localStorage
            updateUser({ avatar_url: result })
            setSuccessMsg('Đã tải lên ảnh đại diện từ máy tính thành công!')
            setShowAvatarModal(false)
            setTimeout(() => setSuccessMsg(''), 4000)

            // Sync to backend API
            try {
                fetch(`${API_BASE_URL}/user/profile.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        full_name: fullName,
                        avatar_url: result,
                        bio: bio
                    })
                })
            } catch {
                // Ignore API sync errors
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault()

        // 1. Update in-memory Zustand store and localStorage
        updateUser({ full_name: fullName, avatar_url: customAvatarUrl || undefined })
        setSuccessMsg('Đã cập nhật thông tin hồ sơ cá nhân thành công!')

        // 2. Sync to backend API silently
        if (user?.email) {
            try {
                fetch(`${API_BASE_URL}/user/profile.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        full_name: fullName,
                        avatar_url: customAvatarUrl || '',
                        bio: bio
                    })
                })
            } catch {
                // Ignore API sync errors
            }
        }

        setTimeout(() => setSuccessMsg(''), 4000)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-[#20223A] dark:text-gray-100 pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-8">
            {/* Hidden Input for Local Computer Image Selection */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Header Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-[#E2E4EB] dark:border-gray-700 shadow-md flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                    {customAvatarUrl ? (
                        <img
                            src={customAvatarUrl}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#DCEFE1] dark:border-emerald-700 shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[#3C4097] text-white font-extrabold text-3xl flex items-center justify-center border-4 border-[#DCEFE1] dark:border-emerald-700 shadow-lg">
                            {selectedEmoji.length <= 2 ? selectedEmoji : fullName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                        }}
                        className="absolute bottom-0 right-0 p-2 bg-[#6FAF7B] text-white rounded-full shadow hover:bg-emerald-600 transition-colors"
                        title="Tải ảnh từ máy tính"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-1 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h1 className="text-2xl font-extrabold text-[#20223A] dark:text-white">{fullName}</h1>
                        <span className="px-2.5 py-0.5 bg-[#3C4097] text-white text-xs font-bold rounded-full">
                            {user?.role || 'Học viên'}
                        </span>
                    </div>
                    <p className="text-xs text-[#6B6D7A] dark:text-gray-400 font-mono">Email: {user?.email || 'user_khoa@pltsolutions.com'}</p>
                    <p className="text-xs text-[#20223A] dark:text-gray-300 pt-1 max-w-lg">{bio}</p>
                </div>

                <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-[#E2E4EB] dark:border-gray-700 pt-4 md:pt-0 md:pl-6 text-center">
                    <div>
                        <p className="text-xs text-[#6B6D7A] dark:text-gray-400">Cấp độ Vườn</p>
                        <p className="text-xl font-extrabold text-[#3C4097] dark:text-indigo-400">Level 5</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#6B6D7A] dark:text-gray-400">Cây Trưởng Thành</p>
                        <p className="text-xl font-extrabold text-[#6FAF7B] dark:text-emerald-400">3 Cây</p>
                    </div>
                </div>
            </div>

            {/* Notification alert */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Profile Form & Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Thông tin cá nhân */}
                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[#E2E4EB] dark:border-gray-700 pb-3 text-[#20223A] dark:text-white">
                        <User className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Thông Tin Cá Nhân
                    </h2>

                    <Input
                        label="HỌ VÀ TÊN"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

                    <Input
                        label="ĐỊA CHỈ EMAIL"
                        value={user?.email || 'user_khoa@pltsolutions.com'}
                        disabled
                        iconRight={<Mail className="w-4 h-4 text-gray-400" />}
                    />

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block mb-1">
                            GIỚI THIỆU BẢN THÂN (BIO)
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C4097] text-[#20223A] dark:text-gray-100"
                        />
                    </div>

                    <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Lưu thông tin
                    </Button>
                </form>

                {/* Form Đổi mật khẩu */}
                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[#E2E4EB] dark:border-gray-700 pb-3 text-[#20223A] dark:text-white">
                        <Key className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Đổi Mật Khẩu
                    </h2>

                    <Input
                        label="MẬT KHẨU HIỆN TẠI"
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••••••"
                        iconRight={
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="text-[#718096] dark:text-gray-400 hover:text-[#1A2E22] dark:hover:text-white cursor-pointer"
                            >
                                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                    />

                    <Input
                        label="MẬT KHẨU MỚI"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        iconRight={
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="text-[#718096] dark:text-gray-400 hover:text-[#1A2E22] dark:hover:text-white cursor-pointer"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                    />

                    <div className="p-3 bg-[#FAFAF7] dark:bg-gray-900 rounded-xl text-[11px] text-[#6B6D7A] dark:text-gray-400 space-y-1 border border-[#E2E4EB] dark:border-gray-700">
                        <p className="font-bold text-[#20223A] dark:text-white">Yêu cầu mật khẩu chuẩn:</p>
                        <p>• Ít nhất 8 ký tự</p>
                        <p>• Bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt (!@#$%^&*)</p>
                    </div>

                    <Button type="submit" variant="outline" fullWidth className="font-bold">
                        Cập nhật mật khẩu
                    </Button>
                </form>
            </div>

            {/* Avatar Selection & Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 max-w-md w-full space-y-5 shadow-2xl relative text-[#20223A] dark:text-gray-100">
                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-[#3C4097] dark:text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Thay Đổi Ảnh Đại Diện</h3>
                        </div>

                        {/* Upload from Computer Box */}
                        <div className="p-4 bg-[#F4F5FF] dark:bg-gray-900 border-2 border-dashed border-[#3C4097]/40 dark:border-indigo-500/40 rounded-2xl text-center space-y-2">
                            <Upload className="w-8 h-8 text-[#3C4097] dark:text-indigo-400 mx-auto" />
                            <p className="text-xs font-bold text-[#20223A] dark:text-white">Tải ảnh trực tiếp từ Máy tính của bạn</p>
                            <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Hỗ trợ các định dạng PNG, JPG, WEBP (Tối đa 5MB)</p>
                            <Button
                                type="button"
                                variant="indigo"
                                size="sm"
                                className="font-bold inline-flex items-center gap-1.5"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="w-4 h-4" /> Chọn ảnh từ máy tính
                            </Button>
                        </div>

                        {/* Emoji List */}
                        <div className="grid grid-cols-5 gap-3">
                            {emojiList.map((av, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setSelectedEmoji(av)
                                        setCustomAvatarUrl(null)
                                        if (user?.email) {
                                            localStorage.removeItem('skillgarden_avatar_' + user.email)
                                        }
                                    }}
                                    className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center border transition-all ${selectedEmoji === av && !customAvatarUrl
                                        ? 'border-[#3C4097] bg-[#F4F5FF] dark:bg-indigo-950 shadow-md scale-105'
                                        : 'border-[#E2E4EB] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-700">
                            <Button variant="outline" onClick={() => setShowAvatarModal(false)}>Hủy</Button>
                            <Button variant="indigo" className="font-bold" onClick={() => setShowAvatarModal(false)}>
                                Áp dụng thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
