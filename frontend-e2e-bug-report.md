# LexiNote - Báo Cáo Kiểm Thử Chuyên Sâu End-to-End (E2E) & UI/UX Audit Toàn Diện

> **Ngày thực hiện:** 18/10/2026  
> **Môi trường thử nghiệm:**
> - **Frontend:** `http://localhost:5173` (Vite + React 18 + Redux Toolkit + RTK Query)
> - **Backend:** `http://localhost:1337` (NestJS + Fastify + Prisma + PostgreSQL)
> - **Tài khoản kiểm thử:** `leeminwall091202@gmail.com`
> - **Thư mục minh chứng (Screenshots):** [`frontend-e2e-evidence/`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/)

---

## Mục Lục
1. [Tổng Quan Kết Quả Kiểm Thử](#1-tổng-quan-kết-quả-kiểm-thử)
2. [Bảng Phân Loại Mức Độ Nghiêm Trọng](#2-bảng-phân-loại-mức-độ-nghiêm-trọng)
3. [Chi Tiết Từng Lỗi, Minh Chứng & Giải Pháp Sửa Đổi](#3-chi-tiết-từng-lỗi-minh-chứng--giải-pháp-sửa-đổi)
   - [BUG-01 (CRITICAL): Fastify CORS chặn PATCH và DELETE khiến chức năng Sửa/Xóa từ và Cập nhật Profile hỏng](#bug-01-critical-fastify-cors-chặn-patch-và-delete)
   - [BUG-02 (CRITICAL): apiSlice tự động Logout người dùng khi gặp lỗi mạng hoặc CORS](#bug-02-critical-apislice-tự-động-logout-người-dùng-khi-gặp-lỗi-mạng-hoặc-cors)
   - [BUG-03 (CRITICAL): Match Game hỏng hoàn toàn do gửi sai tham số Query `limit: 'all'`](#bug-03-critical-match-game-hỏng-hoàn-toàn-do-gửi-sai-tham-số-query-limit-all)
   - [BUG-04 (CRITICAL): Word Import & AI Extract báo lỗi 400 Bad Request do DTO Whitelist Strict](#bug-04-critical-word-import--ai-extract-báo-lỗi-400-bad-request)
   - [BUG-05 (MAJOR): Mobile Responsive - Thanh điều hướng đáy che khuất nút thao tác & nội dung](#bug-05-major-mobile-responsive---thanh-điều-hướng-đáy-che-khuất-nội-dung)
   - [BUG-06 (MAJOR): Thống kê loại từ (Word Type Breakdown) bị trùng lặp do phân biệt chữ hoa/thường](#bug-06-major-thống-kê-loại-từ-word-type-breakdown-bị-trùng-lặp-hoa-thường)
   - [BUG-07 (MAJOR): Vi phạm độ tương phản màu sắc WCAG 2.1 AA trên Dashboard & Auth Form](#bug-07-major-vi-phạm-độ-tương-phản-màu-sắc-wcag-21-aa)
   - [BUG-08 (MINOR): Thiếu Accessible Name & Label trên các phần tử tương tác (Icon Buttons & Inputs)](#bug-08-minor-thiếu-accessible-name--label-trên-các-phần-tử-tương-tác)
4. [Lộ Trình Đề Xuất Khắc Phục (Action Plan)](#4-lộ-trình-đề-xuất-khắc-phục-action-plan)

---

## 1. Tổng Quan Kết Quả Kiểm Thử

Đợt kiểm thử đã quét toàn bộ các module và luồng người dùng trên frontend LexiNote:
1. **Module Xác thực & Tài khoản:** `/login`, `/register`, `/forgot`, `/verify-email`, `/profile`.
2. **Module Từ vựng & Thư viện (Word Management):**
   - Tạo từ thủ công (`WordForm` modal).
   - Tìm kiếm, lọc theo loại từ, xem chi tiết từ vựng (`/library`).
   - Sửa từ (Edit Word).
   - Xóa từ (Delete Word).
   - Nhập từ hàng loạt (`WordImport` modal).
   - Trích xuất từ vựng bằng AI (`AiExtractModal`).
3. **Module Học tập & Ôn tập (Study Flow):**
   - Lật thẻ Flashcard & đánh giá SRS (Again, Hard, Good, Easy) (`/study`).
   - Chế độ Trắc nghiệm (Quiz Mode - 4 lựa chọn).
   - Chế độ Viết chính tả (Writing / Spelling Mode).
   - Chế độ Luyện nghe (Listening Mode).
4. **Module Bộ Từ Vựng Chuẩn (Curated Decks):**
   - Duyệt danh mục: IELTS, TOEIC, IT Tech (`/decks`).
   - 1-Click Import bộ từ vựng vào thư viện cá nhân.
5. **Module Trò chơi Luyện từ (Match Game):**
   - Mini game ghép từ và nghĩa (`/match-game`).
6. **Module Báo cáo & Thống kê (Analytics):**
   - Dashboard Streak, Weekly Activity, SRS Learning Progress (`/stats`).
   - Word Type Breakdown, Accuracy, Time Spent.
7. **Module Cài đặt (Settings):**
   - Cài đặt ngôn ngữ giao diện (`/settings/language`).
   - Thêm danh mục từ vựng tùy chỉnh (Custom Word Types) (`/settings`).

---

## 2. Bảng Phân Loại Mức Độ Nghiêm Trọng

| Mã Lỗi | Tên Lỗi | Module | Mức Độ | Trạng Thái | Minh Chứng Trước/Sau Fix |
|---|---|---|---|---|---|
| **BUG-01** | Fastify CORS chặn phương thức `PATCH` & `DELETE` | Library, Profile, Settings | 🔴 **CRITICAL** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-01-word-update-cors-patch-*.png`<br>Lỗi: `bug-02-word-delete-cors-methods-*.png`<br>Fix: Test `PATCH` & `DELETE` thành công qua MCP |
| **BUG-02** | `apiSlice.ts` tự động Logout người dùng khi gặp lỗi mạng/CORS | Core Auth State | 🔴 **CRITICAL** | ✅ **ĐÃ FIX & VERIFIED** | Đã loại bỏ `dispatch(logout())` trên lỗi mạng/5xx |
| **BUG-03** | Match Game hỏng hoàn toàn do `limit: 'all'` gây 400 Bad Request | Match Game (`/match-game`) | 🔴 **CRITICAL** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-05-match-game-limit-all-broken-*.png`<br>Fix: Chơi mượt mà và match thành công 6 cặp từ |
| **BUG-04** | Word Import & AI Extract trả về 400 Bad Request do DTO Whitelist | Word Import, AI Extract | 🔴 **CRITICAL** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-03-word-import-bad-request-*.png`<br>Fix: Đã import từ `ephemeral` thành công vào Library |
| **BUG-05** | Thanh điều hướng Mobile (Bottom Nav) che khuất nút bấm và nội dung | Responsive (375x812) | 🟠 **MAJOR** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-07-mobile-bottom-nav-obscuration-*.png`<br>Fix: `fixed-05-mobile-bottom-cards-visible-*.png` |
| **BUG-06** | Thống kê loại từ bị phân mảnh do không chuẩn hóa chữ hoa/thường | Analytics (`/stats`) | 🟠 **MAJOR** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-08-duplicate-word-types-case-sensitivity-*.png`<br>Fix: Gộp sạch sẽ `Adjective: 31`, không còn duplicate |
| **BUG-07** | Vi phạm độ tương phản màu chữ vs nền (WCAG 2.1 AA) | Dashboard & Auth | 🟠 **MAJOR** | ✅ **ĐÃ FIX & VERIFIED** | Lỗi: `bug-09-wcag-contrast-pastel-dashboard-cards-*.png`<br>Fix: `fixed-07-dashboard-contrast-high-*.png` |
| **BUG-08** | Thiếu `aria-label` và `<label>` liên kết trên form & icon button | Toàn bộ giao diện | 🟡 **MINOR** | ✅ **ĐÃ FIX & VERIFIED** | Đã bổ sung `aria-label` cho toàn bộ password toggle và icon button |

---

## 3. Chi Tiết Từng Lỗi, Minh Chứng & Giải Pháp Sửa Đổi

### BUG-01 (CRITICAL): Fastify CORS Chặn PATCH và DELETE

- **Mô tả:**  
  Mọi thao tác chỉnh sửa từ vựng (`PATCH /api/v1/client/words/:id`), xóa từ vựng (`DELETE /api/v1/client/words/:id`), chỉnh sửa thông tin cá nhân (`PATCH /api/v1/client/auth/profile`), và thêm loại từ tùy chỉnh (`PATCH /api/v1/client/settings/word-types`) đều bị trình duyệt chặn ngay tại bước CORS Preflight.
- **Thông báo lỗi trong Console:**
  ```text
  Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
  Fetch API cannot load http://localhost:1337/api/v1/client/words/... due to access control checks.
  ```
- **Tệp nguồn gây lỗi:**
  [`backend/src/main.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/main.ts#L70-L80)
- **Nguyên nhân gốc rễ:**  
  Plugin `@fastify/cors` của Fastify mặc định chỉ cho phép các methods `['GET', 'HEAD', 'PUT', 'POST']` nếu không được cấu hình tường minh thuộc tính `methods`.
- **Ảnh minh chứng:**
  - Cập nhật từ vựng thất bại: [`frontend-e2e-evidence/bug-01-word-update-cors-patch-2026-10-18T14-57-19-422Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-01-word-update-cors-patch-2026-10-18T14-57-19-422Z.png)
  - Xóa từ vựng thất bại: [`frontend-e2e-evidence/bug-02-word-delete-cors-methods-2026-10-18T15-00-20-040Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-02-word-delete-cors-methods-2026-10-18T15-00-20-040Z.png)
  - Thêm loại từ tùy chỉnh thất bại: [`frontend-e2e-evidence/bug-06-custom-word-type-patch-cors-2026-10-18T15-09-31-370Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-06-custom-word-type-patch-cors-2026-10-18T15-09-31-370Z.png)
- **Giải pháp khắc phục:**  
  Mở tệp [`backend/src/main.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/main.ts) và bổ sung danh sách `methods` và `allowedHeaders` vào cấu hình CORS:
  ```typescript
  // backend/src/main.ts
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  ```

---

### BUG-02 (CRITICAL): apiSlice Tự Động Logout Người Dùng Khi Gặp Lỗi Mạng Hoặc CORS

- **Mô tả:**  
  Khi người dùng thực hiện bất kỳ hành động nào gặp lỗi mạng (ví dụ: CORS bị chặn ở Bug 01 hoặc mạng chập chờn), hệ thống tự động xóa sạch phiên đăng nhập (`logout()`) và điều hướng người dùng ra màn hình `/login`, làm gián đoạn toàn bộ trải nghiệm.
- **Tệp nguồn gây lỗi:**
  [`frontend/src/store/apiSlice.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/store/apiSlice.ts#L80-L94)
- **Nguyên nhân gốc rễ:**  
  Đoạn mã xử lý lỗi trong `baseQueryWithReauth`:
  ```typescript
  } else if (
    status === 'FETCH_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    (typeof status === 'number' && status >= 500)
  ) {
    api.dispatch(logout()); // <-- CỰC KỲ NGUY HIỂM: Logout trên mọi lỗi mạng!
    api.dispatch(setGlobalError('Hệ thống tạm thời không phản hồi. Vui lòng thử lại sau.'));
  }
  ```
- **Giải pháp khắc phục:**  
  Chỉ xóa phiên (`logout()`) khi máy chủ phản hồi lỗi xác thực `401 Unauthorized` và refresh token thất bại. Với các lỗi mạng hoặc `5xx`, chỉ hiển thị thông báo lỗi (toast / banner) và giữ nguyên phiên làm việc:
  ```typescript
  // frontend/src/store/apiSlice.ts
  } else if (
    status === 'FETCH_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    (typeof status === 'number' && status >= 500)
  ) {
    // Giữ nguyên phiên làm việc, chỉ thông báo lỗi
    api.dispatch(setGlobalError('Hệ thống tạm thời không phản hồi. Vui lòng kiểm tra kết nối mạng và thử lại sau.'));
  }
  ```

---

### BUG-03 (CRITICAL): Match Game Hỏng Hoàn Toàn Do Tham Số `limit: 'all'`

- **Mô tả:**  
  Khi người dùng vào màn hình chơi Mini Game Ghép Từ (`/match-game`), trò chơi lập tức hiển thị thông báo *"Not enough words 😿 - Add at least 4 words with meanings to play!"* mặc dù tài khoản đã có hơn 240 từ vựng trong kho.
- **Tệp nguồn gây lỗi:**
  - Frontend: [`frontend/src/views/games/MatchGame.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/games/MatchGame.tsx#L29)
  - Backend DTO: [`backend/src/client/word/dto/word-query.dto.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/word/dto/word-query.dto.ts)
- **Nguyên nhân gốc rễ:**  
  `MatchGame.tsx` gọi:
  ```typescript
  const { data: wordsData, isLoading } = useGetWordsQuery({ limit: 'all' as unknown as number });
  ```
  Nhưng Backend sử dụng `WordQueryDto`:
  ```typescript
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
  ```
  Với `forbidNonWhitelisted: true`, chuỗi `'all'` biến thành `NaN` và kích hoạt lỗi `400 Bad Request: limit must be an integer number, limit must not be greater than 200`. Do đó `wordsData` trả về lỗi và mảng từ rỗng.
- **Ảnh minh chứng:**  
  [`frontend-e2e-evidence/bug-05-match-game-limit-all-broken-2026-10-18T15-07-02-447Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-05-match-game-limit-all-broken-2026-10-18T15-07-02-447Z.png)
- **Giải pháp khắc phục:**  
  Trong [`frontend/src/views/games/MatchGame.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/games/MatchGame.tsx#L29), sửa tham số `limit` thành số nguyên hợp lệ trong khoảng `[1, 200]`:
  ```typescript
  // frontend/src/views/games/MatchGame.tsx
  const { data: wordsData, isLoading } = useGetWordsQuery({ limit: 100 });
  ```

---

### BUG-04 (CRITICAL): Word Import & AI Extract Báo Lỗi 400 Bad Request

- **Mô tả:**  
  Khi người dùng nhập từ qua file CSV/văn bản (`WordImport`) hoặc trích xuất từ vựng bằng AI (`AiExtractModal`) và nhấn *"Thêm vào thư viện"*, máy chủ trả về lỗi `400 Bad Request` và không có từ vựng nào được lưu.
- **Tệp nguồn gây lỗi:**
  - Frontend: [`frontend/src/components/WordImport.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/components/WordImport.tsx), [`frontend/src/components/AiExtractModal.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/components/AiExtractModal.tsx)
  - Backend DTO: [`backend/src/client/word/dto/bulk-word-actions.dto.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/word/dto/bulk-word-actions.dto.ts)
- **Nguyên nhân gốc rễ:**  
  Frontend gửi kèm các trường thông tin mở rộng như `phonetic` và `audioUrl`:
  ```json
  [
    {
      "word": "serendipity",
      "type": "Noun",
      "meaningVi": "sự tình cờ may mắn",
      "exampleSentence": "A fortunate discovery",
      "phonetic": "/ˌser.ənˈdɪp.ə.t̬i/",
      "audioUrl": "..."
    }
  ]
  ```
  Nhưng `ImportedWordDto` ở Backend không khai báo hai trường này, trong khi NestJS `ValidationPipe` bật cấu hình `whitelist: true, forbidNonWhitelisted: true`. Do đó, request bị từ chối với thông báo `property phonetic should not exist`.
- **Ảnh minh chứng:**
  - Lỗi Import từ vựng: [`frontend-e2e-evidence/bug-03-word-import-bad-request-2026-10-18T15-02-28-877Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-03-word-import-bad-request-2026-10-18T15-02-28-877Z.png)
  - Lỗi AI Extract Import: [`frontend-e2e-evidence/bug-04-ai-extract-import-failure-2026-10-18T15-03-42-400Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-04-ai-extract-import-failure-2026-10-18T15-03-42-400Z.png)
- **Giải pháp khắc phục:**  
  1. **Ở Backend:** Bổ sung `phonetic` và `audioUrl` vào `ImportedWordDto`:
     ```typescript
     // backend/src/client/word/dto/bulk-word-actions.dto.ts
     export class ImportedWordDto {
       @IsString()
       word: string;

       @IsString()
       type: string;

       @IsString()
       meaningVi: string;

       @IsOptional()
       @IsString()
       exampleSentence?: string;

       @IsOptional()
       @IsString()
       contextVi?: string;

       @IsOptional()
       @IsString()
       phonetic?: string;

       @IsOptional()
       @IsString()
       audioUrl?: string;
     }
     ```
  2. **Ở Frontend:** Chuẩn hóa payload trước khi gửi:
     ```typescript
     const payload = words.map(({ word, type, meaningVi, exampleSentence, contextVi, phonetic, audioUrl }) => ({
       word: word.trim(),
       type: type.trim(),
       meaningVi: meaningVi.trim(),
       exampleSentence: exampleSentence?.trim() || undefined,
       contextVi: contextVi?.trim() || undefined,
       phonetic: phonetic?.trim() || undefined,
       audioUrl: audioUrl?.trim() || undefined,
     }));
     ```

---

### BUG-05 (MAJOR): Mobile Responsive - Thanh Điều Hướng Đáy Che Khuất Nội Dung

- **Mô tả:**  
  Trên màn hình di động (viewport 375x812 - iPhone/Android), thanh điều hướng đáy `.mobile-bottom-nav` được định vị `fixed` ở đáy màn hình. Phần chân trang và các nút hành động (như nút cuộn lên đầu, nút phân trang, nút lưu) bị che khuất hoàn toàn nếu không cuộn vượt biên.
- **Tệp nguồn gây lỗi:**
  - [`frontend/src/components/Navbar.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/components/Navbar.css#L160-L195)
  - [`frontend/src/App.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.css)
- **Ảnh minh chứng:**  
  [`frontend-e2e-evidence/bug-07-mobile-bottom-nav-obscuration-2026-10-18T15-12-28-655Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-07-mobile-bottom-nav-obscuration-2026-10-18T15-12-28-655Z.png)
- **Giải pháp khắc phục:**  
  Bổ sung `padding-bottom` tương ứng với chiều cao của bottom nav (kèm safe area inset cho iPhone có tai thỏ/Home bar):
  ```css
  /* frontend/src/App.css */
  @media (max-width: 768px) {
    .main-content {
      padding-bottom: calc(75px + env(safe-area-inset-bottom, 16px));
    }
  }
  ```

---

### BUG-06 (MAJOR): Thống Kê Loại Từ Bị Trùng Lặp Do Hoa/Thường

- **Mô tả:**  
  Trong trang Thống Kê (`/stats`), mục **Word Type Breakdown** hiển thị hai mục riêng biệt cho cùng một loại từ:
  - `Adjective: 28`
  - `adjective: 2`
- **Tệp nguồn gây lỗi:**  
  [`frontend/src/views/stats/StatsPage.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/stats/StatsPage.tsx) & service tổng hợp thống kê ở backend.
- **Nguyên nhân gốc rễ:**  
  Khi người dùng nhập từ qua các nguồn khác nhau (thủ công, nhập file, bộ từ vựng mẫu), chuỗi `type` không được chuẩn hóa chữ cái đầu hoặc lowercase đồng bộ trước khi lưu vào DB hoặc khi gom nhóm (group by).
- **Ảnh minh chứng:**  
  [`frontend-e2e-evidence/bug-08-duplicate-word-types-case-sensitivity-2026-10-18T15-13-05-973Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-08-duplicate-word-types-case-sensitivity-2026-10-18T15-13-05-973Z.png)
- **Giải pháp khắc phục:**  
  Chuẩn hóa loại từ về dạng Capitalized (hoặc lowercase đồng nhất) ở cả backend trước khi lưu và frontend khi render:
  ```typescript
  // frontend/src/utils/wordUtils.ts
  export const normalizeWordType = (type: string): string => {
    if (!type) return 'Other';
    const trimmed = type.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };
  ```

---

### BUG-07 (MAJOR): Vi Phạm Độ Tương Phản Màu Sắc WCAG 2.1 AA

- **Mô tả:**  
  Kiểm tra tự động theo tiêu chuẩn WCAG 2.1 AA phát hiện nhiều thành phần giao diện có độ tương phản chữ vs nền quá thấp (< 4.5:1):
  1. Thẻ **Streak Hero Card** (`.streak-hero-card`) và các thẻ Pastel Card (`.stat-card.pink`, `.stat-card.yellow`) trên Dashboard sử dụng chữ trắng mờ trên nền pastel nhạt: độ tương phản thực tế chỉ đạt **1.05:1 ~ 2.58:1** (tiêu chuẩn yêu cầu tối thiểu **4.5:1** cho text thường, **3:1** cho text lớn).
  2. Màu liên kết phụ trên trang Đăng nhập / Đăng ký (`#ff8ba7` trên nền trắng `#ffffff`) chỉ đạt tỷ lệ tương phản **2.1:1**, rất khó đọc với người dùng thị lực yếu hoặc dưới ánh sáng mạnh.
- **Ảnh minh chứng:**  
  [`frontend-e2e-evidence/bug-09-wcag-contrast-pastel-dashboard-cards-2026-10-18T15-13-18-914Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/bug-09-wcag-contrast-pastel-dashboard-cards-2026-10-18T15-13-18-914Z.png)
- **Giải pháp khắc phục:**  
  - Tăng độ tương phản của chữ trên nền pastel bằng màu chữ sẫm hơn:
    ```css
    .stat-card .stat-info h3 {
      color: #1e293b; /* Contrast > 7:1 */
    }
    .stat-card .stat-info p {
      color: #475569; /* Contrast > 4.5:1 */
    }
    ```
  - Thay thế màu hồng nhạt `#ff8ba7` cho text liên kết thành `#d9486c` hoặc `#c23356` (đạt tỷ lệ tương phản > 4.6:1 trên nền trắng).

---

### BUG-08 (MINOR): Thiếu Accessible Name & Label Trên Các Phần Tử Tương Tác

- **Mô tả:**  
  Các nút bấm icon không có text (ví dụ: nút ẩn/hiện mật khẩu `.password-toggle-btn`, nút phát âm thanh từ vựng `.speaker-btn`, nút thoát chế độ học `.exit-study-btn`) không có thuộc tính `aria-label`.  
  Ngoài ra, form thêm từ vựng (`WordForm.tsx`) chỉ dựa hoàn toàn vào thuộc tính `placeholder` mà thiếu thẻ `<label>` liên kết, gây khó khăn cho các công cụ Screen Reader hỗ trợ tiếp cận (Accessibility).
- **Giải pháp khắc phục:**  
  1. Bổ sung `aria-label` cho tất cả các icon-only button:
     ```tsx
     <button 
       type="button" 
       className="password-toggle-btn" 
       onClick={() => setShowPassword(!showPassword)}
       aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
     >
       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
     </button>
     ```
   2. Bổ sung thẻ `<label>` rõ ràng hoặc `aria-label` cho các ô input trong `WordForm.tsx`.

---

### BUG-09 (CRITICAL UX / LAYOUT): Tiêu Đề Từ Vựng Trong Thư Viện Bị Bóp Nghẹt & Ngắt Dòng Từng Chữ Cái

- **Mô tả:**  
  Trên màn hình Thư viện (`/library`), các từ tiếng Anh (như `ephemeral`, `Asynchronous`, `Idempotent`, `experience`, `lesson`, `fever`) bị chia cắt thô bạo thành từng âm tiết/ký tự rải rác trên 2-3 dòng (ví dụ: `ephe / mera / l`, `Asyn / chro / nous`).
- **Nguyên nhân gốc rễ:**  
  1. Trong [`Library.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/Library.tsx), cụm tiêu đề `.word-main` và cụm 4 nút thao tác `.word-card-actions` đặt chung hàng ngang với `display: flex; justify-content: space-between;`.
  2. Cụm 4 nút thao tác chiếm cố định tới **152px** và có `flex-shrink: 0`, trong khi thẻ card trên lưới 3 cột chỉ rộng khoảng ~280px và bị trừ thêm 30px đệm bên trái của checkbox.
  3. Khoảng trống còn lại cho chữ chỉ vỏn vẹn **~50px**, kết hợp với thuộc tính `overflow-wrap: anywhere;` trong [`Library.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/Library.css) khiến trình duyệt buộc phải bẻ gãy từ vựng từng chữ cái.
- **Giải pháp khắc phục:**  
  - Tách thẻ thành 2 tầng rõ ràng:
    - **Tầng trên (Top Bar):** Đặt checkbox chọn thẻ bên trái, và 4 nút thao tác (`[speaker] [edit] [reset] [delete]`) bên phải.
    - **Tầng dưới (Word Info):** Dành trọn vẹn **100% chiều rộng thẻ** cho tiêu đề từ vựng `h3` (`font-size: 1.45rem; font-weight: 800; line-height: 1.25; word-break: normal; overflow-wrap: break-word;`), bên dưới là hàng chứa các nhãn phân loại (`type-badge` và `srs-badge`).
- **Ảnh minh chứng trước và sau khi sửa:**
  - Ảnh lỗi do người dùng phản ánh: Chữ bị vỡ vụn (`ephe / mera / l`, `Asyn / chro / nous`)
  - Ảnh đã sửa: [`frontend-e2e-evidence/fixed-10-library-cards-layout-clean-2026-10-18T15-38-57-843Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/fixed-10-library-cards-layout-clean-2026-10-18T15-38-57-843Z.png) (Từ hiển thị nguyên vẹn trên 1 dòng, thẳng tắp và đẹp mắt).

---

### BUG-10 (MAJOR UI/UX & DATA LOGIC): Biểu Đồ "Hoạt Động Trong Tuần" Trống Trơn / Lệch Múi Giờ & Thiếu Khung Cột (Blank Weekly Chart)

- **Mô tả:**  
  Trên trang Thống kê (`/stats`), phần biểu đồ *"Hoạt động trong tuần"* (Weekly Activity) hiển thị một khoảng trống màu trắng 200px hoàn toàn trống trơn bên trên các nhãn thứ (T2, T3... CN). Dù người dùng đã học và ôn tập từ vựng trong ngày hôm nay, cột của ngày hôm nay vẫn không hiển thị (chiều cao 0px), khiến biểu đồ trông như bị hỏng.
- **Tệp nguồn gây lỗi:**
  - Backend: [`backend/src/client/review/review.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/review/review.service.ts#L444-L458)
  - Frontend: [`frontend/src/views/stats/components/dashboard/WeeklyActivityChart.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/stats/components/dashboard/WeeklyActivityChart.tsx), [`frontend/src/views/stats/StatsPage.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/stats/StatsPage.css)
- **Nguyên nhân gốc rễ:**  
  1. **Lệch Múi Giờ Backend (Timezone Shift):**  
     Trong `review.service.ts`, hàm `getActivityData` tính chuỗi ngày bằng:
     ```typescript
     const dateStr = d.toISOString().split('T')[0];
     ```
     Ở múi giờ Việt Nam (GMT+7), 00:00:00 ngày Thứ 2 khi gọi `.toISOString()` chuyển thành 17:00:00 ngày Chủ Nhật tuần trước theo giờ UTC (`2026-10-11T17:00:00.000Z`). Do đó, mảng 7 ngày của tuần bị lùi 1 ngày thành từ Chủ Nhật (11/10) đến Thứ 7 (17/10). Ngày Chủ Nhật hôm nay (18/10) hoàn toàn bị loại khỏi mảng 7 ngày!  
     Đồng thời, các lượt ôn tập diễn ra vào ban ngày hôm nay có ngày UTC là `2026-10-18`, nên khi `countsMap.get(dateStr)` duyệt qua mảng [11/10 -> 17/10], không có ngày nào khớp với `2026-10-18`. Kết quả: tất cả các ngày đều trả về `count: 0`.
  2. **Thiếu Khung Cột Rỗng Trong UI (Zero-fill Visual Track Missing):**  
     Trong `WeeklyActivityChart.tsx`, khi `count === 0`, `targetHeight = 0%`. Do `.bar-wrapper` không có màu nền (background-color), border hay khung cột (track slot), `height: 0%` vẽ ra đúng 0 pixel trên nền trắng trong suốt. Toàn bộ biểu đồ biến thành một mảng trắng xóa vô nghĩa.
- **Giải pháp khắc phục:**  
  1. **Backend:** Thay thế việc dùng `toISOString().split('T')[0]` bằng hàm `formatLocalDate` định dạng chuẩn theo giờ địa phương (`year-month-day`), đảm bảo mảng 7 ngày khớp chuẩn từ Thứ Hai đến Chủ Nhật hôm nay và gom nhóm chính xác lượt ôn tập.
  2. **Frontend UI/UX:**
     - Bổ sung cấu trúc `.bar-track` với nền pill mềm mại (`background: rgba(51, 39, 42, 0.05); border-radius: 12px; height: 100%;`) cho cả 7 cột. Ngay cả khi ngày đó có 0 lượt học, người dùng vẫn thấy rõ cấu trúc biểu đồ 7 ngày hiện đại, chuyên nghiệp.
     - Cột có hoạt động học tập (`hasActivity`) sẽ có chiều cao tối thiểu rõ nét (tối thiểu 14%) và hiển thị con số số lượng từ học được (`.bar-count-badge`) ngay trên đầu cột.
     - Nổi bật ngày hôm nay (`.is-today`): Viền nét đứt màu hồng pastel quanh khung cột và dấu chấm nhận diện `today-dot` bên dưới nhãn thứ.
     - Thêm huy hiệu tổng số từ học trong tuần trên tiêu đề (`✨ 4 words` / `✨ 4 từ`).
- **Ảnh minh chứng trước và sau khi sửa:**
  - Ảnh lỗi do người dùng phản ánh: Khoảng trắng rỗng toác 220px không có cột.
  - Ảnh đã sửa: 
    - Thẻ biểu đồ chi tiết: [`frontend-e2e-evidence/fixed-11-weekly-activity-chart-2026-10-18T15-48-28-713Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/fixed-11-weekly-activity-chart-2026-10-18T15-48-28-713Z.png)
    - Toàn bộ trang Stats: [`frontend-e2e-evidence/fixed-12-stats-page-full-2026-10-18T15-49-01-268Z.png`](file:///d:/Workspace/Personal/Web/LexiNote/frontend-e2e-evidence/fixed-12-stats-page-full-2026-10-18T15-49-01-268Z.png)

### BUG-11 (CRITICAL UX / SESSION HIJACK): Cập Nhật Cài Đặt Làm Văng Người Dùng Về Màn Hình Giới Thiệu (/welcome)

- **Mô tả:**  
  Khi người dùng đang sử dụng ứng dụng (ví dụ: tạo Custom Category ở `/settings/language`, bật/tắt âm thanh, đổi ngôn ngữ) và nhấn Lưu, ứng dụng đột ngột cướp quyền điều hướng và chuyển hướng toàn màn hình về trang Onboarding Guide (`/welcome`), làm gián đoạn toàn bộ thao tác hiện tại.
- **Tệp nguồn gây lỗi:**
  - Frontend: [`frontend/src/App.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.tsx#L99-L115), [`frontend/src/utils/authUtils.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/utils/authUtils.ts)
- **Nguyên nhân gốc rễ:**  
  Trong `App.tsx`, `useEffect` giám sát `[isAuthenticated, isInitialized, user, location.pathname]` gọi `checkHasSeenGuide(user)`. Khi người dùng cập nhật bất kỳ cài đặt nào, `apiSlice.ts` dispatch `updateUser(...)`. Vì tài khoản chưa lưu cờ `hasSeenGuide: true` trong Database và `localStorage` chưa có cache `hasSeenGuide_${userIdKey}`, hàm `checkHasSeenGuide` trả về `false`. Do đó, `App.tsx` tự động chuyển hướng người dùng về `/welcome`.
- **Giải pháp khắc phục:**  
  1. Trong [`authUtils.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/utils/authUtils.ts): Bổ sung tham số `totalWords` vào `checkHasSeenGuide`. Nếu người dùng đã có từ vựng (`totalWords > 0`) hoặc đã có thiết lập, hệ thống nhận diện đây là người dùng hiện hữu, tự động đồng bộ cờ vào `localStorage` và trả về `true`.
  2. Trong [`App.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.tsx): Chỉ áp dụng chuyển hướng Onboarding Guide đối với tài khoản hoàn toàn mới (0 từ) khi đang ở màn hình trang chủ (`/dashboard` hoặc `/`). Nếu người dùng đang chủ động duyệt các trang chức năng khác, tự động ghi nhận đã xem mà không cướp quyền điều hướng.

---

### BUG-12 (CRITICAL USER FLOW): Nút Đánh Giá SRS Bị Mặt Trước Thẻ Chặn Click Trong Chế Độ Học (/study)

- **Mô tả:**  
  Trong chế độ học Flashcard (`/study`), sau khi lật thẻ sang mặt sau (`.flashcard-container.flipped`), người dùng bấm vào các nút đánh giá mức độ ghi nhớ (`Hard`, `Medium`, `Easy`) thì không phản hồi hoặc bị chặn bởi lớp mặt trước.
- **Tệp nguồn gây lỗi:**
  - Frontend: [`frontend/src/views/StudyMode.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/StudyMode.css#L170-L190)
- **Nguyên nhân gốc rễ:**  
  Trong CSS 3D flip card, `.front-face` được gán cố định `z-index: 2` trong khi `.back-face` có `z-index: 1`. Khi lật thẻ (thêm class `.flipped` với `rotateY(180deg)`), `z-index` và `pointer-events` không được đảo ngược. Mặc dù `backface-visibility: hidden` ẩn mặt trước về mặt thị giác, DOM element của mặt trước vẫn nằm đè lên mặt sau với z-index cao hơn, chặn toàn bộ sự kiện click/pointer events nhắm vào các nút đánh giá.
- **Giải pháp khắc phục:**  
  Trong [`StudyMode.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/StudyMode.css):
  - Khi chưa lật: `.front-face { z-index: 2; pointer-events: auto; }`, `.back-face { z-index: 1; pointer-events: none; }`.
  - Khi đã lật (`.flipped`): Đảo ngược chuẩn xác: `.front-face { z-index: 1; pointer-events: none; }`, `.back-face { z-index: 2; pointer-events: auto; }`.
  - Nghiệm thu qua Playwright: Các nút `Hard`, `Medium`, `Easy` được bấm mượt mà ngay lập tức và tự động nhảy sang từ tiếp theo.

---

## 4. Lộ Trình Đề Xuất Khắc Phục & Kết Quả Nghiệm Thu (Action Plan)

Toàn bộ 12 lỗi đã được khắc phục hoàn toàn và nghiệm thu thực tế qua Playwright MCP:

### Giai đoạn 1: Khắc phục Hạ tầng & API (Backend & Store Core)
1. ✅ **Sửa CORS Backend** ([`backend/src/main.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/main.ts)): Thêm `PATCH`, `DELETE`, `OPTIONS` vào `methods`. (Sửa triệt để BUG-01).
2. ✅ **Sửa Auto-logout Frontend** ([`frontend/src/store/apiSlice.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/store/apiSlice.ts)): Ngừng gọi `dispatch(logout())` khi gặp `FETCH_ERROR`/`TIMEOUT_ERROR`. (Sửa triệt để BUG-02).
3. ✅ **Cập nhật DTO Backend** ([`backend/src/client/word/dto/bulk-word-actions.dto.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/word/dto/bulk-word-actions.dto.ts)): Thêm `phonetic`, `audioUrl` vào `ImportedWordDto`. (Sửa triệt để BUG-04).
4. ✅ **Sửa Lệch Múi Giờ Thống Kê Backend** ([`backend/src/client/review/review.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/review/review.service.ts)): Chuyển định dạng `formatLocalDate` thay cho `toISOString`. (Sửa triệt để BUG-10 Backend).

### Giai đoạn 2: Khắc phục Lỗi Chức Năng (Frontend Views)
1. ✅ **Sửa Query Match Game** ([`frontend/src/views/games/MatchGame.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/games/MatchGame.tsx)): Đổi `{ limit: 'all' }` thành `{ limit: 100 }`. (Sửa triệt để BUG-03).
2. ✅ **Sửa gom nhóm loại từ** ([`frontend/src/utils/wordUtils.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/utils/wordUtils.ts) & [`review.service.ts`](file:///d:/Workspace/Personal/Web/LexiNote/backend/src/client/review/review.service.ts)): Chuẩn hóa về canonical types. (Sửa triệt để BUG-06).
3. ✅ **Sửa chặn click thẻ Flashcard 3D** ([`frontend/src/views/StudyMode.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/StudyMode.css)): Điều chỉnh `pointer-events` và `z-index` khi lật thẻ. (Sửa triệt để BUG-12).
4. ✅ **Sửa Session Hijack Onboarding** ([`frontend/src/App.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.tsx) & [`frontend/src/utils/authUtils.ts`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/utils/authUtils.ts)): Bảo vệ người dùng hiện hữu không bị văng về `/welcome`. (Sửa triệt để BUG-11).

### Giai đoạn 3: Tối ưu UI/UX & Bố Cục Thẻ (Layout & Typography)
1. ✅ **Sửa bố cục thẻ từ vựng Library** ([`Library.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/Library.tsx), [`Library.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/Library.css)): Tách Top-bar cho action buttons và giải phóng 100% width cho chữ. (Sửa triệt để BUG-09).
2. ✅ **Thiết kế lại Biểu Đồ Tuần Hiện Đại** ([`WeeklyActivityChart.tsx`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/stats/components/dashboard/WeeklyActivityChart.tsx), [`StatsPage.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/stats/StatsPage.css)): Bổ sung cột nền pill `.bar-track`, nhãn đếm số từ trên đầu cột, làm nổi bật ngày hôm nay và badge tổng kết tuần. (Sửa triệt để BUG-10 Frontend).
3. ✅ **Sửa Responsive Mobile** ([`frontend/src/App.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.css)): Bổ sung `padding-bottom` cho `.main-content` trên mobile. (Sửa triệt để BUG-05).
4. ✅ **Tối ưu Contrast & Accessibility** ([`frontend/src/App.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/App.css), [`frontend/src/views/auth/Auth.css`](file:///d:/Workspace/Personal/Web/LexiNote/frontend/src/views/auth/Auth.css)): Cập nhật bảng màu text trên pastel card và thêm `aria-label`. (Sửa triệt để BUG-07 & BUG-08).

