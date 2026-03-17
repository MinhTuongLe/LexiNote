# Thiết kế hệ thống: Webapp Học Từ Vựng Tiếng Anh

## 1. Tổng quan hệ thống
Webapp học từ vựng tiếng Anh bao gồm 3 module chính:
- **Vocabulary Management** (Quản lý từ vựng)
- **Learning & Review** (Học + ôn tập)
- **Analytics & Progress** (Theo dõi tiến độ)

---

## 2. Vocabulary Management

### 2.1. Tạo & quản lý từ vựng (Manual Note)
Người dùng có thể tạo từ mới với các trường dữ liệu (fields):
- `word`: Từ tiếng Anh
- `meaning_en`: Giải thích tiếng Anh
- `meaning_vi`: Nghĩa tiếng Việt
- `example`: Câu ví dụ
- `type`: Loại từ (noun, verb, adj…)
- `pronunciation`: Phát âm (IPA hoặc text)
- `audio_url`: Link âm thanh phát âm (optional)
- `synonyms`: Danh sách từ đồng nghĩa
- `antonyms`: Danh sách từ trái nghĩa
- `created_at`: Thời gian tạo

👉 **Behavior:** Hỗ trợ đầy đủ các thao tác CRUD (Create / Edit / Delete / View).

### 2.2. Import từ vựng
**Nguồn input:**
- Từ manual note (nhập thủ công)
- Upload file: `.csv`, `.xlsx` (Excel)
- Google Sheets (via link hoặc paste)

**Format chuẩn:**
`word | meaning_en | meaning_vi | example | type`

👉 **Behavior:**
- Validate format trước khi import
- Preview (xem trước) dữ liệu trước khi import
- Detect duplicate (Phát hiện trùng lặp): Có thể tùy chọn skip (bỏ qua) hoặc overwrite (ghi đè).

### 2.3. Search & Filter
**Search:**
- Tìm kiếm theo `word`
- Tìm kiếm theo `meaning`

**Filter:**
- Theo loại từ (`type`)
- Theo trạng thái học: chưa học, đang học, đã thuộc
- Theo độ khó (dựa trên thuật toán Spaced Repetition System - SRS)

---

## 3. Learning & Review

### 3.1. Spaced Repetition System (SRS)
Mỗi từ sẽ có các trạng thái (state) riêng:
- `last_reviewed`: Lần ôn tập cuối
- `next_review`: Thời điểm ôn tập tiếp theo
- `ease_factor`: Hệ số dễ
- `interval`: Khoảng thời gian lặp lại
- `correct_count`: Số lần trả lời đúng
- `wrong_count`: Số lần trả lời sai

👉 **Logic:** Trả lời đúng → tăng `interval`. Trả lời sai → reset / giảm `interval`.

### 3.2. Flashcard Mode
**Hiển thị:**
- **Front:** `word`
- **Back:** `meaning_en`, `meaning_vi`, `example`, `pronunciation`

**User action:**
- Flip card (lật thẻ)
- Mark level: Easy, Medium, Hard
👉 Đưa dữ liệu đánh giá feed vào thuật toán SRS.

### 3.3. Quiz Modes
1. **Multiple Choice:** Hiển thị `word` → chọn nghĩa đúng.
2. **Listening:** Play audio → chọn `word` hoặc nghĩa đúng.
3. **Typing:** Hiển thị nghĩa → user gõ từ. Có thể check chính tả hoặc cho phép typo nhẹ (optional).
4. **Matching:** Nối English ↔ Vietnamese.

---

## 4. Tracking & Analytics

### 4.1. Dashboard
Hiển thị các thông số tổng quan:
- Tổng số từ
- Số từ đã học
- Số từ cần ôn hôm nay
- Accuracy (% đúng)

### 4.2. Progress Tracking
- Số từ học mỗi ngày
- Streak (chuỗi ngày học liên tiếp)
- Biểu đồ tiến độ

### 4.3. Weak Words
Danh sách các từ:
- Sai nhiều
- `ease_factor` thấp
👉 **Hành động:** Cho phép tạo session review riêng cho nhóm từ này.

---

## 5. Data Model (Gợi ý)

### `Word`
- `id` (PK)
- `word`
- `meaning_en`
- `meaning_vi`
- `example`
- `type`
- `pronunciation`
- `audio_url`
- `created_at`

### `WordRelation`
- `id` (PK)
- `word_id` (FK)
- `type` (Enum: synonym | antonym)
- `value`

### `Review` (SRS)
- `id` (PK)
- `word_id` (FK)
- `last_reviewed`
- `next_review`
- `interval`
- `ease_factor`
- `correct_count`
- `wrong_count`

---

## 6. Luồng chính (User Flow)
- **Flow 1: Thêm từ:** User nhập từ → save DB.
- **Flow 2: Import:** Upload file → preview → confirm → save.
- **Flow 3: Học hàng ngày:**
  1. Lấy list due words (`next_review <= now`).
  2. Chọn mode: Flashcard / Quiz.
  3. Trả lời → update lại SRS.
- **Flow 4: Xem tiến độ:** Dashboard xem stats → Xem weak words → Ôn tập lại.

---

## 7. Lộ trình phát triển (Roadmap)

### ✅ Phase 1: MVP (Minimum Viable Product - Ưu tiên build trước)
- CRUD từ vựng
- Import file CSV
- Flashcard mode
- Multiple choice mode
- SRS logic cơ bản
- Dashboard thống kê đơn giản

### 🔥 Phase 2: Advanced Features
- Listening mode
- Typing mode
- Google Sheets data import
- Integrate Audio cho từ vựng
- Advanced analytics (Biểu đồ, phân tích chi tiết)
