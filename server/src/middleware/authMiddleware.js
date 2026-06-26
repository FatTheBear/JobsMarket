const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ header Authorization (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // 2. Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');

        // 3. Lưu thông tin giải mã (id, role) vào req.user để các controller sử dụng
        req.user = decoded;

        next(); // Cho phép đi tiếp vào controller
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin permission required." });
    }
};


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: "No token provided!" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized! Invalid Token." });
        }
        
        req.user = decoded; 
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') { 
        next(); 
    } else {
        return res.status(403).json({ message: "Forbidden: Require Admin Role!" }); 
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware, 
    verifyToken,
    verifyAdmin
};
