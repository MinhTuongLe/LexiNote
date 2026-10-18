# Báo Cáo Kiểm Thử End-to-End & UI/UX Dashboard LexiNote

**Môi trường thử nghiệm:**
- **URL Dashboard:** `http://localhost:5174/`
- **Backend API:** `http://localhost:1337/api/v1`
- **Tài khoản kiểm thử:** `admin@gmail.com` (Role: ADMIN)
- **Thư mục minh chứng screenshot:** [`dashboard-e2e-evidence/`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence)
- **Công cụ kiểm thử:** Playwright MCP (Chromium), WCAG 2.1 AA Auditing scripts, Viewport responsiveness tests

---

## Danh Sách Lỗi & Vấn Đề Phát Hiện (Bugs & Defects)

| Mã Lỗi | Module / Màn Hình | Mức Độ | Mô Tả Tóm Tắt | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **DASH-BUG-01** | Overview / Analytics | Minor | Phân cụm từ vựng (Clusters) bị trùng lặp do không chuẩn hóa định dạng từ loại (`adj` và `adjective`) | ✅ **Đã Fix & Verify** |
| **DASH-BUG-02** | User Management | **Major** | Lỗi toán học tính `Ease Factor`: Cộng dồn toàn bộ từ nhưng chỉ chia cho số từ đã ôn tập, ra kết quả phi lý 17.59 | ✅ **Đã Fix & Verify** |
| **DASH-BUG-03** | User Management | Minor | `EmailPreviewModal` thiếu phím tắt Escape, không thể bấm backdrop để đóng và nút đóng thiếu `aria-label` | ✅ **Đã Fix & Verify** |
| **DASH-BUG-04** | User Management | **Major** | Xuất CSV người dùng thất bại với lỗi HTTP 400 do DTO cấm tham số `search` (`property search should not exist`) | ✅ **Đã Fix & Verify** |
| **DASH-BUG-05** | Word Library | **Major** | Xuất CSV từ vựng theo người dùng (`?ownerId=...`) bị lỗi HTTP 400 do DTO thiếu trường `ownerId` | ✅ **Đã Fix & Verify** |
| **DASH-BUG-06** | Trash & Recovery | **Major** | Bản ghi lưu trữ (Archive) bị gán `createdAt: NULL`, khiến cột "Deleted Timestamp" luôn hiển thị `N/A` | ✅ **Đã Fix & Verify** |
| **DASH-BUG-07** | Overview / Recharts | Minor | Cảnh báo console Recharts `width(-1) and height(-1)` do thiếu `min-w-0` ở flex container | ✅ **Đã Fix & Verify** |
| **DASH-BUG-08** | Users & Word Library | Minor / A11y | Các nút thao tác icon (Inspect, Edit, Reset, Ban, Delete) thiếu `aria-label` theo tiêu chuẩn WCAG 2.1 AA | ✅ **Đã Fix & Verify** |
| **DASH-BUG-09** | AdminLayout (Header) | Minor / UX | Affordance phím tắt toàn cục `⌘K` / `Ctrl+K` không focus vào ô tìm kiếm nhanh do thiếu listener | ✅ **Đã Fix & Verify** |
| **DASH-BUG-10** | PageHeader / Multi-page | Minor / Layout | Cụm nút hành động (`action`) bị tràn ngang màn hình di động (< 480px) do thiếu `flex-wrap` | ✅ **Đã Fix & Verify** |
| **DASH-BUG-11** | Config & Settings | Minor / A11y | Các nút công tắc tùy chọn (Switch toggles) thiếu `role="switch"`, `aria-checked`, `aria-label` | ✅ **Đã Fix & Verify** |
| **DASH-BUG-12** | Layout & Overview | Trivial | Bất đồng nhất ngôn ngữ: Drawer di động để "Đăng xuất" vs desktop "Sign out", và chuỗi toast tiếng Việt còn sót | ✅ **Đã Fix & Verify** |
| **DASH-BUG-13** | Deck Management | Minor / UX | Form tạo deck thiếu nhãn trợ năng và bảng decks thiếu trạng thái rỗng (Empty State) | ✅ **Đã Fix & Verify** |

---

## Chi Tiết Kỹ Thuật Từng Lỗi & Kết Quả Xác Minh (Verification Details)

### 1. DASH-BUG-01: Phân cụm từ vựng (Clusters) bị trùng lặp do thiếu chuẩn hóa
- **Tệp nguồn:** [`backend/src/dashboard/analytics/cluster.utils.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/analytics/cluster.utils.ts) & [`backend/src/dashboard/words/words.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/words/words.service.ts)
- **Hiện tượng:** Tại Overview Modal ("View Clusters") và bộ lọc Word Library, `adj` và `adjective` hiển thị thành 2 nhóm riêng biệt (`adj: 30`, `adjective: 1`), làm phân mảnh thống kê ngôn ngữ học.
- **Giải pháp áp dụng:** Thêm hàm `normalizeWordType` chuyển hóa mọi định dạng viết tắt (`adj` -> `adjective`, `adv` -> `adverb`, `v` -> `verb`, `n` -> `noun`) trong `cluster.utils.ts` và `words.service.ts`.
- **Kết quả Playwright MCP:** Đã mở modal View Clusters, nhóm `Adjective` được gộp chuẩn xác thành 31 mục duy nhất, tổng 247 từ chia đều cho 8 cụm chuẩn.

---

### 2. DASH-BUG-02: Sai lệch toán học tính trung bình Ease Factor trong User Details
- **Tệp nguồn:** [`backend/src/dashboard/management/management.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/management/management.service.ts)
- **Minh chứng trước fix:** [`dash-bug-02-ease-factor-math-error.png`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence/dash-bug-02-ease-factor-math-error.png) (Hiển thị 17.59)
- **Minh chứng sau fix:** [`dash-bug-02-ease-factor-fixed.png`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence/dash-bug-02-ease-factor-fixed.png) (Hiển thị chuẩn xác 2.51)
- **Hiện tượng:** Khi mở User Account & SRS Inspector của user #15, chỉ số Ease Factor hiển thị là **17.59**, trong khi thang đo thuật toán SRS SM-2 chuẩn chỉ dao động từ 1.3 đến ~3.0.
- **Nguyên nhân:** `totalEase += r.easeFactor` cộng dồn toàn bộ 246 từ (kể cả từ chưa ôn tập có default 2.5) nhưng lại đem chia cho chỉ 35 từ đã được ôn tập.
- **Giải pháp áp dụng:** Chuyển `totalEase += r.easeFactor` vào bên trong điều kiện `if (r.correctCount + r.wrongCount > 0)`.
- **Kết quả Playwright MCP:** User Details modal hiển thị Ease Factor chính xác là `2.51` tương ứng với tiến độ SM-2 thực tế của người học.

---

### 3. DASH-BUG-03: EmailPreviewModal thiếu phím tắt Escape và đóng Backdrop
- **Tệp nguồn:** [`dashboard/src/components/common/EmailPreviewModal.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/components/common/EmailPreviewModal.tsx)
- **Minh chứng:** [`email-preview-center.png`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence/email-preview-center.png)
- **Hiện tượng:** Người dùng không thể bấm phím `Escape` hoặc bấm vào nền mờ (backdrop) để thoát modal xem trước email. Nút `X` cũng thiếu thuộc tính `aria-label`.
- **Giải pháp áp dụng:** Thêm `useEffect` bắt phím `Escape`, đặt `z-[9999]`, thêm `onClick={onClose}` cho backdrop overlay và gán `aria-label="Close Email Preview"`.
- **Kết quả Playwright MCP:** Đã test cả 2 luồng (phím Escape và click backdrop), modal đóng ngay lập tức và mượt mà.

---

### 4. DASH-BUG-04: Xuất CSV người dùng thất bại với lỗi HTTP 400
- **Tệp nguồn:** [`backend/src/dashboard/management/dto/export-users-query.dto.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/management/dto/export-users-query.dto.ts) & [`backend/src/dashboard/management/management.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/management/management.service.ts)
- **Hiện tượng:** Bấm "Export CSV" tại User Management không tải được tệp và console báo lỗi: `400 Bad Request: ["property search should not exist"]`.
- **Giải pháp áp dụng:** Bổ sung `@IsOptional() @IsString() search?: string;` vào `ExportUsersQueryDto`, đồng thời thêm `where.OR` tìm kiếm `fullName` và `email` trong `management.service.ts#exportUsers`.
- **Kết quả Playwright MCP:** Bấm "Export CSV" tải về tệp thành công và toast thông báo: *"CSV Exported: Downloaded all users matching the current filters."*

---

### 5. DASH-BUG-05: Xuất CSV từ vựng theo người dùng bị lỗi HTTP 400
- **Tệp nguồn:** [`backend/src/dashboard/words/dto/export-words-query.dto.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/words/dto/export-words-query.dto.ts) & [`backend/src/dashboard/words/words.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/words/words.service.ts)
- **Hiện tượng:** Khi admin lọc theo từ vựng của 1 user cụ thể (từ User Details -> Open in Word Library) rồi bấm "Export Library", yêu cầu bị trả về `400 Bad Request: ["property ownerId should not exist"]`.
- **Giải pháp áp dụng:** Bổ sung `@IsOptional() @Transform(...) @IsInt() ownerId?: number;` vào `ExportWordsQueryDto` và xử lý lọc `where.ownerId = ownerId` trong `words.service.ts#exportWords`.
- **Kết quả Playwright MCP:** Lọc theo user #15 và bấm Export Library thành công, toast hiển thị: *"Export Successful: Downloaded the filtered word library CSV."*

---

### 6. DASH-BUG-06: Bản ghi Archive bị gán `createdAt: NULL`, cột thời gian xóa luôn là `N/A`
- **Tệp nguồn:** [`backend/src/dashboard/words/words.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/words/words.service.ts) & [`backend/src/dashboard/management/management.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/dashboard/management/management.service.ts)
- **Hiện tượng:** Tại màn hình Trash & Recovery (`/dashboard/trash`), mọi bản ghi đã xóa đều có "Deleted Timestamp" là `N/A`.
- **Giải pháp áp dụng:** Truyền `createdAt: BigInt(Date.now())` khi gọi `prisma.archive.create` trong cả hai hàm `deleteUser` và `deleteWord`.
- **Kết quả Playwright MCP:** Đã test xóa 1 từ vựng `e2e_trash_test_entry`, bảng Trash hiển thị chính xác thời gian: `Oct 18, 2026, 11:45 PM`. Sau đó đã thực hiện purge dọn sạch database trash.

---

### 7. DASH-BUG-07: Cảnh báo Recharts `width(-1) and height(-1)` trên Overview
- **Tệp nguồn:** [`dashboard/src/pages/OverviewPage/OverviewPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/OverviewPage/OverviewPage.tsx)
- **Hiện tượng:** Console xuất hiện cảnh báo `The width(-1) and height(-1) of chart should be greater than 0...` do `ResponsiveContainer` mount bên trong flex container.
- **Giải pháp áp dụng:** Bổ sung `min-w-0` vào Card và div container của biểu đồ, đồng thời khai báo `minWidth={0} minHeight={320}` trên `ResponsiveContainer`.
- **Kết quả Playwright MCP:** Biểu đồ hiển thị ổn định, không còn warning tính toán kích thước trong console.

---

### 8. DASH-BUG-08: Nút hành động dạng Icon thiếu thuộc tính tiếp cận (Accessible Name)
- **Tệp nguồn:** [`dashboard/src/pages/UserManagementPage/UserManagementPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/UserManagementPage/UserManagementPage.tsx), [`dashboard/src/pages/WordLibraryPage/WordLibraryPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/WordLibraryPage/WordLibraryPage.tsx), [`dashboard/src/layout/AdminLayout.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/layout/AdminLayout.tsx), [`dashboard/src/pages/ProfilePage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/ProfilePage.tsx)
- **Hiện tượng:** Các nút icon trong bảng (Inspect, Reset Password, Edit, Ban, Delete) và các icon trên header chỉ chứa SVG, vi phạm tiêu chuẩn WCAG 2.1 AA. Các nhãn trong Profile editor bị dính chuỗi (`FULL NAMEEMAIL`).
- **Giải pháp áp dụng:** Bổ sung `aria-label` có ý nghĩa cho 100% các nút icon; thêm class `block` cho nhãn form trong `ProfilePage.tsx`.
- **Kết quả Playwright MCP:** Chạy script kiểm toán WCAG: `totalInteractiveIssues: 0`. Toàn bộ các nút đạt 100% chuẩn tên trợ năng.

---

### 9. DASH-BUG-09: Phím tắt toàn cục `⌘K` / `Ctrl+K` không kích hoạt ô tìm kiếm
- **Tệp nguồn:** [`dashboard/src/layout/AdminLayout.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/layout/AdminLayout.tsx)
- **Minh chứng:** [`dash-ctrl-k-focused.png`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence/dash-ctrl-k-focused.png)
- **Hiện tượng:** Khung tìm kiếm nhanh có nhãn `<kbd>⌘K</kbd>`, nhưng khi người dùng bấm phím tắt `Ctrl+K` hoặc `Cmd+K` thì không có phản hồi nào và con trỏ không focus vào input.
- **Giải pháp áp dụng:** Khởi tạo `searchInputRef` và đăng ký global `window.addEventListener('keydown', ...)` bắt tổ hợp phím `(metaKey || ctrlKey) && key === 'k'` để `preventDefault()` và gọi `focus()`.
- **Kết quả Playwright MCP:** Nhấn `Control+k` kích hoạt focus tức thì vào ô Quick Search, `document.activeElement.isFocused = true`.

---

### 10. DASH-BUG-10: Cụm nút hành động (`PageHeader`) bị tràn ngang màn hình di động (< 480px)
- **Tệp nguồn:** [`dashboard/src/components/common/PageHeader.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/components/common/PageHeader.tsx)
- **Minh chứng:** [`dash-mobile-wrapped-header.png`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard-e2e-evidence/dash-mobile-wrapped-header.png)
- **Hiện tượng:** Tại màn hình di động 360px-375px, vùng `action` trong `PageHeader` không có `flex-wrap`, khiến thanh nút (Export Summary, View Clusters, System Scan) bị tràn ra ngoài lề phải màn hình tới 113px (`right: 472px` trên màn hình 360px).
- **Giải pháp áp dụng:** Bổ sung `flex-wrap` vào container nút trong `PageHeader.tsx`: `<div className="flex items-center gap-2.5 flex-wrap">`.
- **Kết quả Playwright MCP:** Cả 3 nút tự động xuống hàng mềm mại, 100% các nút nằm gọn trong giới hạn màn hình `right <= clientWidth`.

---

### 11. DASH-BUG-11: Các nút công tắc tùy chọn (Switch toggles) thiếu chuẩn Accessibility WCAG 2.1 AA
- **Tệp nguồn:** [`dashboard/src/pages/SystemConfigPage/SystemConfigPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/SystemConfigPage/SystemConfigPage.tsx) & [`dashboard/src/pages/SettingsPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/SettingsPage.tsx)
- **Hiện tượng:** Các nút gạt bật/tắt (Whitelisted CORS Enforcement, Automated Daily Backup, Debug Verbosity, High Density Layout, Real-time Live Sync, GPU Acceleration) chỉ là các thẻ `<button>` rỗng chứa thẻ con `<div>`, không có tên trợ năng và không biểu thị trạng thái đóng/mở cho trình đọc màn hình.
- **Giải pháp áp dụng:** Bổ sung `type="button"`, `role="switch"`, `aria-checked={booleanState}`, và `aria-label="Toggle ..."` cho tất cả các switch toggles.
- **Kết quả Playwright MCP:** Kiểm tra thuộc tính qua DOM trả về đầy đủ `role="switch"`, `aria-checked="true/false"`, `aria-label` cho toàn bộ 6 công tắc cấu hình.

---

### 12. DASH-BUG-12: Không đồng nhất ngôn ngữ trong giao diện Dashboard
- **Tệp nguồn:** [`dashboard/src/layout/AdminLayout.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/layout/AdminLayout.tsx) & [`dashboard/src/pages/OverviewPage/OverviewPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/OverviewPage/OverviewPage.tsx)
- **Hiện tượng:** Mobile drawer hiển thị nút "Đăng xuất" (tiếng Việt) trong khi Desktop sidebar hiển thị "Sign out" (tiếng Anh); một toast thông báo lỗi reset từ vựng trên Overview còn sót chuỗi tiếng Việt trong khi toàn bộ ứng dụng là tiếng Anh.
- **Giải pháp áp dụng:** Đồng bộ nhãn "Sign out" cho cả mobile và desktop; chuyển chuỗi toast lỗi reset SRS sang tiếng Anh chuẩn (`Could not reset learning progress for "${word}".`).
- **Kết quả Playwright MCP:** Kiểm tra văn bản giao diện đạt độ nhất quán 100%.

---

### 13. DASH-BUG-13: Form Deck Management thiếu Accessible Names & Bảng Decks thiếu Empty State
- **Tệp nguồn:** [`dashboard/src/pages/DeckManagementPage/DeckManagementPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/dashboard/src/pages/DeckManagementPage/DeckManagementPage.tsx)
- **Hiện tượng:** Các ô Input trong form tạo Deck mới chỉ có `placeholder` mà không có `aria-label`; khi danh sách deck rỗng (`data.length === 0`), giao diện trống trơn không có hướng dẫn tạo deck.
- **Giải pháp áp dụng:** Bổ sung `aria-label` cho toàn bộ các ô Input & Textarea trong form; bổ sung Card Empty State có icon, tiêu đề và nút CTA "Create First Deck".
- **Kết quả Playwright MCP:** Toàn bộ inputs trong modal đều có `aria-label`, kiểm tra WCAG accessible names đạt `issuesCount: 0`.

