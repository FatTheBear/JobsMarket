const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ header Authorization (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // 2. Xác thực token (Sử dụng SECRET_KEY trùng với lúc mã hóa ở authController.js)
        const decoded = jwt.verify(token, "SECRET_KEY");

        // 3. Lưu thông tin giải mã (id, role) vào req.user để các controller sử dụng
        req.user = decoded;

        next(); // Cho phép đi tiếp vào controller
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
