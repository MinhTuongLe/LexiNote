# LexiNote Frontend Functionality Audit

Ngày rà soát: 2026-10-18  
Phạm vi: `frontend/`, đối chiếu với client API và DTO/service tương ứng trong `backend/`.

## 1. Kết luận tổng quan

Frontend đã có một bộ chức năng khá đầy đủ cho phiên bản đầu: authentication, dashboard, thư viện từ vựng, SRS study mode, statistics, achievements, leaderboard, match game, curated decks, import/export và settings.

Tuy nhiên, ứng dụng chưa nên được xem là “hoàn thiện chức năng”. Có ba nhóm cần ưu tiên trước khi mở rộng thêm feature:

1. **P0 – Sửa contract custom word types:** frontend gửi cấu trúc khác với cấu trúc backend đang đọc. Sau khi thêm custom word type, response settings có thể sai shape và việc tạo từ mới có thể lỗi ở backend.
2. **P1 – Hoàn thiện profile:** profile hiện chỉ sửa được `fullName` và avatar. Backend DTO cũng chỉ hỗ trợ hai trường này; nếu yêu cầu “đầy đủ thông tin cá nhân” thì cần mở rộng data model/API chứ không chỉ bổ sung input ở frontend.
3. **P1 – Đồng bộ settings với hành vi học:** `flashcardFront`, audio settings và một phần preference được lưu/hiển thị nhưng chưa được áp dụng đầy đủ trong Study Mode/TTS.

Các vấn đề quan trọng khác là error state còn thiếu, nhiều chuỗi chưa đi qua i18n, import chưa giữ đầy đủ metadata của word, và frontend có test file nhưng chưa có test runner/script được cấu hình.

## 2. Overview repository

| Khu vực | Vai trò | Công nghệ chính |
|---|---|---|
| `backend/` | Client API, dashboard API, auth, SRS, Prisma | NestJS, Fastify, Prisma, PostgreSQL |
| `frontend/` | Ứng dụng học từ vựng cho người dùng | React 19, Vite 8, Redux Toolkit/RTK Query, i18next |
| `dashboard/` | Ứng dụng quản trị | React/Vite, API dashboard |
| `docs/postman/` | Collection và tài liệu gọi API | Postman |

Frontend hiện có khoảng **43 file component/page TSX**, tổ chức chính như sau:

```text
frontend/src/
├─ App.tsx                 # route, dashboard và modal global
├─ components/             # Button, Card, Modal, WordForm, WordImport...
├─ store/                  # authSlice, RTK Query apiSlice
├─ views/auth/              # login, register, verify email, forgot password
├─ views/                  # Library, StudyMode
├─ views/decks/             # curated vocabulary decks
├─ views/games/             # Match Game
├─ views/profile/           # profile, password, danger zone
├─ views/settings/          # app settings và word type manager
├─ views/stats/             # dashboard statistics và detail views
├─ views/guide/             # onboarding guide
├─ locales/                 # English/Vietnamese translations
└─ utils/, hooks/, context/ # speech, sound, dialog, auth helpers
```

## 3. Inventory chức năng hiện có

| Nhóm | Chức năng hiện có | Đánh giá |
|---|---|---|
| Authentication | Login, register, email verification, resend verification, forgot/reset password, refresh token, logout | Có flow chính; còn thiếu validation UX và quản lý profile/session nâng cao |
| Onboarding | Welcome guide 4 slide, skip/next/finish, lưu local và API | Có; đồng bộ API chạy background nên có thể mất trạng thái server |
| Dashboard | Streak, weekly activity, due reviews, total words, accuracy, time spent, recent words | Có; thiếu trạng thái lỗi/retry rõ ràng |
| Word CRUD | Add, edit, delete một từ, bulk delete, reset SRS progress | Có; form chưa bao phủ đầy đủ metadata/model |
| Library | Search, filter type/status, load more, select all, bulk reset/delete, Excel export | Khá đầy đủ; còn vấn đề import/relations/error state |
| Import | CSV/XLS/XLSX upload, drag/drop, paste text, preview | Có; parser và type normalization chưa nhất quán |
| AI Extract | Extract từ text, giới hạn số từ, chọn/bỏ chọn, import selected | Có; metadata như phonetic chưa được lưu xuyên suốt |
| Study Mode | Flashcard, quiz, writing, listening, rating Hard/Medium/Easy, TTS | Có; preference flashcard/audio chưa được áp dụng đầy đủ |
| Statistics | Overview, activity calendar, performance, mastery, focus/weak words, types | Có; main stats chưa phân biệt API error với no data |
| Achievements | Load progress, auto-unlock khi đạt target | Có; side effect và nội dung còn hardcode |
| Match Game | Ghép từ Anh–Việt, score, timer, sounds, record session, leaderboard | Có; lỗi record session đang bị nuốt |
| Curated Decks | Search/category filter, detail modal, preview, import all | Có; chưa hỗ trợ chọn từng từ dù API đã hỗ trợ |
| Profile | Đổi full name, emoji avatar, đổi password, deactivate/wipe account | Chưa hoàn thiện nếu yêu cầu profile đầy đủ |
| Settings | Sound, language, monthly goal, flashcard front, custom word types | Có UI nhưng contract custom types đang lỗi; audio/dark theme còn thiếu UI |
| i18n | English/Vietnamese bundles và language switch | Chưa hoàn chỉnh; nhiều label/alert còn hardcode |
| Testing | Một số unit/component spec | Chưa chạy được chuẩn vì package chưa có Vitest/test script/config |

## 4. Các vấn đề cần chú ý triển khai

### P0 — Contract custom word types không nhất quán

Evidence:

- Frontend gửi `wordTypes: { custom: updatedTypes }` khi thêm/xóa type: `frontend/src/views/settings/LanguageSettingsPage.tsx:57-59, 74-76`.
- Backend DTO khai báo `wordTypes?: any[]`: `backend/src/client/settings/dto/update-settings.dto.ts:74-76`.
- `getSettings()` trả `custom: currentSettings.wordTypes || []`: `backend/src/client/settings/settings.service.ts:27-30`.
- `getValidTypes()` lại giả định `settings.wordTypes` là array và gọi `.map()`: `backend/src/client/settings/settings.service.ts:85-92`.

Impact:

- Sau khi lưu custom type, dữ liệu có thể trở thành object `{ custom: [...] }` trong JSON settings nhưng API response lại gán object đó vào `wordTypes.custom`.
- Frontend có thể lỗi khi gọi `.some()`/`.map()` trên `settingsData.wordTypes.custom`.
- Tạo/import word sau đó có thể làm backend lỗi vì `settings?.wordTypes?.map` không tồn tại.

Đề xuất:

- Chọn một canonical shape duy nhất, khuyến nghị lưu `settings.wordTypes` là `CustomWordType[]`.
- DTO dùng type rõ ràng, không dùng `any[]`.
- Frontend gửi `wordTypes: updatedTypes`, hoặc backend chuẩn hóa cả hai shape để backward-compatible.
- `getSettings()` và `getValidTypes()` cần xử lý dữ liệu cũ trước khi trả response.
- Thêm test contract cho: add custom type → reload settings → create word bằng custom type → delete custom type.

### P1 — Profile chưa có đủ trường thông tin

Frontend chỉ có hai state và gửi đúng hai trường:

- `fullName`, `selectedAvatar`: `frontend/src/views/profile/ProfilePage.tsx:31-35`.
- Mutation chỉ nhận `{ fullName?: string; avatar?: string }`: `frontend/src/store/apiSlice.ts:132-139`.
- Form chỉ render display name và avatar: `frontend/src/views/profile/ProfilePage.tsx:106-145`.

Backend cũng chỉ hỗ trợ hai trường:

- `UpdateProfileDto` chỉ có `fullName` và `avatar`: `backend/src/client/auth/dto/update-profile.dto.ts:4-15`.
- Prisma `User` hiện có `email`, `fullName`, `avatar`, auth/status fields và JSON settings; không có phone, bio, date of birth, gender, timezone hoặc profile preferences riêng: `backend/prisma/schema.prisma:31-57`.

Đề xuất scope profile hoàn chỉnh:

- Thông tin hiển thị: full name, avatar, bio/about, timezone.
- Account info: email, email verified status, created date; email nên read-only nếu chưa có flow đổi email.
- Security: change password, active sessions/devices, revoke other sessions.
- Nếu cần đổi email: endpoint request change → gửi verification code → confirm → cập nhật email.
- Không cho user tự sửa role/status/ban fields.
- Bổ sung server validation, client validation, loading/error state cho từng section.

### P1 — Settings được lưu nhưng chưa được áp dụng xuyên suốt

Backend hỗ trợ các settings sau:

- `darkTheme`, `soundEnabled`, `flashcardFront`, `language`, `hasSeenGuide`.
- `audio.autoSpeak`, `audio.voiceLang`, `audio.rate`, `audio.pitch`.
- `learning.monthlyGoalDays`.

Evidence backend: `backend/src/client/settings/dto/update-settings.dto.ts:48-88` và `backend/src/client/settings/settings.service.ts:20-39`.

Frontend mới expose/apply một phần:

- `SettingsPage` có sound, monthly goal và language: `frontend/src/views/settings/SettingsPage.tsx:73-113`.
- `LanguageSettingsPage` có sound, flashcard front và custom types: `frontend/src/views/settings/LanguageSettingsPage.tsx:25-27, 114-151`.
- Study Mode tự khởi tạo `autoSpeak` bằng `true`, không đọc setting audio: `frontend/src/views/StudyMode.tsx:32-36`.
- Flashcard luôn render English word ở mặt trước; `flashcardFront` chưa thay đổi nội dung: `frontend/src/views/StudyMode.tsx:261-289`.
- TTS dùng cố định `en-US`, rate `0.9`, pitch `1.0`: `frontend/src/utils/speech.ts:4-12`.

Đề xuất:

- Load settings thành một hook/context dùng chung cho Study Mode, TTS và sound.
- Áp dụng `flashcardFront` thật sự cho mặt trước/mặt sau.
- Áp dụng `audio.autoSpeak`, `voiceLang`, `rate`, `pitch`; hoặc loại bỏ các field backend nếu không còn trong product scope.
- Thêm UI dark theme nếu backend vẫn giữ field này.
- Monthly goal nên validate local, không gọi API ở mỗi keystroke; dùng blur/submit hoặc debounce.

### P1 — Word model có metadata nhưng form/import chưa bao phủ

Frontend type `CreateWordDTO` đã có `synonyms` và `antonyms`, còn model có `phonetic`, `audioUrl`, `relations`:

- `frontend/src/types/index.ts:45-55`.
- `backend/prisma/schema.prisma:60-80`.

Nhưng `WordForm` chỉ có word, meaning, type và example: `frontend/src/components/WordForm.tsx:39-95`.

Các điểm thiếu:

- Không tạo/sửa synonyms, antonyms.
- Không nhập/sửa phonetic hoặc audio URL.
- AI response có phonetic nhưng `ImportedWord` không định nghĩa field này và bulk import DTO/backend không lưu field đó: `frontend/src/components/AiExtractModal.tsx` và `backend/src/client/word/dto/bulk-word-actions.dto.ts`.
- `WordService.update()` chỉ destructure `word`, `meaningVi`, `example`, `type`; relations không được update: `backend/src/client/word/word.service.ts:313-315`.

Đề xuất:

- Quyết định metadata nào là user-editable.
- Mở rộng DTO/frontend form/import tương ứng.
- Nếu dùng relations, thêm editor dạng tag/chip và API update transaction cho relations.
- Hiển thị phonetic/audio nhất quán trong Library và Study.

### P1 — Type normalization của import và AI chưa đồng nhất

- Frontend canonical types dùng `adj`, `adv`, `verb_phrase`: `frontend/src/constants/wordTypes.ts`.
- AI `inferWordType()` có thể trả `adverb` hoặc `adjective`: `backend/src/client/word/word.service.ts:103-108`.
- `WordImport.normalizeData()` không có `verb_phrase` trong `validTypes`: `frontend/src/components/WordImport.tsx`.

Impact: một số từ AI/import sẽ bị chuyển thành `other`, làm filter, label và statistics sai.

Đề xuất: tạo một enum/normalizer dùng chung hoặc mapping chính thức (`adjective → adj`, `adverb → adv`), sau đó test create/import/AI extract cho toàn bộ type list.

### P1 — Error state của các page chưa đủ

Một số query chỉ xử lý loading/empty mà không xử lý API error:

- Dashboard lấy `statsLoading` nhưng không expose `isError`; lỗi có thể hiển thị như số 0 hoặc empty library: `frontend/src/App.tsx:95` và phần dashboard route.
- Library không có `isError`/retry; lỗi tải data có thể giống empty result: `frontend/src/views/Library.tsx:54-65, 356-369`.
- Stats dùng `if (!stats)` để hiển thị no-data, không phân biệt query lỗi: `frontend/src/views/stats/StatsPage.tsx:37-58`.
- Decks chỉ có loading/empty, không có error/retry: `frontend/src/views/decks/DecksPage.tsx`.

Đề xuất: mỗi page cần ba trạng thái riêng `loading`, `error + retry`, `success/empty`; hiển thị message từ `getApiErrorMessage()` và không dùng empty state để che lỗi.

### P1 — Match Game nuốt lỗi ghi session

Khi game hoàn tất, mutation ghi score được gọi nhưng lỗi bị bỏ qua:

`frontend/src/views/games/MatchGame.tsx:107-113` dùng `.catch(() => undefined)`.

Impact: người dùng thấy game thắng nhưng streak/statistics/leaderboard có thể không cập nhật, không có cách biết hoặc retry.

Đề xuất: giữ trạng thái `isRecordingSession`, thông báo nếu lưu thất bại, cho phép retry; chỉ hiển thị “đã lưu kết quả” sau khi API thành công.

### P2 — Deck import chưa tận dụng khả năng chọn từng từ

Backend API nhận `words?: string[]` trong `importDeck`, nhưng UI chỉ có nút import toàn bộ:

- API mutation: `frontend/src/store/apiSlice.ts:257-264`.
- UI: `frontend/src/views/decks/DeckDetailModal.tsx` chỉ gọi `importDeck({ id: deckId })`.

Đề xuất: checkbox từng word, select all, hiển thị imported/skipped count. Nếu product chủ ý chỉ import all, nên loại `words?` khỏi client contract để giảm ambiguity.

### P2 — Onboarding có thể mất trạng thái đồng bộ server

`WelcomePage` lưu localStorage rồi redirect ngay, API `hasSeenGuide` chạy background và chỉ log lỗi:

`frontend/src/views/guide/WelcomePage.tsx:27-45`.

Impact: user đã xem guide trên thiết bị A nhưng API update thất bại; thiết bị khác vẫn hiện guide, trong khi local device không còn hiện.

Đề xuất: lưu trạng thái pending, retry khi app khởi động; hoặc chờ mutation thành công trước redirect và có fallback rõ ràng.

### P2 — i18n chưa hoàn chỉnh

Dù đã có `locales/en` và `locales/vi`, nhiều nội dung đang hardcode:

- Decks page và deck detail phần lớn là tiếng Việt trực tiếp.
- Study mode có label mode, prompt, feedback và title TTS trực tiếp.
- Achievements có `Achievements & Badges`, `Loading achievements...`, `Progress` trực tiếp.
- AI Extract modal có nhiều label/alert trực tiếp.
- Profile alert và một số placeholder trực tiếp.

Đề xuất: bổ sung key cho cả `en`/`vi`, không trộn `t(...) || hardcoded fallback` trong UI production; kiểm tra cả hai ngôn ngữ khi hoàn tất.

### P2 — Accessibility và interaction semantics

- `Card` là `motion.div` clickable, không có keyboard semantics (`role`, `tabIndex`, Enter/Space handler): `frontend/src/components/Card.tsx`.
- Một số icon button thiếu `aria-label`, ví dụ word actions và speaker buttons.
- `Modal` chưa có focus trap, Escape handling hoặc `role="dialog"`/`aria-modal`: `frontend/src/components/Modal.tsx`.

Đề xuất: chuẩn hóa `IconButton`, nâng Card clickable thành button/link semantics hoặc thêm keyboard behavior, và hoàn thiện modal accessibility.

### P2 — Frontend test infrastructure chưa hoàn chỉnh

Repo có một số `.spec.ts/.spec.tsx` và `src/test/setup.ts` import Vitest, nhưng:

- `frontend/package.json` chưa có script `test`.
- `frontend/package.json` chưa khai báo Vitest/Testing Library trong devDependencies.
- `frontend/vite.config.ts` chưa có test config/setup.

Do đó test hiện có chưa trở thành quality gate. Cần thiết lập Vitest + React Testing Library trước khi triển khai các thay đổi lớn ở profile/settings/library.

## 5. Các điểm kỹ thuật nên harden sau khi hoàn thiện feature

- `frontend/src/store/apiSlice.ts` đang logout khi gặp network error hoặc HTTP 5xx. Một lỗi mạng tạm thời không nên tự động xóa session; nên chỉ hiển thị offline/server error và retry, logout khi refresh token thực sự thất bại.
- Refresh token flow chưa có mutex cho nhiều request đồng thời cùng nhận 401; có nguy cơ nhiều request cùng refresh.
- Sound effect dùng URL bên ngoài trong `frontend/src/hooks/useSound.ts`; nên có fallback/local asset nếu cần hoạt động ổn định khi CDN không truy cập được.
- Nhiều page lớn vẫn trộn data fetching, business logic và presentation trong một file; có thể tách hooks sau khi ưu tiên chức năng đã ổn định.

## 6. Thứ tự triển khai khuyến nghị

### Phase 0 — Contract và quality gate

1. Chuẩn hóa `wordTypes` contract và xử lý dữ liệu cũ.
2. Thiết lập Vitest/Testing Library/test script.
3. Viết test regression cho custom type, settings update, profile save và import normalization.
4. Bổ sung error/retry state cho Dashboard, Library, Stats và Decks.

### Phase 1 — Profile và account

1. Chốt danh sách trường profile cần có.
2. Mở rộng Prisma model, DTO, service và `User` type nếu cần.
3. Làm profile form theo section, validation và dirty state.
4. Thêm change email + verification nếu email được phép sửa.
5. Bổ sung session/security management nếu nằm trong scope.

### Phase 2 — Settings và Study Mode

1. Tạo settings hook/context dùng chung.
2. Kết nối flashcard front preference.
3. Kết nối audio auto-speak, language, rate, pitch.
4. Quyết định và triển khai dark theme hoặc xóa field không dùng.
5. Validate/debounce monthly goal.

### Phase 3 — Word data completeness

1. Chuẩn hóa type mapping.
2. Bổ sung phonetic/audio/relations nếu product cần.
3. Đồng bộ create/edit/import/AI/deck import với cùng DTO.
4. Thêm test cho từng type và metadata round-trip.

### Phase 4 — Product polish

1. Hoàn thiện i18n.
2. Sửa Match Game session feedback và onboarding retry.
3. Thêm chọn từng word khi import deck.
4. Accessibility pass cho Card, Modal và icon buttons.
5. Hardening refresh/network behavior.

## 7. Acceptance checklist đề xuất

- [ ] Thêm custom word type, reload trang, tạo word bằng type đó, filter và export đúng.
- [ ] Profile hiển thị và lưu tất cả field đã chốt; field nhạy cảm không bị sửa trái phép.
- [ ] Đổi password có validation, loading, lỗi server và reset form đúng.
- [ ] Flashcard front preference thay đổi được mặt trước thật sự.
- [ ] Audio settings ảnh hưởng đến auto-speak và TTS.
- [ ] Add/edit/import/AI/deck import giữ được type và metadata nhất quán.
- [ ] API error có message/retry riêng, không hiển thị nhầm thành empty state.
- [ ] Match Game báo rõ trạng thái lưu session.
- [ ] English/Vietnamese không còn string hardcode trong các flow chính.
- [ ] Unit/component tests chạy được từ `frontend` bằng một command duy nhất.
- [ ] Sau khi có user confirmation riêng, chạy lint/typecheck/build/browser test theo policy của repo.

## 8. Giới hạn của lần rà soát

Lần này chỉ thực hiện static code review và đối chiếu frontend/backend contract. Không chạy production build, không mở browser và không thực hiện automated browser testing vì `AGENTS.md` yêu cầu phải xin xác nhận trước các thao tác đó.
