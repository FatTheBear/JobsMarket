const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Đảm bảo thư mục lưu trữ CV tồn tại
const uploadDir = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình nơi lưu và cách đặt tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Lưu file vào thư mục uploads/cvs
    },
    filename: function (req, file, cb) {
        // Đặt tên file tự động: Thời gian hiện tại + Tên gốc của file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Chốt chặn an ninh: Chỉ cho phép file PDF, DOC, DOCX lọt qua
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname || mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file định dạng PDF, DOC, hoặc DOCX!'));
    }
};

// 4. Tạo bộ máy đóng gói
const uploadCv = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn kích thước tối đa 10MB
});

module.exports = uploadCv;
