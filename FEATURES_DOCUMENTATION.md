# TÀI LIỆU KHẢO SÁT CHỨC NĂNG & LOGIC HỆ THỐNG JOBSMARKET

Tài liệu này trình bày chi tiết về cấu trúc component ở Frontend, các API endpoints ở Backend và logic xử lý nghiệp vụ cơ bản của 4 phân hệ chính trong hệ thống JobsMarket: **Candidate Profile**, **Community Post**, **My Wallet**, và **Gói Đăng Tin (Job Posting Packages)**.

---

## 1. Candidate Profile (Hồ sơ ứng viên)

Phân hệ này cho phép ứng viên quản lý thông tin cá nhân, cập nhật hồ sơ năng lực, tải lên CV để phục vụ cho việc ứng tuyển và theo dõi trạng thái hồ sơ của mình.

### A. Cấu trúc Component & Giao diện (Frontend)
Các file được tổ chức tại thư mục `client/src/pages/CandidateProfile/`:
*   **`Candidate_profile.jsx` (Layout chính):**
    *   Đóng vai trò là container bọc ngoài. Cung cấp thanh điều hướng bên (Sidebar) để chuyển đổi giữa các tab công việc.
    *   Tích hợp danh sách thông báo của ứng viên (Real-time & DB stored) với các hành động đọc thông báo.
    *   Sử dụng `<Outlet>` của `react-router-dom` để truyền dữ liệu trạng thái hồ sơ (`profileData`, `skills`, `educations`, `workExperiences`...) xuống các component con mà không cần gọi lại API.
*   **`CandidateMyProfile.jsx` (Xem thông tin cá nhân):**
    *   Hiển thị thông tin cá nhân cơ bản dưới dạng xem nhanh (Read-only view).
    *   Tích hợp component `PostCreator` để ứng viên có thể viết bài đăng cộng đồng trực tiếp từ trang cá nhân của mình.
    *   Hiển thị danh sách các bài đăng cá nhân thông qua `CandidatePosts`.
*   **`CandidateAccountSettings.jsx` (Chỉnh sửa hồ sơ & Cấu hình):**
    *   Chứa các form cập nhật thông tin cá nhân chi tiết.
    *   Tích hợp các component con quản lý danh sách học vấn (`CandidateEducation.jsx`), kinh nghiệm (`CandidateExperience.jsx`), kỹ năng (`CandidateSkills.jsx`).
    *   Hỗ trợ quản lý thông tin khác bao gồm Ngoại ngữ (Languages), Chứng chỉ (Certifications) và Giải thưởng (Awards).
    *   Cho phép đổi mật khẩu tài khoản và bật/tắt hiển thị số điện thoại liên hệ (`hidePhone`).
*   **`CandidateCV.jsx` & `CandidateManageCVs.jsx` (Quản lý CV):**
    *   Cho phép người dùng kéo thả hoặc chọn file từ máy tính để tải lên CV.
    *   Chỉ chấp nhận định dạng file: `.pdf`, `.doc`, `.docx` với dung lượng tối đa 10MB.
    *   Hiển thị danh sách các CV đã tải lên, cho phép tải xuống hoặc xóa CV.
*   **`CandidateExportModal.jsx` (Xuất bản CV):**
    *   Cung cấp tính năng chuyển đổi dữ liệu hồ sơ cá nhân hiện tại thành CV chuyên nghiệp dưới định dạng Word (`.doc`) hoặc lưu/in dưới dạng PDF (`.pdf`).
*   **`CandidateAppliedJobs.jsx` & `CandidateApplications.jsx` (Lịch sử ứng tuyển):**
    *   Hiển thị các vị trí công việc ứng viên đã nộp hồ sơ cùng với CV tương ứng đã sử dụng.
    *   Cập nhật trạng thái ứng tuyển thực tế từ nhà tuyển dụng: `Applied` (Đã nộp), `Reviewing` (Đang duyệt), `Interviewing` (Đang phỏng vấn), `Offered` (Được nhận), `Rejected` (Bị từ chối).

### B. Logic xử lý phía Backend
*   **Database Schema:**
    *   `Candidate_Profile`: Lưu trữ thông tin cá nhân chính (họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ, ảnh đại diện, phần giới thiệu...).
    *   `Candidate_Education` & `Candidate_Experience`: Lưu lịch sử học tập và làm việc có liên kết khóa ngoại với `Candidate_Profile`.
    *   `candidate_skill`: Bảng trung gian liên kết giữa ứng viên với bảng kỹ năng `skill`, lưu thêm cấp độ kỹ năng (`level` từ 0 - 100%).
*   **API Endpoints chính (`server/src/routes/candidateRoutes.js` & `candidateController.js`):**
    *   `GET /api/candidate/profile`: Trích xuất thông tin hồ sơ của ứng viên đăng nhập. Backend tự động tính toán tổng thời gian làm việc để đưa ra trường `years_of_experience` (số năm kinh nghiệm dưới dạng số thực làm tròn 1 chữ số thập phân).
    *   `PUT /api/candidate/profile`: Nhận payload cập nhật hồ sơ, xử lý tải ảnh đại diện thông qua middleware `uploadAvatar` (lưu trữ vật lý trên server và trả về đường dẫn URL).
    *   `POST /api/candidate/upload-cv`: Sử dụng middleware `uploadCv` kiểm tra loại file và dung lượng trước khi lưu vào thư mục `/uploads/cvs` và lưu thông tin vào bảng `cv`.
    *   `POST /api/candidate/apply`: Ghi nhận ứng viên nộp hồ sơ vào tin tuyển dụng. Kiểm tra xem ứng viên đã ứng tuyển công việc này chưa để tránh gửi trùng lặp.

---

## 2. Community Post (Bài viết cộng đồng)

Mạng xã hội nội bộ dành cho ứng viên và nhà tuyển dụng giao lưu, chia sẻ kinh nghiệm, tìm kiếm cơ hội và quảng bá thương hiệu.

### A. Cấu trúc Component & Giao diện (Frontend)
*   **`CommunityFeed.jsx` (Bảng tin):**
    *   Tải danh sách bài đăng từ server và hiển thị theo luồng thời gian mới nhất.
    *   Tích hợp Lightbox đa phương tiện: Cho phép click vào ảnh/video để phóng to, có nút chuyển trang (`Next` / `Prev`) nếu bài đăng có nhiều ảnh/video.
    *   Tích hợp phần Bình luận bên dưới mỗi bài viết dạng thu gọn/mở rộng.
*   **`PostCreator.jsx` (Khung soạn thảo bài viết):**
    *   Giao diện nhập văn bản có đính kèm tệp tin đa phương tiện.
    *   Giới hạn tải lên tối đa 10 ảnh hoặc video. Hỗ trợ hiển thị ảnh thu nhỏ (thumbnail) cùng nút xóa nhanh trước khi thực hiện bấm đăng bài.

### B. Logic xử lý phía Backend
*   **Database Schema:**
    *   `Community_Post`: Lưu trữ nội dung bài viết (`content`), ID người đăng (`user_id`), ID bài viết gốc (`parent_post_id` - dùng cho chia sẻ/repost) và thời gian tạo.
    *   `Post_Media`: Lưu trữ các file đính kèm (`media_url`, `media_type`: 'image'/'video').
    *   `Post_Like` & `Post_Comment`: Quản lý lượt thích và bình luận trên bài đăng.
*   **API Endpoints chính (`server/src/routes/postRoutes.js`):**
    *   `POST /api/posts/`: Đăng bài viết mới. Sử dụng Multer cấu hình lưu ảnh/video vào thư mục `uploads/posts`. Thực hiện validate định dạng nghiêm ngặt (chỉ nhận hình ảnh `jpeg|jpg|png|gif|webp` và video `mp4|mov|avi|mkv|webm`). Ghi dữ liệu đồng thời vào bảng `Community_Post` và bảng `Post_Media`.
    *   `DELETE /api/posts/:id`: Xóa bài viết. Controller sẽ kiểm tra quyền sở hữu (chỉ người đăng hoặc Admin hệ thống mới được xóa). Trước khi xóa bản ghi khỏi DB, server sẽ truy vấn bảng `Post_Media` để tìm tất cả các file đính kèm liên quan và dùng hàm `fs.unlinkSync` xóa bỏ hoàn toàn file vật lý trên ổ cứng server.
    *   `POST /api/posts/:id/like`: Cơ chế Toggle Like - Nếu chưa thích thì thêm bản ghi vào `Post_Like`, nếu thích rồi thì xóa bản ghi đó đi.
    *   `POST /api/posts/:id/comments`: Tạo bình luận mới. Hỗ trợ tạo phản hồi (Reply) cho một bình luận khác bằng cách liên kết thông qua trường khóa ngoại `parent_comment_id`.
    *   `POST /api/posts/:id/repost`: Tạo một bài đăng mới có liên kết `parent_post_id` trỏ tới bài viết gốc để thực hiện chức năng chia sẻ.

---

## 3. My Wallet (Ví điện tử và Nạp xu)

Hệ thống thanh toán bằng tiền ảo (Coins) dùng để thanh toán cho các dịch vụ đăng tin tuyển dụng nổi bật và các tính năng nâng cao khác của hệ thống.

### A. Cấu trúc Component & Giao diện (Frontend)
*   **`CompanyWallet.jsx` / `CandidateWallet.jsx` (Giao diện ví):**
    *   Hiển thị số dư xu hiện tại (`coins`) và tích hợp danh sách lịch sử giao dịch (Transaction History).
    *   Có tab chuyển đổi nhanh sang giao diện nạp tiền (`topup`).
*   **`RechargeCoins.jsx` (Giao diện nạp xu):**
    *   Hiển thị danh sách các gói nạp xu lấy từ cơ sở dữ liệu (ví dụ: 100 Coins, 500 Coins kèm giá trị VND quy đổi).
    *   Khi người dùng chọn một gói nạp, nút thanh toán PayPal của thư viện `@paypal/react-paypal-js` sẽ xuất hiện để tiến hành giao dịch.
*   **`WalletContext.jsx` (Quản lý trạng thái Ví):**
    *   Cung cấp các hàm gọi API nạp/tiêu xu và đồng bộ lại số dư xu ngay lập tức sau khi giao dịch thành công.

### B. Logic xử lý phía Backend
*   **Database Schema:**
    *   Thông tin ví lưu tại cột `coins` (kiểu dữ liệu INT) nằm trực tiếp ở bảng `User`.
    *   `Coin_Exchange_Fee`: Cấu hình các gói quy đổi xu: ID gói, giá VND (`price_vnd`), lượng xu nhận được (`coins`), nhãn dán khuyến mãi (`label`), và trạng thái kích hoạt (`is_active`).
    *   `Transaction`: Ghi nhận lịch sử giao dịch: Số tiền fiat (`amount_fiat`), số lượng xu (`coins`), loại giao dịch (`deposit`/`spend`/`refund`), phương thức thanh toán (`paypal`/`system`/`bank_transfer`), trạng thái (`pending`/`completed`/`failed`), mã tham chiếu (`reference_code`) và mã hóa đơn của PayPal (`paypal_order_id`).
*   **Quy trình nạp xu qua cổng PayPal (`walletController.js`):**
    1.  **Tạo đơn hàng (`POST /api/wallet/paypal/create-order`):**
        *   Nhận `feeId` của gói xu người dùng chọn.
        *   Truy vấn lấy thông tin giá tiền VND của gói từ bảng `Coin_Exchange_Fee`.
        *   Quy đổi số tiền VND sang USD (Sử dụng tỷ giá cấu hình mặc định).
        *   Gọi PayPal SDK khởi tạo đơn hàng với trạng thái `CAPTURE` và nhận về `orderID` từ PayPal.
        *   Ghi một bản ghi giao dịch mới vào bảng `Transaction` với trạng thái `pending` và lưu trữ `paypal_order_id`.
    2.  **Khớp đơn hàng (`POST /api/wallet/paypal/capture-order`):**
        *   Nhận `orderID` từ phía frontend gửi lên sau khi người dùng xác nhận thanh toán trên PayPal.
        *   Gọi PayPal SDK để xác thực và bắt giữ (Capture) tiền từ ví khách hàng.
        *   Nếu trạng thái trả về là `COMPLETED`, backend sẽ thực hiện xử lý cộng xu an toàn trong database transaction:
            *   Sử dụng câu lệnh khóa dòng `SELECT ... FOR UPDATE` truy vấn giao dịch theo `paypal_order_id` để ngăn ngừa tình trạng cộng xu 2 lần (Double capture) nếu có lỗi mạng gửi trùng yêu cầu.
            *   Cập nhật trạng thái giao dịch trong bảng `Transaction` từ `pending` sang `completed`.
            *   Cập nhật cột `coins` trong bảng `User` cộng thêm lượng xu tương ứng.
            *   Commit transaction và trả về kết quả thành công cho Client.

---

## 4. Gói Post Bài (Job Posting Packages)

Quy định và giới hạn tin đăng của Nhà tuyển dụng thông qua việc mua các gói dịch vụ nổi bật bằng xu.

### A. Cấu trúc Gói dịch vụ & Chi phí
Hệ thống JobsMarket quy định 3 hình thức đăng tin:
1.  **Gói Free (Mặc định):**
    *   Chi phí: **0 xu**.
    *   Thời hạn: Không giới hạn thời gian.
    *   Giới hạn: Tối đa **1 tin tuyển dụng trong vòng 24 giờ**.
2.  **Gói Pro_Day (Đăng tin nổi bật theo ngày):**
    *   Chi phí: **20 xu**.
    *   Thời hạn: Có hiệu lực trong **24 giờ** kể từ thời điểm đăng ký mua gói thành công.
    *   Giới hạn: Tối đa **2 tin tuyển dụng trong vòng 24 giờ**.
3.  **Gói Pro_Month (Đăng tin nổi bật theo tháng):**
    *   Chi phí: **500 xu** (Tiết kiệm hơn 16% so với mua lẻ theo ngày).
    *   Thời hạn: Có hiệu lực trong **30 ngày** (720 giờ) kể từ thời điểm đăng ký mua gói thành công.
    *   Giới hạn: Tối đa **2 tin tuyển dụng trong vòng 24 giờ**.

### B. Logic xử lý Đăng tin & Trừ xu (`server/src/routes/jobs.js`)
Khi nhà tuyển dụng gửi yêu cầu đăng tin mới qua API `POST /api/jobs`, hệ thống sẽ xử lý kiểm tra và thực hiện trừ xu theo quy trình sau:

1.  **Xác thực thông tin:** Kiểm tra tài khoản người dùng có quyền đăng tuyển và đã khởi tạo cấu hình công ty chưa.
2.  **Xác nhận trạng thái gói Pro:**
    *   Truy vấn trường `pro_package` và `pro_expired_at` trong bảng `Company`. Gói Pro được xác định là đang hoạt động nếu trường `pro_expired_at` lớn hơn thời điểm hiện tại (`pro_expired_at >= NOW()`).
3.  **Xử lý thanh toán mua gói Pro mới:**
    *   Nếu gói Pro đã hết hạn hoặc chưa có, và người dùng gửi payload yêu cầu đăng tin thuộc gói `Pro_Day` hoặc `Pro_Month`:
        *   Mở Database Transaction. Khóa dòng thông tin số dư xu của User (`User` table với cú pháp `FOR UPDATE`).
        *   Nếu số xu hiện tại nhỏ hơn số xu yêu cầu của gói (20 xu cho `Pro_Day` hoặc 500 xu cho `Pro_Month`) -> Rollback transaction, hủy bỏ quy trình và trả về phản hồi lỗi.
        *   Nếu đủ xu, tiến hành trừ xu trong bảng `User`.
        *   Tạo bản ghi giao dịch trong bảng `Transaction` (loại giao dịch là `spend`, phương thức `system`, trạng thái `completed`, mã tham chiếu dạng `PRO_SUB_...`).
        *   Cập nhật thông tin gói và hạn dùng trong bảng `Company`: thiết lập `pro_package = post_type` và `pro_expired_at = NOW() + 24 giờ` (cho gói ngày) hoặc `NOW() + 30 ngày` (cho gói tháng).
4.  **Kiểm soát giới hạn tần suất đăng tin (Rate Limiting):**
    *   Đếm số lượng tin tuyển dụng mà nhà tuyển dụng này đã đăng trong vòng 24 giờ qua (`created_at >= NOW() - INTERVAL 1 DAY`).
    *   Nếu gói Pro đang kích hoạt: Nếu số tin đã đăng trong 24 giờ qua từ 2 tin trở lên -> Hệ thống từ chối đăng tin mới, thông báo lỗi: *"Pro plan limit exceeded: Maximum 2 job postings per 24 hours."*
    *   Nếu đang sử dụng gói Free: Nếu số tin đã đăng trong 24 giờ qua từ 1 tin trở lên -> Từ chối đăng tin mới, thông báo lỗi: *"Free account limit exceeded: Maximum 1 job posting per 24 hours. Please upgrade to Pro plan to post more."*
5.  **Ghi nhận tin đăng thành công:**
    *   Nếu vượt qua các bước kiểm tra giới hạn trên, tin tuyển dụng được chèn vào bảng `Job_Posting` với trạng thái mặc định là `Pending` (chờ duyệt). Đồng thời lưu cờ trạng thái `is_pro` vào trường JSON `metadata` của tin tuyển dụng để hỗ trợ hiển thị nổi bật trên giao diện tìm kiếm việc làm phía Client.
    *   Thêm danh sách các yêu cầu kỹ năng liên quan vào bảng `Job_Skill` và ngành nghề vào bảng `Job_Industry`.
    *   Commit transaction để chính thức hoàn tất quá trình đăng tin và thanh toán.

---

## 5. Các API bên thứ ba sử dụng (Third-Party APIs)

Hệ thống JobsMarket sử dụng các API bên ngoài sau đây để tối ưu hóa dữ liệu nhập liệu và hỗ trợ thanh toán trực tuyến:

1.  **PayPal Checkout API:**
    *   **Endpoints:** Sandbox (`https://api-m.sandbox.paypal.com`) và Live.
    *   **Mục đích:** Khởi tạo đơn hàng (`OrdersCreateRequest`) và khớp thanh toán (`OrdersCaptureRequest`) của ứng viên/doanh nghiệp khi thực hiện nạp xu trực tuyến.
    *   **Nơi sử dụng:** Component `RechargeCoins.jsx` (Frontend) và controller `walletController.js` (Backend).
2.  **Open API Provinces (Vietnam):**
    *   **URL:** `https://provinces.open-api.vn/api`
    *   **Mục đích:** Tải thông tin danh sách Tỉnh/Thành phố, Quận/Huyện, Phường/Xã tại Việt Nam cho chức năng tự động gợi ý (autocomplete) địa chỉ làm việc hoặc địa chỉ cá nhân.
    *   **Nơi sử dụng:** Component `JobPosting.jsx` (đăng tuyển dụng) và các form khai báo thông tin địa điểm làm việc.
3.  **HipoLabs Universities API:**
    *   **URL:** `http://universities.hipolabs.com/search?country=Vietnam`
    *   **Mục đích:** Tải danh sách toàn bộ các trường đại học tại Việt Nam để tự động gợi ý cho ứng viên khi điền thông tin Học vấn (Education).
    *   **Nơi sử dụng:** Component `CandidateEducation.jsx`.
4.  **GitHub Language List API:**
    *   **URL:** `https://raw.githubusercontent.com/umpirsky/language-list/master/data/en/language.json`
    *   **Mục đích:** Lấy danh sách các ngôn ngữ trên thế giới để tự động gợi ý ngôn ngữ mà ứng viên có thể sử dụng.
    *   **Nơi sử dụng:** Component `CandidateAccountSettings.jsx`.
5.  **RestCountries API:**
    *   **URL:** `https://api.restcountries.com/countries/v5`
    *   **Mục đích:** Lấy danh sách quốc gia toàn thế giới phục vụ chức năng gợi ý Quốc tịch (Nationality). API này yêu cầu mã khóa xác thực (`REST_COUNTRIES_API_KEY`) cấu hình tại biến môi trường của backend và được lưu trữ đệm (Cache) trên server trong vòng 24 giờ.
    *   **Nơi sử dụng:** API `GET /api/candidate/countries` thông qua `candidateController.js`.

---

## 6. Các thư viện & Packages hỗ trợ (Libraries & Dependencies)

Để vận hành các phân hệ trên, dự án đã cài đặt và sử dụng các thư viện bổ trợ sau:

### A. Phía Client (Frontend) - `client/package.json`
*   **`react` & `react-dom` (^18.3.1):** Thư viện nền tảng xây dựng giao diện Single Page Application (SPA).
*   **`react-router-dom` (^7.15.1):** Quản lý định tuyến trang web, luồng chuyển đổi các trang hồ sơ, cài đặt và bảng tin cộng đồng.
*   **`axios` (^1.16.1):** Thư viện gửi các HTTP Requests (GET, POST, PUT, DELETE) lên server một cách bất đồng bộ để tương tác dữ liệu.
*   **`bootstrap` (^5.3.8) & `mdb-react-ui-kit` (^10.0.0):** Framework CSS hỗ trợ xây dựng giao diện nhanh, responsive cho các trang cá nhân và bảng tin.
*   **`@fortawesome/fontawesome-free` (^7.2.0):** Bộ icon trực quan biểu thị các thẻ ví xu, lịch sử, kỹ năng, kinh nghiệm.
*   **`@paypal/react-paypal-js` (^9.3.0):** Thư viện tích hợp nút thanh toán PayPal trực tiếp vào giao diện React một cách dễ dàng và an toàn.
*   **`socket.io-client` (^4.8.3):** Client kết nối Websockets thời gian thực với server để cập nhật số lượng thông báo mà không cần tải lại trang.
*   **`chart.js`, `react-chartjs-2`, `recharts`:** Hiển thị biểu đồ phân tích lượt ứng tuyển hoặc thông tin tài chính ví (dành cho HR Dashboard).
*   **`lucide-react` (^0.525.0):** Cung cấp các biểu tượng tối giản, sắc nét phục vụ thiết kế UI hiện đại.

### B. Phía Server (Backend) - `server/package.json`
*   **`express` (^4.19.2):** Framework web tối giản quản lý hệ thống API router và middlewares.
*   **`mysql2` (^3.22.3):** Driver kết nối cơ sở dữ liệu MySQL, hỗ trợ cơ chế Connection Pool tối ưu hiệu năng truy vấn đồng thời và xử lý giao dịch an toàn (Transaction).
*   **`@paypal/checkout-server-sdk` (^1.0.3) & `@paypal/paypal-server-sdk` (^2.3.0):** SDK chính thức của PayPal phía Node.js để tương tác bảo mật, tạo hóa đơn nạp xu và xác thực capture tiền từ tài khoản PayPal của khách hàng.
*   **`multer` (^2.1.1):** Middleware xử lý tải lên các tệp tin dạng `multipart/form-data` như hình ảnh đại diện ứng viên, file đính kèm bài viết và tài liệu CV (.pdf, .doc, .docx).
*   **`jsonwebtoken` (^9.0.3):** Quản lý sinh mã Token xác thực và giải mã Token JWT, đảm bảo bảo mật thông tin các phiên đăng nhập của người dùng.
*   **`bcrypt` (^6.0.0) & `bcryptjs` (^3.0.3):** Mã hóa mật khẩu một chiều (password hashing) trước khi lưu trữ vào database.
*   **`joi` (^18.2.1):** Thư viện validate dữ liệu đầu vào phía backend (ví dụ: kiểm tra tính đúng đắn của dữ liệu hồ sơ cá nhân khi làm wizard setup).
*   **`nodemailer` (^8.0.10):** Hỗ trợ kết nối máy chủ gửi email SMTP để gửi mã xác thực đăng ký hoặc các thông báo quan trọng qua hòm thư điện tử.
*   **`socket.io` (^4.8.3):** Quản lý kết nối Websockets hai chiều, đẩy thông tin cập nhật trạng thái ứng tuyển hoặc bình luận bài đăng mới tới client theo thời gian thực.
*   **`cors` (^2.8.6):** Cấu hình chia sẻ tài nguyên nguồn chéo cho phép Client (cổng 5177/Vite) gọi API từ Server (cổng 5000) mà không bị trình duyệt chặn.
*   **`dotenv` (^16.6.1):** Quản lý cấu hình biến môi trường bảo mật như `JWT_SECRET`, `REST_COUNTRIES_API_KEY` hay thông tin kết nối Database.

