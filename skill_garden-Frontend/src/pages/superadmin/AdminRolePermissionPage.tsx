import React, { useState, useEffect } from 'react'
import { Key, Shield, Check, X, Save, RefreshCw, AlertCircle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { superAdminService, AdminUser } from '../../services/superAdminService'

interface PermissionDef {
    key: string
    label: string
    description: string
}

const PERMISSION_DEFS: PermissionDef[] = [
    { key: 'MANAGE_USERS', label: 'Duyệt Học Viên', description: 'Duyệt, sửa, khóa và quản lý tài khoản học viên' },
    { key: 'MANAGE_SKILLS', label: 'Quản Lý Khóa Học', description: 'Tạo, sửa và cập nhật danh mục kỹ năng' },
    { key: 'MANAGE_LESSONS', label: 'Quản Lý Bài Học', description: 'Tạo bài học, tải video LMS và quản lý chương' },
    { key: 'MANAGE_QUIZZES', label: 'Ngân Hàng Quiz', description: 'Quản lý câu hỏi trắc nghiệm, tạo & duyệt đề thi' },
    { key: 'MANAGE_MATERIALS', label: 'Tài Liệu PDF', description: 'Đăng tải tài liệu học liệu và tài liệu đính kèm' },
    { key: 'MANAGE_PLANTS', label: 'Quản Lý Loại Cây', description: 'Cấu hình loại cây 3D và các giai đoạn phát triển' },
    { key: 'MANAGE_ACHIEVEMENTS', label: 'Quản Lý Thành Tích', description: 'Thiết lập danh hiệu, huy hiệu và điều kiện đạt được' },
    { key: 'MANAGE_GAMIFICATION', label: 'Cấu Hình Gamification', description: 'Điều chỉnh điểm kinh nghiệm XP và streak' }
]

export const AdminRolePermissionPage: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [permissionsMap, setPermissionsMap] = useState<Record<number, string[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [savingAdminId, setSavingAdminId] = useState<number | null>(null)
    const [toastMsg, setToastMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const notifySync = () => {
        try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const bc = new BroadcastChannel('skillgarden_auth_sync')
                bc.postMessage({ type: 'PERMISSIONS_UPDATED', timestamp: Date.now() })
                bc.close()
            }
        } catch {
            // Ignore channel error
        }
    }

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    const fetchAdminsAndPermissions = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const adminList = await superAdminService.getAdminUsers()
            setAdmins(adminList)

            const pMap: Record<number, string[]> = {}
            for (const adm of adminList) {
                pMap[adm.id] = adm.permissions || []
            }
            setPermissionsMap(pMap)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải danh sách tài khoản Admin từ máy chủ.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminsAndPermissions()
    }, [])

    const togglePermission = (adminId: number, permKey: string) => {
        setPermissionsMap(prev => {
            const current = prev[adminId] || []
            const exists = current.includes(permKey)
            const updated = exists ? current.filter(k => k !== permKey) : [...current, permKey]
            return { ...prev, [adminId]: updated }
        })
    }

    const setAllPermissionsForAdmin = (adminId: number, enable: boolean) => {
        setPermissionsMap(prev => ({
            ...prev,
            [adminId]: enable ? PERMISSION_DEFS.map(p => p.key) : []
        }))
    }

    const handleSaveSingleAdmin = async (adminId: number, adminEmail: string) => {
        setSavingAdminId(adminId)
        try {
            const perms = permissionsMap[adminId] || []
            await superAdminService.setAdminPermissions(adminId, perms)
            notifySync()
            showToast(`Đã lưu phân quyền thành công cho tài khoản ${adminEmail}!`)
        } catch (err: any) {
            alert(err.message || 'Lưu phân quyền thất bại.')
        } finally {
            setSavingAdminId(null)
        }
    }

    const handleSaveAll = async () => {
        if (admins.length === 0) return
        setIsSaving(true)
        try {
            for (const adm of admins) {
                const perms = permissionsMap[adm.id] || []
                await superAdminService.setAdminPermissions(adm.id, perms)
            }
            notifySync()
            showToast('Đã lưu toàn bộ Ma Trận Phân Quyền vào Cơ Sở Dữ Liệu thành công!')
        } catch (err: any) {
            alert(err.message || 'Lỗi khi lưu ma trận phân quyền.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Ma Trận Phân Quyền Admin LMS (Đồng Bộ CSDL)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Cấp quyền truy cập chi tiết cho các tài khoản Quản trị viên (Admin LMS). Dữ liệu được lưu trực tiếp vào bảng <code>admin_permissions</code> trong CSDL MySQL.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAdminsAndPermissions}
                        disabled={isLoading}
                        className="font-bold flex items-center gap-1.5 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại CSDL
                    </Button>
                    <Button
                        variant="indigo"
                        onClick={handleSaveAll}
                        disabled={isSaving || isLoading || admins.length === 0}
                        className="font-bold flex items-center gap-2 bg-purple-700 hover:bg-purple-800 border-none shadow-md"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu CSDL...' : 'Lưu Tất Cả Quyền'}
                    </Button>
                </div>
            </div>

            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Matrix Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-16 text-center text-xs font-bold text-gray-500 dark:text-gray-400 space-y-2">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 dark:text-purple-400" />
                        <p>Đang nạp danh sách Admin và quyền hạn từ máy chủ MySQL...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="p-16 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                        <ShieldAlert className="w-8 h-8 mx-auto text-amber-500" />
                        <p className="font-bold text-sm">Chưa có tài khoản Admin nào trong hệ thống.</p>
                        <p>Vui lòng chuyển qua mục "Quản lý Admin" để tạo tài khoản Admin LMS trước khi phân quyền.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-64">Tài Khoản Admin</th>
                                    {PERMISSION_DEFS.map(p => (
                                        <th key={p.key} className="p-4 text-center whitespace-nowrap" title={p.description}>
                                            <div>{p.label}</div>
                                            <div className="text-[10px] text-gray-400 font-normal lowercase">{p.key}</div>
                                        </th>
                                    ))}
                                    <th className="p-4 text-right sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 w-28">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                                {admins.map((adm) => {
                                    const adminPerms = permissionsMap[adm.id] || []
                                    const isSavingThis = savingAdminId === adm.id

                                    return (
                                        <tr key={adm.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            {/* Admin Info */}
                                            <td className="p-4 sticky left-0 bg-white dark:bg-gray-900 z-10">
                                                <div className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                                    <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                    <span>{adm.full_name || adm.username}</span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate max-w-[200px]" title={adm.email}>
                                                    {adm.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <button
                                                        onClick={() => setAllPermissionsForAdmin(adm.id, true)}
                                                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                                    >
                                                        Chọn hết
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => setAllPermissionsForAdmin(adm.id, false)}
                                                        className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:underline"
                                                    >
                                                        Bỏ chọn
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        {adminPerms.length}/{PERMISSION_DEFS.length} quyền
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Permission Checkboxes / Toggles */}
                                            {PERMISSION_DEFS.map(p => {
                                                const isGranted = adminPerms.includes(p.key)
                                                return (
                                                    <td key={p.key} className="p-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePermission(adm.id, p.key)}
                                                            className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${isGranted
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                                                                : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                            title={`${isGranted ? 'Thu hồi quyền' : 'Cấp quyền'} ${p.label}`}
                                                        >
                                                            {isGranted ? (
                                                                <span className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5">
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                    <span>Bật</span>
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 text-gray-400">
                                                                    <X className="w-3 h-3 text-gray-400" />
                                                                    <span>Tắt</span>
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                )
                                            })}

                                            {/* Row Action Save Button */}
                                            <td className="p-4 text-right sticky right-0 bg-white dark:bg-gray-900 z-10">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSaveSingleAdmin(adm.id, adm.email)}
                                                    disabled={isSavingThis}
                                                    className="font-bold text-[11px] text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                                >
                                                    {isSavingThis ? (
                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Save className="w-3 h-3" /> Lưu
                                                        </span>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
