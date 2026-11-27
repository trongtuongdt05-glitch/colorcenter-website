# CRM Color Center · Giao diện và lịch thi công

## Supabase

- Nếu đã cài bản Tiến độ và Lịch tháng, gói này dùng lại cơ sở dữ liệu hiện tại.
- Nếu cài CRM lần đầu, mở SQL Editor của dự án Supabase Color Center và chạy lần lượt `supabase/crm.sql`, `supabase/crm-progress.sql`.
- Nếu chỉ đã chạy `supabase/crm.sql`, chạy thêm `supabase/crm-progress.sql`.

## Triển khai trên Vercel

1. Giải nén vào thư mục gốc của repo colorcenter-website. Các thư mục `app/crm`, `app/cpanel` và `app/_components` chứa giao diện cập nhật. Nếu đã tùy chỉnh CPanel, hợp nhất các thay đổi vào phiên bản của anh.
2. Đẩy mã lên nhánh Vercel đang triển khai. Khi Vercel báo Ready, đăng nhập CPanel và mở CRM công việc.
3. Tạo một đơn thử. Nhập giá trị 100000 để thấy 100.000. Chọn ngày bắt đầu 27/11/2026 và nhập 4 ngày để thấy hạn bàn giao 30/11/2026. Mở lịch tháng 11 để kiểm tra cả bốn ô mang cùng màu công trình.

Ngày bắt đầu được tính là ngày thứ nhất, bao gồm thứ Bảy và Chủ nhật. Yêu cầu báo giá từ website vẫn xem trong CPanel. Các trường ngày chốt, khảo sát và việc tiếp theo nằm trong phần Thông tin theo dõi bổ sung.

## Bản Lead/Khách hàng

Chạy thêm `supabase/crm-source.sql` trước khi cập nhật mã. Danh sách Lead/Khách hàng lấy từ đơn hàng trong CRM và xuất tệp Excel .xlsx. Đơn cũ chưa chọn nguồn có thể bổ sung trong chi tiết đơn. Những yêu cầu báo giá chưa thành đơn vẫn nằm ở CPanel.
