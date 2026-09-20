# 🌿 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG SKILLGARDEN (EDTECH & GAMIFICATION)

Tài liệu này hướng dẫn chi tiết cách vận hành, khởi chạy và khai thác toàn bộ tính năng của hệ thống **SkillGarden** dành cho 3 vai trò: **Học viên (Student)**, **Quản trị viên nội dung (Admin LMS)** và **Quản trị tối cao (Super Admin)**.

---

## 🚀 1. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG (GETTING STARTED)

Hệ thống được đóng gói hoàn chỉnh bằng Docker Compose (Backend PHP 8.3, Frontend React 19, CSDL MySQL 8.0).

### Cách Khởi Chạy Nhanh Bằng Docker (Khuyên Dùng)
Mở terminal PowerShell tại thư mục gốc dự án (`d:\PLT-Skill_garden`):
```powershell
cd d:\PLT-Skill_garden
docker compose up -d
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api`
- **MySQL Database**: `localhost:3307` (Tên DB: `db_skill_garden`, User: `root`, Password: `skillgarden_dev`)

---

## 🔑 2. DANH SÁCH TÀI KHOẢN ĐÃ ĐỒNG BỘ TRONG CSDL (100% ĐĂNG NHẬP THÀNH CÔNG)

Toàn bộ các tài khoản dưới đây đã được cập nhật trực tiếp trong CSDL MySQL và sẵn sàng đăng nhập ngay lập tức:

| Vai Trò (Role) | Email | Username | Mật Khẩu | Quyền Hạn & Đặc Điểm |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pltsolutions.com` | `skillgarden_super_admin` | **`admin123`** | **Toàn quyền tối cao**: Quản lý tài khoản Admin, cấp ma trận phân quyền, xem báo cáo tổng thể, nhật ký Audit Logs. |
| **Super Admin** | `admin@skillgarden.com` | `skillgarden_admin` | **`admin123`** | Tài khoản Super Admin dự phòng hệ thống. |
| **Admin LMS** | `lms.admin@pltsolutions.com` | `lms_admin` | **`admin123`** | **Quản trị LMS**: Tạo & Upload Bài học Video, Upload & Quản lý Tài liệu PDF, Phê duyệt học viên, Tạo bài thi Quiz. |
| **Admin LMS** | `baopq@skillgarden.com` | `baopq_admin` | **`Admin123@`** | Quản trị viên nội dung khóa học & bài tập thực hành. |
| **Học Viên (Student)** | `user_khoa@pltsolutions.com` | `user_khoa` | **`123456`** | Học viên mẫu: Trồng cây kỹ năng, xem video bài học, làm Quiz, tưới nước (+10 XP), xem Bảng xếp hạng. |
| **Học Viên (Student)** | `anhkhoa@plt.com` | `anhkhoa` | **`Password123!`** | Tài khoản học viên cá nhân đã kích hoạt. |
| **Học Viên (Student)** | `anhkhoa.user@gmail.com` | `anhkhoa_dev` | **`123456`** | Học viên cá nhân đã kích hoạt. |
| **Học Viên (Pending)** | `maitran@gmail.com` | `maitran99` | **`Password123!`** | Học viên mới đăng ký *(Chờ Admin phê duyệt tài khoản)*. |
| **Học Viên (Pending)** | `tuanvm.pending@gmail.com` | `tuanvm` | **`Password123!`** | Học viên mới đăng ký *(Chờ Admin phê duyệt tài khoản)*. |

---

## ❓ 3. AI CÓ QUYỀN UPLOAD VIDEO BÀI HỌC VÀ TÀI LIỆU PDF?

> **QUY ĐỊNH PHÂN QUYỀN:**
> - **Chỉ tài khoản Admin LMS** (`lms.admin@pltsolutions.com` / `baopq@skillgarden.com`) và **Super Admin** (`admin@pltsolutions.com` / `admin@skillgarden.com`) mới có quyền Tạo bài học, Upload file Video và Upload file PDF.
> - Các tài khoản Admin thông thường không có quyền LMS khi truy cập trang Upload Video/PDF sẽ bị rào chắn phân quyền (`🔒 Rào chắn phân quyền Quản trị LMS`) và hệ thống từ chối thao tác.

---

## 🎬 4. HƯỚNG DẪN CHI TIẾT DÀNH CHO ADMIN: UPLOAD VIDEO & TÀI LIỆU PDF

### 📍 Quy trình Upload Bài Học Video (3 bước):

1. **Đăng nhập với tài khoản Admin LMS:**
   - Đăng nhập email: `lms.admin@pltsolutions.com` / Mật khẩu: **`admin123`**.
   - Sau khi đăng nhập, hệ thống sẽ tự động chuyển đến **Giao diện Admin Dashboard**.

2. **Truy cập Quản lý Khóa học & Bài học:**
   - Trên thanh Sidebar bên trái, chọn **Quản Lý Khóa Học LMS** (truy cập `/admin/courses`).
   - Chọn Khóa học/Kỹ năng cần thêm bài học (Ví dụ: *Frontend React 19 Mastery*).
   - Nhấp nút **+ Thêm Bài Học Mới**.

3. **Điền Thông Tin Bài Học Video:**
   - **Tiêu đề bài học:** Nhập tên bài (Ví dụ: *Bài 3: React Hooks & State Management*).
   - **Mô tả ngắn:** Tóm tắt nội dung bài học.
   - **Đường dẫn Video (Video URL):**
     - Nhập link Embed YouTube (Ví dụ: `https://www.youtube.com/embed/dQw4w9WgXcQ`)
     - Hoặc đường dẫn trực tiếp MP4 (`https://cdn.example.com/videos/lesson3.mp4`).
   - **Thời lượng video (Phút):** Nhập số phút (Ví dụ: `15`).
   - Nhấn **Lưu Bài Học**. Bài học sẽ lập tức hiển thị cho học viên trên Giao diện Học tập.

---

### 📄 Quy trình Upload Tài Liệu Tham Khảo PDF:

1. Trên Sidebar Admin, chọn **Quản Lý Tài Liệu PDF** (`/admin/pdf-materials`).
2. Nhấp nút **Upload Tài Liệu PDF Mới**.
3. **Tiêu đề tài liệu:** Nhập tên tài liệu (Ví dụ: *Slide_Bai_3_React_Hooks.pdf*).
4. **Bài học liên kết:** Chọn bài học video vừa tạo ở bước trên.
5. **Đường dẫn File (URL):** Nhập link lưu trữ PDF.
6. Nhấn **Thêm tài liệu**. Học viên khi học bài đó sẽ thấy nút "Tải tài liệu PDF" đi kèm.

---

## 👤 5. HƯỚNG DẪN DÀNH CHO HỌC VIÊN (STUDENT FLOW)

1. **Đăng Ký / Đăng Nhập:**
   - Sử dụng tài khoản: `user_khoa@pltsolutions.com` / Mật khẩu: **`123456`** (hoặc `anhkhoa@plt.com` / **`Password123!`**).

2. **Khám Phá Vườn Kỹ Năng & Chọn Cây Trồng:**
   - Vào mục **Khu Vườn Của Tôi** (`/dashboard/my-garden`) hoặc **Danh Mục Kỹ Năng** (`/dashboard/skill-catalog`).
   - Chọn kỹ năng muốn học (Ví dụ: *React 19 Mastery*) và chọn loại hạt mầm (Ví dụ: *Cây Hoa Anh Đào*).

3. **Học Bài Học Video & Tích Lũy XP:**
   - Vào **Lộ Trình Học Tập** (`/dashboard/learning-path/:skillId`).
   - Xem bài học Video, làm bài thi Quiz trắc nghiệm.
   - Khi hoàn thành bài học, hệ thống tự động cộng điểm XP (+50 đến +100 XP) và thúc đẩy mầm cây sinh trưởng qua 5 giai đoạn (Hạt mầm ➔ Mầm xanh ➔ Cây xòe lá ➔ Đơm hoa ➔ Thu hoạch cổ thụ).

4. **Tưới Nước Hàng Ngày & Xem Bảng Xếp Hạng:**
   - Tại trang Khu vườn, nhấn **Tưới Nước (+10 XP)** để duy trì chuỗi Streak học tập.
   - Vào **Bảng Xếp Hạng** (`/dashboard/leaderboard`) để theo dõi vị trí thứ hạng của mình trên toàn hệ thống.

---

## 🛡️ 6. HƯỚNG DẪN DÀNH CHO SUPER ADMIN (QUẢN TRỊ TỐI CAO)

1. **Quản Lý Tài Khoản Admin (`/superadmin/users`):**
   - Tạo mới tài khoản Admin cho giảng viên / biên tập viên.
   - Khóa/Mở khóa tài khoản Admin khi cần thiết.

2. **Ma Trận Phân Quyền (`/superadmin/permissions`):**
   - Cấp từng quyền cụ thể cho Admin (Cấp quyền `ManageCourses` để upload video, `ManageQuizzes` để tạo đề thi, `ManageUsers` để duyệt học viên).

3. **Báo Cáo Thống Kê System (`/superadmin/reports`):**
   - Xem tổng số học viên, tỷ lệ đạt Quiz, lượng bài học đã hoàn thành và số cây đã thu hoạch.

4. **Nhật Ký Thao Tác (Audit Logs) (`/superadmin/audit-logs`):**
   - Theo dõi toàn bộ lịch sử thao tác của các Admin trên hệ thống để bảo đảm an toàn dữ liệu.
