# 🌿 HƯỚNG DẪN VẬN HÀNH & SỬ DỤNG HỆ THỐNG SKILLGARDEN
### *(Nền tảng EdTech & Gamification Nuôi Dưỡng Khu Vườn Kỹ Năng)*

---

Tài liệu này cung cấp hướng dẫn đầy đủ cách khởi chạy hệ thống, danh sách tài khoản đã được đồng bộ chuẩn hóa 100% trong CSDL MySQL, quy trình khôi phục tài khoản tức thì sau khi Rebuild Docker, và hướng dẫn chi tiết dành cho cả 3 vai trò: **Super Admin**, **Admin LMS** và **Học viên (Student)**.

---

## 🚀 1. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG (GETTING STARTED)

Hệ thống được đóng gói hoàn chỉnh bằng **Docker Compose** bao gồm 3 container độc lập:
1. **Frontend App**: React 19 + Vite + Tailwind CSS + Lucide Icons (`skillgarden_frontend`)
2. **Backend API**: PHP 8.3 Apache RESTful API Chuẩn MVC (`skillgarden_backend`)
3. **Database**: MySQL 8.4 LTS (`skillgarden_db`)

### Lệnh Khởi Chạy Nhanh:
Mở PowerShell tại thư mục gốc dự án (`d:\PLT-Skill_garden`):
```powershell
# Khởi động toàn bộ cụm container
docker compose up -d
```

### Các Cổng Dịch Vụ & Địa Chỉ Truy Cập:
- **Giao diện người dùng (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Cổng API Backend**: [http://localhost:8000/api](http://localhost:8000/api)
- **Trang Cài đặt & Khôi phục CSDL tự động**: [http://localhost:8000/install-db.php](http://localhost:8000/install-db.php)
- **Cổng kết nối CSDL MySQL**: `localhost:3307`
  - *Database Name*: `db_skill_garden`
  - *Username*: `root`
  - *Password*: `skillgarden_dev`

---

## 🔄 2. CÁCH KHÔI PHỤC TOÀN BỘ TÀI KHOẢN KHI REBUILD DOCKER

> [!NOTE]
> Khi bạn xóa container hoặc xóa Docker volume (`docker compose down -v`), dữ liệu database sẽ được khởi tạo lại tự động từ file [`schema.sql`](file:///d:/PLT-Skill_garden/skill_garden-Backend/database/schema.sql). File này đã được cập nhật toàn bộ tài khoản mặc định với chuẩn mã hóa mật khẩu Bcrypt hợp lệ.

Nếu muốn đồng bộ hoặc reset lại toàn bộ mật khẩu và tài khoản mẫu bất cứ lúc nào, bạn chỉ cần chạy **1 dòng lệnh duy nhất**:

```powershell
docker exec skillgarden_backend php /var/www/html/bin/seed_users.php
```
*Hoặc truy cập trực tiếp bằng trình duyệt vào:* [http://localhost:8000/install-db.php](http://localhost:8000/install-db.php)

---

## 🔑 3. BẢNG DANH SÁCH TÀI KHOẢN ĐÃ ĐỒNG BỘ TRONG CSDL (100% ĐĂNG NHẬP THÀNH CÔNG)

Toàn bộ các tài khoản dưới đây đã được mã hóa chuẩn Bcrypt, kiểm tra kết nối API login và sẵn sàng đăng nhập ngay:

| STT | Vai Trò (Role) | Email Đăng Nhập | Tên Đăng Nhập | Mật Khẩu | Trạng Thái | Mô Tả Quyền Hạn & Mục Đích Sử Dụng |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | **Super Admin** | `admin@pltsolutions.com` | `skillgarden_super_admin` | **`admin123`** | ✅ Active | **Quản trị tối cao**: Quản lý Admin, cấp ma trận phân quyền, phê duyệt user, xem Audit Log hệ thống. |
| **2** | **Super Admin** | `admin@skillgarden.com` | `skillgarden_admin` | **`admin123`** | ✅ Active | **Super Admin dự phòng**: Toàn quyền cấu hình hệ thống & phân quyền. |
| **3** | **Admin LMS** | `lms.admin@pltsolutions.com` | `lms_admin` | **`admin123`** | ✅ Active | **Quản trị đào tạo**: Tạo & sửa khóa học, upload bài học Video, upload tài liệu PDF, quản lý câu hỏi Quiz. |
| **4** | **Admin LMS** | `baopq@skillgarden.com` | `baopq_admin` | **`Admin123@`** | ✅ Active | **Quản trị viên nội dung**: Quản lý khóa học, bài học & bài tập thực hành. |
| **5** | **Học Viên (Student)** | `user_khoa@pltsolutions.com` | `user_khoa` | **`123456`** | ✅ Active | Học viên chuẩn mẫu: Đã mở sẵn level 5, 1250 XP, Streak 7 ngày. Trồng cây, xem video, làm quiz, tưới nước. |
| **6** | **Học Viên (Student)** | `anhkhoa@plt.com` | `anhkhoa` | **`Password123!`** | ✅ Active | Học viên chính thức PLT Solutions (Level 5, 1500 XP, Streak 10 ngày). |
| **7** | **Học Viên (Student)** | `anhkhoa.user@gmail.com` | `anhkhoa_dev` | **`123456`** | ✅ Active | Học viên cá nhân đã kích hoạt (Level 5, 1250 XP). |
| **8** | **Học Viên (Student)** | `nam.le@gmail.com` | `namle_backend` | **`Password123!`** | ✅ Active | Học viên chuyên ngành Backend (Level 3, 680 XP). |
| **9** | **Học Viên (Cá nhân)** | `mlinn2045@gmail.com` | `mlinn2045` | *(MK bạn đã tạo khi ĐK)* | ✅ Active | Tài khoản cá nhân vừa đăng ký, **đã được duyệt kích hoạt sẵn trong DB**. |
| **10** | **Học Viên (Chờ duyệt)** | `maitran@gmail.com` | `maitran99` | **`Password123!`** | ⏳ Chờ duyệt | Dùng để test tính năng: Admin phê duyệt học viên mới tại trang Quản lý User. |
| **11** | **Học Viên (Chờ duyệt)** | `tuanvm.pending@gmail.com` | `tuanvm` | **`Password123!`** | ⏳ Chờ duyệt | Dùng để test tính năng từ chối / kích hoạt tài khoản học viên. |

---

## ❓ 4. QUY ĐỊNH PHÂN QUYỀN TRONG HỆ THỐNG

> [!IMPORTANT]
> **Ai có quyền upload Video bài học và Tài liệu PDF?**
> - **Chỉ có Admin LMS** (`lms.admin@pltsolutions.com`, `baopq@skillgarden.com`) hoặc **Super Admin** (`admin@pltsolutions.com`, `admin@skillgarden.com`) mới được phép truy cập trang quản trị khóa học, thêm bài học video, và đăng tải tài liệu PDF.
> - Tài khoản **Học viên (User)** khi cố tình vào các đường dẫn quản trị (`/admin/*` hoặc `/superadmin/*`) sẽ tự động bị rào chắn bảo mật chặn lại và điều hướng về trang chủ học tập.

---

## 🎬 5. HƯỚNG DẪN DÀNH CHO ADMIN LMS (TẠO BÀI HỌC VIDEO & PDF)

### Bước 1: Đăng nhập quyền Admin
- Sử dụng tài khoản: `lms.admin@pltsolutions.com` / Mật khẩu: **`admin123`**
- Truy cập vào **Trang Quản Trị Khóa Học LMS** qua menu Sidebar hoặc đường dẫn: `/admin/courses`.

### Bước 2: Thêm Bài Học Video Mới
1. Tại danh sách khóa học (ví dụ: *Frontend React 19 Mastery*), nhấp vào khóa học cần quản lý.
2. Nhấp nút **+ Thêm Bài Học Mới**.
3. Điền các trường thông tin:
   - **Tên bài học**: Ví dụ *Bài 1: Giới thiệu Virtual DOM & JSX*.
   - **Mô tả**: Tóm tắt kiến thức trọng tâm của bài học.
   - **Đường dẫn Video (Video URL)**:
     - Hỗ trợ link YouTube Embed: `https://www.youtube.com/embed/dQw4w9WgXcQ`
     - Hoặc link file MP4 trực tiếp: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
   - **Thời lượng (Phút)**: Nhập số phút dự kiến xem (ví dụ: `15`).
   - **Điểm thưởng XP**: Nhập điểm kinh nghiệm khi hoàn thành (mặc định `50 XP`).
4. Nhấn **Lưu Bài Học**. Bài học sẽ lập tức hiển thị trên sơ đồ học tập của toàn bộ học viên.

### Bước 3: Đính Kèm Tài Liệu Tham Khảo PDF
1. Trên Sidebar Admin, chuyển sang mục **Quản Lý Tài Liệu PDF** (`/admin/pdf-materials`).
2. Nhấp chọn **+ Upload Tài Liệu PDF Mới**.
3. Điền tên tài liệu (Ví dụ: *Slide_Bai_1_Kien_Truc_React19.pdf*).
4. Chọn bài học video liên kết tương ứng.
5. Dán đường dẫn URL file PDF lưu trữ.
6. Nhấn **Lưu tài liệu**. Học viên khi học bài đó sẽ thấy nút "Tải tài liệu PDF" đính kèm bên dưới khung xem video.

### Bước 4: Phê Duyệt Học Viên Chờ Duyệt (Pending)
1. Vào menu **Quản Lý Người Dùng** (`/admin/users`).
2. Tìm các tài khoản có trạng thái ⏳ **Chờ phê duyệt** (Ví dụ: `maitran@gmail.com`, `tuanvm.pending@gmail.com`).
3. Nhấp nút **Duyệt (Approve)**. Sau khi duyệt, học viên đó có thể đăng nhập bình thường vào hệ thống.

---

## 🌳 6. HƯỚNG DẪN DÀNH CHO HỌC VIÊN (STUDENT FLOW & GAMIFICATION)

### Bước 1: Đăng Nhập Hệ Thống
- Sử dụng tài khoản mẫu: `user_khoa@pltsolutions.com` / Mật khẩu: **`123456`**
- Hoặc tài khoản: `anhkhoa@plt.com` / Mật khẩu: **`Password123!`**

### Bước 2: Chọn Cây Kỹ Năng & Nuôi Dưỡng Khu Vườn
1. Truy cập vào **Khu Vườn Của Tôi** (`/dashboard/my-garden`) hoặc **Danh Mục Kỹ Năng** (`/dashboard/skill-catalog`).
2. Chọn lộ trình kỹ năng bạn quan tâm (Ví dụ: *Frontend React 19 Mastery*, *Backend NestJS & Node.js*, *Database SQL*...).
3. Nhận hạt mầm tương ứng (Ví dụ: Cây Hoa Anh Đào cho Frontend, Cây Cổ Thụ cho Backend, Cây Tre cho Database).

### Bước 3: Xem Video Bài Học & Sinh Trưởng Cây Trồng
1. Vào **Lộ Trình Học Tập** (`/dashboard/learning-path/:skillId`).
2. Xem bài giảng video và ghi chú bài học.
3. Khi hoàn thành bài học:
   - Hệ thống tự động cộng **+50 XP** đến **+100 XP** vào tài khoản.
   - Cây kỹ năng tăng trưởng qua 5 nấc: **Hạt mầm ➔ Mầm xanh ➔ Cây non ➔ Cây trưởng thành ➔ Cổ thụ nở hoa**.
4. Tham gia làm bài kiểm tra trắc nghiệm (Quiz) để củng cố kiến thức và nhận thêm điểm thưởng.

### Bước 4: Tưới Nước Hằng Ngày (Daily Streak) & Xem Bảng Xếp Hạng
1. Tại trang Khu vườn, nhấn nút **Tưới Nước (+10 XP)** mỗi ngày để duy trì chuỗi Streak học tập liên tục.
2. Vào **Bảng Xếp Hạng (Leaderboard)** (`/dashboard/leaderboard`) để so tài vị trí Top bảng điểm với các bạn học khác.

---

## 🛡️ 7. HƯỚNG DẪN DÀNH CHO SUPER ADMIN (QUẢN TRỊ TỐI CAO)

Tài khoản đăng nhập: `admin@pltsolutions.com` / Mật khẩu: **`admin123`**

1. **Quản Lý Danh Sách Admin (`/superadmin/users`):**
   - Khởi tạo tài khoản Admin mới cho giảng viên, biên tập viên nội dung.
   - Phân cấp vai trò: `USER`, `ADMIN`, `SUPER_ADMIN`.
   - Khóa (Lock) hoặc Mở khóa (Unlock) tài khoản khi vi phạm quy tắc.
2. **Ma Trận Phân Quyền Chi Tiết (`/superadmin/permissions`):**
   - Cấp phát các quyền hạn cụ thể cho từng Admin: `ManageUsers`, `ManageSkills`, `ManageLessons`, `ManageQuizzes`, `ViewReports`.
3. **Báo Cáo & Thống Kê Tổng Quan (`/superadmin/reports`):**
   - Theo dõi biểu đồ tăng trưởng học viên, tổng số giờ học, số cây kỹ năng đã thu hoạch và tỷ lệ vượt qua bài thi Quiz.
4. **Nhật Ký Thao Tác Hệ Thống (Audit Logs) (`/superadmin/audit-logs`):**
   - Giám sát toàn bộ hoạt động đăng nhập, cập nhật bài học, thay đổi quyền hạn của các Admin trong hệ thống theo thời gian thực.

---

## 🛠️ 8. CÁC LỆNH HỖ TRỢ BẢO TRÌ & KHẮC PHỤC SỰ CỐ NHANH

### 1. Đồng bộ lại tài khoản khi CSDL bị trống:
```powershell
docker exec skillgarden_backend php /var/www/html/bin/seed_users.php
```

### 2. Kiểm tra danh sách tài khoản hiện có trong MySQL:
```powershell
docker exec skillgarden_db mysql -uroot -pskillgarden_dev db_skill_garden -e "SELECT id, email, username, role, is_approved, status FROM users;"
```

### 3. Phê duyệt nhanh một học viên qua dòng lệnh:
```powershell
docker exec skillgarden_db mysql -uroot -pskillgarden_dev db_skill_garden -e "UPDATE users SET is_approved = 1, status = 'ACTIVE' WHERE email = 'maitran@gmail.com';"
```

### 4. Xem log hoạt động của Backend API:
```powershell
docker logs -f skillgarden_backend
```

### 5. Khởi động lại toàn bộ dịch vụ:
```powershell
docker compose restart
```
