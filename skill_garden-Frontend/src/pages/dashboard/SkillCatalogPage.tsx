import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sprout, BookOpen, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { gardenService } from '../../services/gardenService'

interface SkillItem {
    id: string
    title: string
    category: string
    plantType: string
    plantIcon: string
    description: string
    lessonsCount: number
    totalXp: number
    levelRequired: string
    isEnrolled: boolean
    color: string
}

export const SkillCatalogPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [loadingSkillId, setLoadingSkillId] = useState<string | null>(null)

    const [skills, setSkills] = useState<SkillItem[]>([
        {
            id: '1',
            title: 'Frontend React 19 Mastery',
            category: 'Frontend',
            plantType: 'Cây Hoa Anh Đào 🌸',
            plantIcon: '🌸',
            description: 'Làm chủ React 19, Hooks, State Management, Server Components & Tailwind CSS.',
            lessonsCount: 18,
            totalXp: 900,
            levelRequired: 'Cơ bản',
            isEnrolled: true,
            color: 'border-pink-200 bg-pink-50/30 dark:border-pink-900/50 dark:bg-pink-950/20'
        },
        {
            id: '2',
            title: 'Backend NestJS & Node.js System',
            category: 'Backend',
            plantType: 'Cây Cổ Thụ 🌳',
            plantIcon: '🌳',
            description: 'Xây dựng RESTful API, Microservices, Dependency Injection và Authentication chuẩn enterprise.',
            lessonsCount: 22,
            totalXp: 1200,
            levelRequired: 'Trung cấp',
            isEnrolled: true,
            color: 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
        },
        {
            id: '3',
            title: 'Database SQL & MySQL Architect',
            category: 'Database',
            plantType: 'Cây Tre Trăm Đốt 🎋',
            plantIcon: '🎋',
            description: 'Thiết kế cơ sở dữ liệu quan hệ, viết SQL query phức tạp, tối ưu Index & Transaction.',
            lessonsCount: 14,
            totalXp: 700,
            levelRequired: 'Cơ bản',
            isEnrolled: true,
            color: 'border-teal-200 bg-teal-50/30 dark:border-teal-900/50 dark:bg-teal-950/20'
        },
        {
            id: '4',
            title: 'Python & Data Analysis Core',
            category: 'AI/Python',
            plantType: 'Cây Xương Rồng Sa Mạc 🌵',
            plantIcon: '🌵',
            description: 'Lập trình Python từ cơ bản đến nâng cao, xử lý dữ liệu với Pandas, NumPy & Matplotlib.',
            lessonsCount: 16,
            totalXp: 800,
            levelRequired: 'Cơ bản',
            isEnrolled: true,
            color: 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'
        },
        {
            id: '5',
            title: 'Manual & Automation Testing',
            category: 'Testing',
            plantType: 'Cây Hoa Hướng Dương 🌻',
            plantIcon: '🌻',
            description: 'Quy trình kiểm thử phần mềm, viết Test Cases, Automation test với Playwright & Jest.',
            lessonsCount: 12,
            totalXp: 600,
            levelRequired: 'Cơ bản',
            isEnrolled: false,
            color: 'border-yellow-200 bg-yellow-50/30 dark:border-yellow-900/50 dark:bg-yellow-950/20'
        },
        {
            id: '6',
            title: 'Flutter & React Native Mobile',
            category: 'Mobile',
            plantType: 'Cây Dừa Nhiệt Đới 🌴',
            plantIcon: '🌴',
            description: 'Phát triển ứng dụng di động đa nền tảng iOS & Android với UI/UX hiện đại.',
            lessonsCount: 20,
            totalXp: 1000,
            levelRequired: 'Trung cấp',
            isEnrolled: false,
            color: 'border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/20'
        }
    ])

    const handlePlantOrLearn = async (skill: SkillItem) => {
        setLoadingSkillId(skill.id)
        try {
            if (!skill.isEnrolled) {
                // Plant tree in backend
                await gardenService.plantSeed(Number(skill.id), 1)
                setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, isEnrolled: true } : s))
            }
            // Open the learning path for the selected skill.
            navigate(`/dashboard/learning-path/${skill.id}`)
        } catch {
            navigate(`/dashboard/learning-path/${skill.id}`)
        } finally {
            setLoadingSkillId(null)
        }
    }

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCat = selectedCategory === 'ALL' || skill.category === selectedCategory
        return matchesSearch && matchesCat
    })

    const categories = [
        { id: 'ALL', label: 'Tất cả kỹ năng' },
        { id: 'Frontend', label: 'Frontend' },
        { id: 'Backend', label: 'Backend' },
        { id: 'Database', label: 'Database' },
        { id: 'AI/Python', label: 'AI & Python' },
        { id: 'Testing', label: 'Software Testing' },
        { id: 'Mobile', label: 'Mobile App' }
    ]

    return (
        <div className="min-h-screen bg-transparent text-[#1A2E22] dark:text-gray-100 pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold text-[#3F49C8] dark:text-indigo-400 uppercase tracking-wider block mb-1">
                            DANH MỤC LỘ TRÌNH CHUẨN DOANH NGHIỆP
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A2E22] dark:text-white flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-[#3F49C8] dark:text-indigo-400" /> Khám Phá Kỹ Năng IT 🚀
                        </h1>
                        <p className="text-xs md:text-sm text-[#718096] dark:text-gray-400 mt-1 max-w-2xl">
                            Chọn hạt giống kỹ năng bạn muốn gieo trồng. Mỗi kỹ năng hoàn thành sẽ trao thưởng XP và bổ sung 1 cây trồng trưởng thành vào Khu Vườn Cá Nhân của bạn.
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Tìm kiếm kỹ năng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            iconRight={<Search className="w-4 h-4 text-gray-400" />}
                        />
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.id
                                ? 'bg-[#3F49C8] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-700 text-[#4A5568] dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map(skill => (
                    <div
                        key={skill.id}
                        className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border ${skill.color} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative group`}
                    >
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-[#E6ECE6] dark:border-gray-700 flex items-center justify-center text-2xl shadow-xs">
                                    {skill.plantIcon}
                                </div>
                                {skill.isEnrolled ? (
                                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã Trồng
                                    </span>
                                ) : (
                                    <Badge variant="neutral" className="font-bold text-[11px]">
                                        {skill.levelRequired}
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <span className="text-[11px] font-bold text-[#718096] dark:text-gray-400 uppercase">
                                    {skill.category} • {skill.plantType}
                                </span>
                                <h3 className="text-base font-extrabold text-[#1A2E22] dark:text-white group-hover:text-[#3F49C8] dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                                    {skill.title}
                                </h3>
                                <p className="text-xs text-[#718096] dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">
                                    {skill.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between text-xs text-[#4A5568] dark:text-gray-300 font-bold">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-[#3F49C8] dark:text-indigo-400" /> {skill.lessonsCount} Bài học
                                </span>
                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> +{skill.totalXp} XP
                                </span>
                            </div>

                            <Button
                                variant={skill.isEnrolled ? "indigo" : "primary"}
                                fullWidth
                                disabled={loadingSkillId === skill.id}
                                className="font-bold flex items-center justify-center gap-2 text-xs cursor-pointer"
                                onClick={() => handlePlantOrLearn(skill)}
                            >
                                {loadingSkillId === skill.id ? (
                                    <span>Đang chuẩn bị mầm cây...</span>
                                ) : skill.isEnrolled ? (
                                    <>
                                        <span>Vào Học Ngay</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <Sprout className="w-4 h-4" />
                                        <span>Bắt Đầu Trồng Cây Này</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
