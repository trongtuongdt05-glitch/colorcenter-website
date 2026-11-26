# Color Center trên Vercel

Bản Next.js này gồm website, ảnh bìa 3 tấm, dải logo đối tác, CPanel và biểu mẫu báo giá.
Vercel chạy website. Supabase lưu nội dung, ảnh tải lên, tài khoản quản trị và yêu cầu báo giá.

## 1. Tạo dự án Supabase

Tạo một dự án Supabase cho Color Center. Trong SQL Editor, chạy nội dung của `supabase/setup.sql`.
Trong Authentication → Users, tạo tài khoản quản trị bằng email và mật khẩu. Xác nhận email tài khoản.
Trong Authentication → Providers, tắt đăng ký công khai nếu chỉ dùng một tài khoản quản trị.

## 2. Đưa mã nguồn lên GitHub và kết nối Vercel

Giải nén và đưa toàn bộ nội dung trong thư mục dự án lên một repository GitHub. Trong Vercel,
chọn Add New → Project, nhập repository, chọn framework Next.js, Root Directory là thư mục có
`package.json`, và Node.js 22.x. Thêm các biến dưới đây trước khi Deploy.
Có thể dùng `npm install`, `npm run build`, `npm start` để chạy thử trên máy.

| Biến | Giá trị |
| --- | --- |
| SUPABASE_URL | Project URL, dạng https://your-project.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | Publishable key, hoặc khóa anon cũ |
| SUPABASE_SECRET_KEY | Secret key, hoặc khóa service_role cũ. Đánh dấu Sensitive trong Vercel |
| ADMIN_EMAIL | Đúng email đã tạo trong Authentication |
| RESEND_API_KEY | Tùy chọn, API key gửi thư Resend. Đánh dấu Sensitive |
| LEAD_FROM_EMAIL | Tùy chọn, địa chỉ gửi trên tên miền đã xác minh với Resend |

Nhập biến vào Vercel. Giữ khóa bí mật trong cấu hình máy chủ và tránh đưa vào Git.
Khi thêm hoặc đổi biến sau lần Deploy đầu, triển khai lại để áp dụng.

## 3. Kiểm tra sau khi triển khai

- Mở địa chỉ Vercel và kiểm tra trang chủ, dịch vụ, dự án và liên hệ.
- Vào /cpanel, đăng nhập bằng tài khoản Supabase. Thử lưu nội dung và tải ảnh (tối đa 4 MB).
- Gửi một yêu cầu báo giá thử rồi kiểm tra danh sách trong CPanel.
- Muốn nhận thông báo email, cấu hình hai biến Resend và nhập email nhận trong CPanel → Email nhận lead.
- Chỉ chuyển tên miền colorcenter.com.vn sau khi đã kiểm tra bản Vercel.

Nội dung mặc định và ảnh có trong mã nguồn được đóng gói. Bản này dùng dữ liệu Supabase mới.
Nội dung đã lưu trong CPanel cũ, ảnh tải vào kho cũ và các yêu cầu báo giá cũ cần di chuyển riêng.

## Cập nhật dự án và thư viện ảnh

Mở trực tiếp /cpanel → Dự án. Mỗi dự án có một ảnh đại diện và tối đa 12 ảnh thư viện.
Chọn nhiều ảnh từ máy trong một lần rồi bấm Lưu thay đổi sau khi tải xong.
Nếu đã có nội dung lưu trong Supabase, dùng nút Thêm dự án mẫu để thêm Con Cưng và Medical Gym.
Hai hồ sơ mẫu dùng logo làm hình minh họa. Có thể thay bằng ảnh thực tế khi có tư liệu.
Bản cập nhật dùng các bảng và kho ảnh hiện tại. Giữ nguyên biến môi trường khi triển khai lại.

## Edit Media

Vào CPanel → Edit Media để tải logo và khung video rồi lưu. Dùng PNG hoặc WebP trong suốt cho logo và khung.
Khung nên có kích thước 1080 × 1920 px và phần giữa trong suốt. Trình biên tập nằm tại /editmedia.
Ảnh xuất PNG. Video xuất MP4 hoặc WebM tùy trình duyệt, giữ âm thanh nguồn và xử lý theo thời lượng phát.
Video và ảnh nguồn được xử lý trên thiết bị. Khổ đầu ra 1080 × 1920 px, ảnh ngang được cắt từ giữa để lấp đầy khung.
