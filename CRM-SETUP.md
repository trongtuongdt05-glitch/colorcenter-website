# Cập nhật CRM Color Center

1. Mở Supabase của Color Center, vào SQL Editor, dán nội dung `supabase/crm.sql` và chạy. Script thêm hai bảng CRM vào dự án Supabase đang dùng cho CPanel.
2. Giải nén gói cập nhật vào thư mục gốc của repo colorcenter-website và commit các tệp trong gói. Nếu `app/cpanel/page.tsx` đã được sửa riêng, chỉ thêm liên kết `<a href="/crm">CRM công việc</a>` vào thanh điều hướng sau đăng nhập.
3. Đẩy commit lên nhánh mà Vercel dùng để triển khai. Sau khi Vercel báo Ready, đăng nhập CPanel bằng tài khoản hiện tại và bấm CRM công việc.
4. Trong CRM, kiểm tra một yêu cầu báo giá hiện có, tạo đơn thử và ghi nhận khoản thu thử trên môi trường thử nghiệm. Xác nhận Tổng quan và Lịch triển khai cập nhật.

CRM dùng cấu hình Supabase và phiên đăng nhập của CPanel. Các yêu cầu báo giá hiện có được đọc trực tiếp từ bảng inquiries. Báo cáo lấy giá trị đơn theo ngày chốt và thực thu theo ngày nhận tiền, theo giờ Việt Nam.
