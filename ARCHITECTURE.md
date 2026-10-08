# Kiến trúc FinSight

Luồng dữ liệu: React Native screen → API client → Express route → validation và nghiệp vụ → Prisma → PostgreSQL.

Mobile giữ JWT trong Expo Secure Store. Middleware xác thực request và gắn userId; mọi truy vấn tài chính luôn lọc theo giá trị này.

## Backend

- routes: giao diện HTTP, status code và điều phối use case.
- validation.ts: schema Zod cho dữ liệu đầu vào.
- middleware.ts: JWT, 404 và xử lý lỗi tập trung.
- db.ts: Prisma client cho data access.
- lib.ts: chuẩn hóa khoảng tháng và JSON hóa BigInt.
- prisma/schema.prisma: quan hệ User, Category, Transaction, Budget.

Danh mục mặc định có userId rỗng; danh mục tùy chỉnh thuộc riêng người dùng. Danh mục đã có giao dịch không thể bị xóa. Loại danh mục luôn phải trùng loại giao dịch.

## Mobile

App.tsx chia theo screen chức năng; src/api.ts đóng gói HTTP và token; src/types.ts là contract dữ liệu; src/theme.ts giữ design token. Authentication Context chỉ quản lý phiên. Screen tự xử lý loading, error và empty state.

## Tiền và thời gian

VND là số nguyên BigInt, không dùng floating point. API trả số tiền dạng chuỗi để tránh mất độ chính xác JavaScript. Dashboard, giao dịch và ngân sách cùng dùng khoảng từ đầu tháng đến trước đầu tháng kế tiếp theo UTC.
