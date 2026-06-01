const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Không tìm thấy token'
        });
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');

        req.user = decoded;

        console.log('TOKEN OK:', decoded);

        next();
    } catch (err) {
        console.error('JWT ERROR:', err.message);

        return res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn!'
        });
    }
};