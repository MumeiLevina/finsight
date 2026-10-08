# Ghi chú Kỹ thuật Lập trình Nâng cao

1. Type safety: TypeScript strict ở API và mobile; Zod kiểm tra dữ liệu runtime.
2. Encapsulation: API client che token và header; Prisma che SQL; middleware che JWT.
3. Async: I/O dùng async/await, lỗi đi qua error middleware hoặc trạng thái màn hình.
4. Precision: Prisma dùng BigInt; lib.ts chuyển an toàn sang chuỗi JSON.
5. Authorization: middleware xác thực phiên, route luôn ràng buộc req.userId.
6. Database relationships: foreign key với cascade hoặc restrict bảo vệ ownership và dữ liệu tham chiếu.
7. Reusable UI: Btn, Field, Header, TxRow và Empty giữ hành vi nhất quán.
8. Testing: lib.test.ts kiểm thử biên tháng, input sai và độ chính xác tiền.
9. SOLID vừa đủ: route chia theo miền; validation, persistence, auth và formatting có trách nhiệm riêng.
