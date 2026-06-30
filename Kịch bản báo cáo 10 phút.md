# KỊCH BẢN BÁO CÁO ĐỒ ÁN — 10 PHÚT
## Hệ thống Tự động Tổng hợp và Gợi ý Bài báo Khoa học (PaperAI)

---

## PHẦN 1 — GIỚI THIỆU ĐỀ TÀI (1 phút)

> "Kính chào thầy/cô, em xin bắt đầu báo cáo đồ án."

**Tên đề tài:** Hệ thống Tự động Tổng hợp và Gợi ý Bài báo Khoa học — PaperAI.

**Lý do chọn đề tài:**
Hiện nay, số lượng bài báo khoa học được công bố mỗi ngày rất lớn — chỉ riêng arXiv đã có hàng nghìn bài mới mỗi tuần. Sinh viên và nhà nghiên cứu rất khó để theo dõi hết, phải tự vào từng trang, đọc từng abstract dài. Hệ thống này giải quyết đúng vấn đề đó.

**Mục tiêu:** Xây dựng ứng dụng web tự động thu thập, tóm tắt bằng AI và gợi ý bài báo phù hợp với chủ đề người dùng quan tâm.

**Đối tượng sử dụng:** Sinh viên, giảng viên, nhà nghiên cứu cần cập nhật tài liệu khoa học thường xuyên.

---

## PHẦN 2 — KHẢO SÁT VÀ YÊU CẦU (1 phút)

**Vấn đề thực tế:**
- Quá nhiều bài báo → khó lọc thủ công
- Abstract dài, khó nắm ý chính nhanh
- Không có công cụ theo dõi cá nhân hóa theo chủ đề

**Yêu cầu chức năng — 9 chức năng cơ bản:**
1. Đăng ký, đăng nhập
2. Quản lý chủ đề theo dõi (thêm/sửa/xóa)
3. Tự động thu thập paper từ arXiv theo từ khóa
4. Lưu đầy đủ: tiêu đề, abstract, tác giả, ngày, link PDF
5. Tóm tắt ý chính bằng AI (Gemini)
6. Hiển thị danh sách paper mới nhất
7. Tìm kiếm theo từ khóa và tên tác giả
8. Xem chi tiết paper
9. Lưu paper yêu thích

**5 chức năng nâng cao:**
Gợi ý paper liên quan, phát hiện trùng lặp, thông báo paper mới, thống kê xu hướng, chấm điểm đáng đọc.

**Yêu cầu phi chức năng:** Giao diện trực quan, phản hồi nhanh, bảo mật dữ liệu theo từng user (RLS), dễ mở rộng thêm nguồn dữ liệu.

---

## PHẦN 3 — KIẾN TRÚC VÀ DATABASE (1.5 phút)

**Kiến trúc hệ thống — Layered Architecture:**

```
Client (React + Vite)
        ↓ HTTP / REST API
Server (Node.js + Express)
   ├── Controllers   ← nhận request, validate
   ├── Services      ← xử lý nghiệp vụ
   └── Repositories  ← truy vấn database
        ↓
Supabase (PostgreSQL + Auth)     Gemini API (AI)     arXiv API (dữ liệu)
```

> "Lý do chọn kiến trúc này: phạm vi đồ án vừa phải, nhóm triển khai nhanh, code dễ bảo trì. Nếu dùng Microservices sẽ phức tạp và tốn chi phí vận hành không cần thiết."

**Công nghệ sử dụng:**
- Frontend: React + TypeScript + Tailwind CSS + Recharts
- Backend: Node.js + Express + TypeScript
- Database: Supabase (PostgreSQL) — có RLS bảo vệ dữ liệu từng user
- AI: Google Gemini API
- Dữ liệu: arXiv REST API + xml2js

**Thiết kế database — 6 bảng chính:**

| Bảng | Mô tả |
|------|-------|
| `profiles` | Thông tin người dùng, liên kết auth.users |
| `topics` | Chủ đề và từ khóa theo dõi của từng user |
| `articles` | Bài báo: tiêu đề, abstract, tác giả, ngày, link |
| `summaries` | Tóm tắt AI, cache theo article_id |
| `favorites` | Quan hệ user ↔ article yêu thích |
| `notifications` | Thông báo paper mới theo chủ đề |

> "Tất cả bảng đều có Row Level Security — dữ liệu của user A không bao giờ lộ ra với user B."

---

## PHẦN 4 — DEMO CHỨC NĂNG (4 phút)

> *(Mở trình duyệt, vào http://localhost:5173)*

### 4.1 — Đăng ký / Đăng nhập (20 giây)
> "Em sẽ đăng nhập vào tài khoản đã có sẵn."
- Nhập email, mật khẩu → đăng nhập → chuyển về trang chủ

### 4.2 — Trang chủ: Danh sách paper mới (30 giây)
> "Đây là trang chính — hiển thị các bài báo mới nhất từ arXiv, sắp xếp theo ngày công bố. Mỗi card có điểm đáng đọc — tính từ độ mới, số tác giả và từ khóa hot. Xanh lá là điểm cao, vàng là trung bình."
- Chỉ vào badge ★ trên card

### 4.3 — Tìm kiếm và lọc (30 giây)
> "Hệ thống hỗ trợ tìm kiếm theo từ khóa trong tiêu đề và abstract, hoặc tìm theo tên tác giả bằng cách chọn dropdown."
- Gõ "transformer" → nhấn Tìm kiếm → badge hiện kết quả
- Đổi sang "Tác giả" → gõ tên tác giả bất kỳ

### 4.4 — Xem chi tiết và Tóm tắt AI (40 giây)
> "Click vào một bài báo bất kỳ để xem chi tiết. Ở đây có đầy đủ thông tin, điểm đáng đọc, link PDF. Quan trọng nhất là nút 'Tạo tóm tắt' — hệ thống sẽ gọi Gemini AI để tóm tắt abstract thành 3–5 câu tiếng Việt."
- Click vào bài → nhấn "Tạo tóm tắt" → chờ → chỉ kết quả
> "Kết quả được cache lại — lần sau xem cùng bài không cần gọi AI nữa."
- Cuộn xuống → chỉ phần bài báo liên quan

### 4.5 — Lưu yêu thích (15 giây)
- Nhấn ★ → toast "Đã thêm vào yêu thích"
- Vào menu "Yêu thích" → chỉ danh sách

### 4.6 — Quản lý chủ đề (30 giây)
> "Đây là trang Chủ đề — người dùng tạo các chủ đề với tên và từ khóa. Khi click vào một chủ đề, hệ thống tìm kiếm bài liên quan, đồng thời kích hoạt thu thập bài mới từ arXiv theo đúng từ khóa đó."
- Vào Chủ đề → chỉ form thêm/sửa/xóa → click một chủ đề → bài hiện ra

### 4.7 — Thống kê xu hướng (20 giây)
- Vào "Xu hướng"
> "Trang này phân tích dữ liệu trong DB — biểu đồ đường theo tháng, biểu đồ tròn phân bổ chủ đề, và cột top 8 tag phổ biến. Tên hiển thị là tên đầy đủ thay vì mã arXiv như cs.LG hay cs.AI."

### 4.8 — Thông báo paper mới (20 giây)
> "Khi hệ thống thu thập bài mới từ arXiv, nó tự đối chiếu với chủ đề của từng user. Nếu khớp từ khóa thì tạo thông báo. Chuông 🔔 trên navbar sẽ hiện số đỏ. Click vào để xem danh sách và đánh dấu đã đọc."
- Chỉ vào chuông thông báo

---

## PHẦN 5 — KIỂM THỬ VÀ KẾT QUẢ (1.5 phút)

**Một số test case đã thực hiện:**

| Test case | Input | Kết quả mong đợi | Kết quả thực tế |
|-----------|-------|-----------------|----------------|
| Đăng nhập đúng | Email + mật khẩu hợp lệ | Vào trang chủ | ✅ Thành công |
| Đăng nhập sai | Sai mật khẩu | Thông báo lỗi | ✅ Hiện toast lỗi |
| Tìm kiếm | Keyword "deep learning" | Danh sách bài liên quan | ✅ Lọc đúng |
| Tóm tắt AI | Click "Tạo tóm tắt" | Tóm tắt tiếng Việt | ✅ Gemini trả về |
| Tóm tắt lần 2 | Cùng bài | Hiện ngay, không gọi AI | ✅ Cache hoạt động |
| Thêm yêu thích | Click ★ | Lưu vào Favorites | ✅ Thành công |
| Phát hiện trùng | Ingest cùng paper | Bỏ qua, không lưu lại | ✅ Dedup hoạt động |
| Thông báo | Ingest bài mới khớp topic | Chuông hiện số đỏ | ✅ Sau migration 002 |

**Lỗi đã xử lý trong quá trình phát triển:**
- Gemini API 404 → chuyển sang gọi REST trực tiếp với header `X-goog-api-key`
- Database trống khi load lần đầu → auto-ingest bằng DEFAULT_KEYWORDS
- Thông báo 500 khi bảng chưa tồn tại → xử lý error code `42P01` trả về rỗng thay vì crash

---

## PHẦN 6 — KẾT LUẬN (45 giây)

**Kết quả đạt được:**
- ✅ Đủ 9/9 chức năng cơ bản
- ✅ Đủ 5/5 chức năng nâng cao
- ✅ Kiến trúc phân lớp rõ ràng (Controller → Service → Repository)
- ✅ Bảo mật RLS theo từng user

**Hạn chế:**
- Tóm tắt AI dùng Gemini miễn phí — có giới hạn số lần gọi mỗi ngày
- Điểm đáng đọc tính client-side, chưa cá nhân hóa theo lịch sử đọc từng user

**Hướng phát triển:**
- Thêm nguồn dữ liệu: Semantic Scholar, PubMed
- Gợi ý paper dựa trên lịch sử đọc (collaborative filtering)
- Xuất báo cáo PDF danh sách bài đã đọc

> "Em xin kết thúc phần báo cáo. Thầy/cô có câu hỏi nào em xin được giải đáp ạ."

---

## CHUẨN BỊ TRẢ LỜI CÂU HỎI

**Hỏi: Vì sao chọn đề tài này?**
> "Vì sinh viên như chúng em cũng đang gặp đúng vấn đề này — mỗi lần tìm tài liệu phải vào từng trang tìm kiếm thủ công, đọc abstract dài mà chưa biết bài có phù hợp không. Hệ thống này giải quyết bằng cách tự động hóa phần thu thập và dùng AI tóm tắt."

**Hỏi: Hệ thống có những actor nào?**
> "Có 4 actor: Người dùng chưa đăng nhập (chỉ xem danh sách và chi tiết), Người dùng đã đăng nhập (đầy đủ chức năng), Hệ thống arXiv (nguồn dữ liệu), Gemini AI (dịch vụ tóm tắt)."

**Hỏi: Kiến trúc là gì? Tại sao không dùng Microservices?**
> "Chúng em dùng Layered Architecture — phân thành 3 lớp Controller, Service, Repository. Lý do không dùng Microservices vì đồ án quy mô nhỏ, nhóm ít người, cần triển khai nhanh. Microservices sẽ đòi hỏi Docker, API Gateway, service discovery — phức tạp và tốn thời gian vận hành không tương xứng với quy mô."

**Hỏi: AI được dùng ở đâu?**
> "Gemini API được dùng để tóm tắt abstract thành 3–5 câu tiếng Việt. Prompt yêu cầu tập trung vào đóng góp chính và phương pháp. Kết quả được cache vào bảng summaries — cùng bài chỉ gọi AI một lần."

**Hỏi: Nếu muốn sửa chức năng tìm kiếm thì sửa ở đâu?**
> "Tìm kiếm theo từ khóa: sửa trong `ArticleRepository.findAll()` — phần `.or('title.ilike...abstract.ilike...')`. Tìm kiếm theo tác giả: sửa trong `findAllFilteredByAuthor()` — lọc bằng JavaScript. Trên frontend: `SearchBar.tsx` và `HomePage.tsx`."

**Hỏi: Làm sao kiểm thử?**
> "Chúng em test thủ công theo từng luồng: đăng nhập đúng/sai, thêm chủ đề, tìm kiếm, lưu yêu thích, xem chi tiết, tóm tắt. Một số trường hợp biên như database trống lần đầu, paper bị trùng arxiv_id, bảng notifications chưa tồn tại — đều được xử lý."

---

## GHI CHÚ THỜI GIAN

| Phần | Thời gian |
|------|-----------|
| 1. Giới thiệu đề tài | ~1 phút |
| 2. Khảo sát + Yêu cầu | ~1 phút |
| 3. Kiến trúc + Database | ~1.5 phút |
| 4. Demo chức năng | ~4 phút |
| 5. Kiểm thử + Kết quả | ~1.5 phút |
| 6. Kết luận | ~1 phút |
| **Tổng** | **~10 phút** |
