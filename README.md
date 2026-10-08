# FinSight

MVP quản lý tài chính cá nhân bằng tiếng Việt: đăng ký/đăng nhập, danh mục, giao dịch, ngân sách tháng và dashboard.

## Công nghệ

- Mobile: Expo 54, React Native, TypeScript, React Navigation, Secure Store.
- API: Node.js, Express 5, TypeScript, Zod, JWT, bcrypt.
- Database: PostgreSQL 16, Prisma ORM. Tiền VND lưu bằng BigInt.

## Cấu trúc

- mobile: ứng dụng Expo.
- server/src/routes: REST endpoints theo module.
- server/prisma: schema và seed danh mục mặc định.
- docker-compose.yml: PostgreSQL local.

## Chạy local

Yêu cầu Node.js 20+, npm và Docker Desktop.

    npm install
    docker compose up -d
    npm run db:generate -w server
    npm run db:migrate -w server -- --name init
    npm run db:seed -w server
    npm run dev:server

Mở terminal khác:

    npm run android -w mobile

Android Emulator dùng sẵn http://10.0.2.2:4000/api. Thiết bị thật cần đặt EXPO_PUBLIC_API_URL thành địa chỉ LAN của máy. Biến môi trường backend được mô tả trong server/.env.example.

## Kiểm tra

    npm test
    npm run typecheck
    npm run build -w server

## API

- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET hoặc POST /api/categories; PATCH hoặc DELETE /api/categories/:id
- GET hoặc POST /api/transactions; GET, PATCH hoặc DELETE /api/transactions/:id
- GET hoặc POST /api/budgets; PATCH /api/budgets/:id
- GET /api/dashboard/summary?month=YYYY-MM

Các API ngoài đăng nhập và đăng ký cần Bearer token.

## Luồng demo

Đăng ký, thêm giao dịch thu/chi từ nút cộng, đặt ngân sách, rồi xem Tổng quan. Nhấn giao dịch để xem chi tiết, sửa hoặc xóa. Dữ liệu được đọc trực tiếp từ PostgreSQL qua API.
