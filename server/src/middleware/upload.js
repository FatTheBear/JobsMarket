const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Đảm bảo thư mục lưu trữ tồn tại
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Bộ lọc file (Chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// 4. Khởi tạo Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

const companyUploadDir = path.join(__dirname, '../../uploads/companies');
if (!fs.existsSync(companyUploadDir)) {
    fs.mkdirSync(companyUploadDir, { recursive: true });
}

const companyStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, companyUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const companyFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only images and PDF files are allowed for company documents"), false);
    }
};

const uploadCompany = multer({
    storage: companyStorage,
    fileFilter: companyFileFilter,
    limits: { fileSize: 15 * 1024 * 1024 }
});

const newsUploadDir = path.join(__dirname, '../../uploads/news');
if (!fs.existsSync(newsUploadDir)) {
    fs.mkdirSync(newsUploadDir, { recursive: true });
}

const newsStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, newsUploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadNews = multer({
    storage: newsStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { upload, uploadAvatar: upload, uploadCompany, uploadNews };

module.exports = {
    upload,
    uploadAvatar: upload,
    uploadCompany,
    uploadNews
};

