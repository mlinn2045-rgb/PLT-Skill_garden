# 🌿 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG SKILLGARDEN (EDTECH & GAMIFICATION)

Tài liệu này hướng dẫn chi tiết cách vận hành, khởi chạy và khai thác toàn bộ tính năng của hệ thống **SkillGarden** dành cho 3 vai trò: **Học viên (Student)**, **Quản trị viên nội dung (Admin LMS)** và **Quản trị tối cao (Super Admin)**.

---

## 🚀 1. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG (GETTING STARTED)

Để hệ thống hoạt động đầy đủ tính năng với CSDL thời gian thực:

### Bước 1: Khởi chạy Backend PHP API
Mở terminal PowerShell tại thư mục gốc project:
```powershell
cd d:\skill_garden-\skill_garden-Backend
php -S localhost:8000
```
- API Server sẽ chạy tại: `http://localhost:8000/api`
- Đảm bảo MySQL Service (`skill_garden` database) đang bật.

### Bước 2: Khởi chạy Frontend React App
Mở một cửa sổ terminal PowerShell mới:
```powershell
cd d:\skill_garden-\skill_garden-Frontend
npm run dev
```
- Truy cập ứng dụng tại: `http://localhost:5173`

---

## 🔑 2. DANH SÁCH TÀI KHOẢN MẪU ĐÃ CẬP NHẬT TRONG CSDL (100% ĐĂNG NHẬP THÀNH CÔNG)

| Vai Trò (Role) | Email / Username | Mật Khẩu | Quyền Hạn Chính |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pltsolutions.com` *(hoặc `admin@skillgarden.com`)* | **`admin123`** | Quản lý tài khoản Admin, Cấp ma trận phân quyền, Xem báo cáo tổng thể, Nhật ký Audit logs, Toàn quyền tối cao |
| **Admin LMS** | `lms.admin@pltsolutions.com` *(username: `lms_admin`)* | **`admin123`** | **CHỈ ADMIN LMS** có quyền **Tạo & Upload Bài học Video**, **Upload & Quản lý Tài liệu PDF**, Phê duyệt học viên, Tạo Bài thi Quiz |
| **Admin Thông Thường** | `baopq@skillgarden.com` *(username: `baopq_admin`)* | **`Admin123@`** | Xem danh sách hệ thống *(🔒 Không có quyền upload Video & PDF bài học)* |
| **Học Viên (Student)** | `user_khoa@pltsolutions.com` *(hoặc `anhkhoa.user@gmail.com`)* | **`123456`** | Trồng cây kỹ năng, Xem video bài học, Làm bài thi Quiz, Tưới nước (+10 XP), Xem Bảng xếp hạng |

> 💡 **Ghi chú:** Em đã cập nhật lại trực tiếp mật khẩu và kích hoạt trạng thái (`is_approved = 1`, `status = ACTIVE`) cho toàn bộ tài khoản mẫu trên trong CSDL MySQL.

---

## ❓ 3. AI CÓ QUYỀN UPLOAD VIDEO BÀI HỌC VÀ TÀI LIỆU PDF?

> **QUY ĐỊNH PHÂN QUYỀN MỚI NHẤT:**
> - **Chỉ tài khoản Admin LMS** (`lms.admin@pltsolutions.com` / `lms_admin`) và **Super Admin** mới có quyền Tạo bài học, Upload file Video và Upload file PDF.
> - Các tài khoản Admin thông thường không thuộc nhóm Quản trị LMS khi vào trang Upload Video/PDF sẽ bị hiển thị rào chắn phân quyền (`🔒 Rào chắn phân quyền Quản trị LMS`) và hệ thống từ chối thao tác upload từ cả Frontend lẫn Backend API.

---

## 🎬 4. HƯỚNG DẪN CHI TIẾT DÀNH CHO ADMIN: UPLOAD VIDEO & TÀI LIỆU PDF

### 📍 Quy trình Upload Bài Học Video (3 bước):

1. **Đăng nhập với tài khoản Admin LMS:**
   - Đăng nhập email: `lms.admin@pltsolutions.com` (hoặc `admin@pltsolutions.com`) / Mật khẩu: **`admin123`**.
   - Sau khi đăng nhập, hệ thống sẽ tự động chuyển đến **Giao diện Admin Dashboard**.

2. **Truy cập Quản lý Khóa học & Bài học:**
   - Trên thanh Sidebar bên trái, chọn **Quản Lý Khóa Học LMS** (hoặc truy cập `/admin/courses`).
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
   - Sử dụng tài khoản: `user_khoa@pltsolutions.com` / Mật khẩu: **`123456`**.

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
