# Hướng dẫn cài đặt

## 1. Tạo Supabase Project

1. Vào https://supabase.com và đăng nhập bằng GitHub (nguyentrunggiang2071-alt)
2. Click "New project" → đặt tên "research-paper-aggregator"
3. Chọn region gần nhất (Singapore)
4. Tạo database password mạnh, lưu lại

## 2. Chạy Migration SQL

1. Vào Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql`
3. Paste vào SQL Editor và chạy

## 3. Lấy thông tin API keys

Vào Supabase Dashboard → Settings → API:
- `Project URL` → SUPABASE_URL
- `anon public` key → SUPABASE_ANON_KEY  
- `service_role secret` key → SUPABASE_SERVICE_ROLE_KEY

## 4. Cấu hình Server

```bash
cd server
cp .env.example .env
```

Điền vào file `server/.env`:
```
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza...  # Lấy từ Google AI Studio
CLIENT_URL=http://localhost:5173
```

## 5. Cấu hình Client

```bash
cd client
cp .env.example .env
```

Điền vào file `client/.env`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:5000
```

## 6. Lấy Google Gemini API Key

1. Vào https://aistudio.google.com
2. Get API Key → Create API key
3. Copy và điền vào `GEMINI_API_KEY` trong `server/.env`

## 7. Chạy ứng dụng

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Truy cập: http://localhost:5173
