# Lộ Trình Đánh Giá & Nâng Cấp LexiNote Client Frontend (`frontend/`)

Tài liệu này tổng hợp phân tích chi tiết cấu trúc, đánh giá trạng thái hiện tại và lộ trình ưu tiên nâng cấp giao diện/tính năng cho ứng dụng người dùng cuối **LexiNote Client App** (thư mục `frontend/`).

---

## 📐 1. Tổng Quan Kiến Trúc `frontend/`

- **Công nghệ cốt lõi**: React 19, TypeScript, Vite, Redux Toolkit (RTK Query), React Router v7, Framer Motion, i18next, Lucide React.
- **Phong cách thiết kế (Design Aesthetic)**: Pastel mượt mà, Gamified học tập (biểu tượng 🐰, 🥕, ✨, thẻ nổi, hiệu ứng vui nhộn).
- **Trạng thái API Client**: Đã kết nối NestJS Backend `/api/v1/client` qua `apiSlice.ts` (hỗ trợ tự động Refresh Token 401, đa ngôn ngữ `Accept-Language`, xử lý lỗi mạng toàn cục).

---

## 🔍 2. Phân Tích & Đánh Giá Theo Từng Thư Mục

| Thư mục | Trạng thái hiện tại | Đánh giá & Vấn đề tồn tại | Mức độ ưu tiên |
| :--- | :--- | :--- | :---: |
| **`src/views/StudyMode.tsx`** | 🟡 Cơ bản | **Tính năng lõi (SRS Core)**: Đã có logic ôn tập (Easy, Good, Hard, Again) nhưng giao diện thẻ phẳng, chưa có hiệu ứng lật 3D hoành tráng và thiếu âm thanh phát âm trực tiếp (Text-to-Speech). | 🔴 **ƯU TIÊN 1** |
| **`src/views/games/`** | 🟡 Thiếu đa dạng | Hiện chỉ có 1 trò chơi Nối từ (`MatchGame.tsx`). Thiếu hiệu ứng chiến thắng (Confetti/âm thanh) và chưa có minigame trắc nghiệm hoặc xếp chữ. | 🟠 **ƯU TIÊN 2** |
| **`src/views/Library.tsx`** | 🟢 Đã ổn định | Đã có tìm kiếm, phân loại từ (`noun`, `verb`,...). Cần bổ sung lọc theo cấp độ thuộc từ SRS (*Chưa học / Đang học / Đã thuộc*) và nút loa phát âm nhanh. | 🟡 **ƯU TIÊN 3** |
| **`src/views/stats/`** | 🟢 Đã tốt | Đã có biểu đồ học tập, Streak ngày. Nên bổ sung hệ thống Huy hiệu Thành tựu (Badges & Achievements) để tăng động lực học tập. | 🟢 **ƯU TIÊN 4** |
| **`src/views/auth/`** | 🟢 Hoàn chỉnh | Đầy đủ Login, Register, Forgot Password, Verify Email kết nối API mượt mà. | 🟢 **ƯU TIÊN 5** |

---

## 🎯 3. Chi Tiết Kế Hoạch Nâng Cấp Theo Giai Đoạn

### 🔴 Giai đoạn 1: Đột phá Trải nghiệm Ôn tập SRS (`StudyMode.tsx`)
- [x] **Thẻ Flashcard 3D (3D Card Flip Animation)**:
  - Cập nhật CSS 3D perspective & 180deg flip transform mượt mà.
- [x] **Tích hợp Audio Text-to-Speech (TTS)**:
  - Tích hợp Web Speech API tự động phát âm tiếng Anh chuẩn khi mở thẻ mới hoặc khi bấm nút Loa.
- [x] **Nút Bật/Tắt Tự động Phát âm (Auto-Pronounce Toggle)** & **Loa thủ công trên Thẻ từ**.

### 🟠 Giai đoạn 2: Gamification & Mở rộng Minigames (`src/views/games/`)
- [x] **Hiệu ứng Pháo hoa Confetti khi Chiến Thắng**:
  - Xây dựng component `<Confetti />` chúc mừng rực rỡ khi hoàn thành minigame ghép từ.
- [x] **Phát âm Từ Tiếng Anh khi Ghép Đúng trong Game MatchGame**.

### 🟡 Giai đoạn 3: Nâng cấp Kho Từ Vựng Cá Nhân (`Library.tsx`)
- [x] **Icon Phát âm Nhanh trên Thẻ từ**:
  - Bổ sung nút Loa phát âm chuẩn trực tiếp trên từng thẻ từ vựng trong kho Library mà không cần vào chế độ học.

### 🟢 Giai đoạn 4: Hệ thống Thành tựu & Động lực Học tập (`stats/`)
- [ ] **Hệ thống Huy hiệu (Achievements & Badges)**:
  - Mở khóa các huy hiệu khi đạt mốc:
    - 🐰 *Tân thủ (Học 10 từ đầu tiên)*
    - 🔥 *Chăm chỉ (Streak 7 ngày liên tiếp)*
    - 🧠 *Trí nhớ siêu việt (Thuộc lòng 50 từ)*
- [ ] **Bảng xếp hạng cá nhân & Thống kê tuần**.

---

## 🛠️ 4. Kiểm Tra Tương Thích API Backend Client

Toàn bộ các tính năng nâng cấp trên đều tận dụng 100% các API hiện có ở phía Backend NestJS (`/api/v1/client/*`):
- `GET /api/v1/client/words` & `POST /api/v1/client/words`
- `GET /api/v1/client/review/due` & `POST /api/v1/client/review`
- `GET /api/v1/client/user/stats`

---

*Tài liệu này sẵn sàng để bạn review và chọn mốc triển khai.*
