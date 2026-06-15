const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

const authMiddleware = (req, res, next) => {

    console.log("AUTH HEADER FROM CLIENT:", req.headers.authorization);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("TOKEN AFTER SPLIT:", token);


    if (!token) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'SECRET_KEY'
        );

        console.log("DECODED USER:", decoded);

        req.user = decoded;

        next();

    } catch(error) {

        console.log("JWT ERROR:", error.message);

        return res.status(403).json({
            message:"Invalid or expired token."
        });

    }
};

module.exports = { verifyToken };