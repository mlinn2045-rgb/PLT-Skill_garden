# HƯỚNG DẪN BẢO TRÌ & QUY CHUẨN DARK MODE (SKILLGARDEN)

> **Tài liệu quy chuẩn kỹ thuật cho Frontend Engineers**  
> **Áp dụng cho**: Toàn bộ hệ sinh thái Web App SkillGarden (Admin, Super Admin, Dashboard Học viên & Auth).  
> **Tiêu chuẩn tuân thủ**: WCAG 2.1 AA (Tỷ lệ tương phản tối thiểu 4.5:1 cho chữ thường và 3:1 cho chữ lớn/icon/đồ họa).

---

## 1. Cơ Chế Hoạt Động Của Dark Mode

SkillGarden sử dụng cơ chế **Class-based Dark Mode** của Tailwind CSS kết hợp quản lý qua LocalStorage & Theme Store:

1. **Thẻ gốc HTML**: Khi kích hoạt Dark Mode, class `dark` được gắn trực tiếp vào phần tử `<html class="dark">`.
2. **Persistence**: Trạng thái được lưu trong `localStorage.getItem('skillgarden_theme')` (`'dark'` hoặc `'light'`).
3. **CSS Variables & Utility Classes**:
   - Các class tiện ích Tailwind `dark:...` được kích hoạt tự động.
   - Màu thanh cuộn và text selection tự động đổi màu theo selector `html.dark` trong `src/styles/index.css`.

---

## 2. Bảng Mã Màu Chuẩn WCAG 2.1 AA

Để đảm bảo tuyệt đối không bị lỗi chữ hòa lẫn vào nền hoặc độ tương phản yếu, lập trình viên **bắt buộc tuân theo bảng tra cứu màu sau**:

| Thành phần UI | Chế độ Sáng (Light Mode) | Chế độ Tối (Dark Mode) | Tỷ lệ tương phản tối thiểu |
| :--- | :--- | :--- | :--- |
| **Nền trang chính (Page BG)** | `bg-[#FAFAF7]` hoặc `bg-transparent` | `dark:bg-gray-900` hoặc `dark:bg-gray-950` | N/A |
| **Nền Card / Container** | `bg-white` | `dark:bg-gray-800` | N/A |
| **Nền Card phụ / Nested item** | `bg-[#F7FAF7]` / `bg-gray-50` | `dark:bg-gray-700/50` / `dark:bg-gray-900/60` | N/A |
| **Đường viền (Borders)** | `border-[#E2E4EB]` / `border-[#E6ECE6]` | `dark:border-gray-700` | 3:1 |
| **Tiêu đề chính (Heading 1-3)** | `text-gray-900` / `text-[#1A2E22]` | `dark:text-white` hoặc `dark:text-gray-100` | **> 12:1 (Đạt AAA)** |
| **Văn bản thân (Body text)** | `text-gray-800` / `text-gray-700` | `dark:text-gray-200` | **> 7:1 (Đạt AAA)** |
| **Văn bản phụ / Label / Caption** | `text-gray-500` / `text-[#718096]` | `dark:text-gray-400` | **> 4.8:1 (Đạt AA)** |
| **Text Primary Brand (Indigo)** | `text-[#3F49C8]` / `text-[#3C4097]` | `dark:text-indigo-400` hoặc `dark:text-indigo-300` | **> 5.5:1 (Đạt AA)** |
| **Text Success Brand (Emerald)** | `text-emerald-700` / `text-[#2D7A4F]` | `dark:text-emerald-400` hoặc `dark:text-emerald-300` | **> 5.8:1 (Đạt AA)** |
| **Text Warning / Alert (Amber)** | `text-amber-700` | `dark:text-amber-400` | **> 5.2:1 (Đạt AA)** |
| **Text Error (Red)** | `text-red-700` | `dark:text-red-300` hoặc `dark:text-red-400` | **> 5.0:1 (Đạt AA)** |
| **Input / Select Nền & Viền** | `bg-white border-gray-300` | `dark:bg-gray-800 dark:border-gray-700 dark:text-white` | **> 4.5:1** |
| **Table Header** | `bg-[#FAFAF7] text-gray-500` | `dark:bg-gray-800/80 dark:text-gray-400` | **> 4.5:1** |
| **Table Row Hover** | `hover:bg-gray-50` | `dark:hover:bg-gray-700/50` | N/A |

---

## 3. Checklist Khi Tạo Mới Component / Trang Mới

Mỗi khi bổ sung một tính năng hoặc component mới, hãy rà soát checklist sau trước khi tạo Pull Request:

- [ ] **Không hardcode màu hex không có tiền tố dark:**
  - ❌ Tránh: `className="text-[#1A2E22] bg-white"`
  - ✅ Đúng: `className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"`
- [ ] **Các trang con bên trong DashboardLayout:**
  - Đặt class nền ngoài cùng là `bg-transparent` để layout cha kiểm soát màu nền mượt mà.
- [ ] **Kiểm tra Modal / Popup:**
  - Nền modal phải là `bg-white dark:bg-gray-800`.
  - Nút đóng (X icon): `text-gray-400 hover:text-gray-700 dark:hover:text-gray-200`.
- [ ] **Kiểm tra Bảng (Table):**
  - Thẻ `<table>` có `border-gray-200 dark:border-gray-700`.
  - Các dòng kẻ phân cách: `divide-y divide-gray-200 dark:divide-gray-700`.
- [ ] **Kiểm tra Form Inputs:**
  - Placeholder: `placeholder-gray-400 dark:placeholder-gray-500`.
  - Focus ring: `focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400`.
- [ ] **Kiểm tra Badges & Tags:**
  - Badge Success: `bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300`.
  - Badge Info: `bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300`.

---

## 4. Công Cụ & Đo Lường Độ Tương Phản

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Google Chrome DevTools**: Nhấp chuột phải vào phần tử -> Inspect -> Di chuột vào thuộc tính `color` trong tab Styles để xem chỉ số Contrast Ratio và biểu tượng tick xanh WCAG AA / AAA.
