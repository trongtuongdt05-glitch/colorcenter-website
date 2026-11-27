# CRM Color Center · Bản tiến độ và lịch tháng

## Cập nhật Supabase

1. Mở Supabase của Color Center, vào SQL Editor. Nếu chưa cài CRM, chạy `supabase/crm.sql` trước để tạo bảng.
2. Chạy `supabase/crm-progress.sql` để thêm ngày kết thúc thi công, trạng thái đang thi công và dấu hoàn tất công việc. Có thể chạy lại script. Đơn cũ có ngày thi công được hiển thị như lịch một ngày.

## Triển khai website

1. Giải nén gói vào thư mục gốc của repo colorcenter-website. Nếu CPanel đã tùy chỉnh riêng, chỉ thêm liên kết `/crm` vào thanh điều hướng sau đăng nhập, thay vì ghi đè `app/cpanel/page.tsx`.
2. Đẩy các tệp lên nhánh triển khai của Vercel. Khi bản deploy báo Ready, đăng nhập CPanel và mở CRM công việc.

## Kiểm tra

- Trong Đơn hàng & công việc, chọn tiến độ ngay trong bảng. Nhấp Hoàn tất việc hoặc Mở lại việc để cập nhật việc tiếp theo.
- Mở đơn và nhập ngày bắt đầu và kết thúc thi công. Ví dụ, từ ngày 10 đến 12 cần xuất hiện trong cả ba ô, kể cả khi chuyển tháng đối với lịch giao tháng.
- Trên Tổng quan, nhấp một giai đoạn để mở danh sách lọc tương ứng. Công việc đã hoàn tất rời khỏi danh sách cần xử lý. Khi sửa nội dung việc tiếp theo, việc đó được mở lại.
- CRM dùng cấu hình Supabase và phiên đăng nhập hiện tại của CPanel.
