const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController.js");
const { verifyToken } = require("../middleware/authMiddleware.js");
// Định nghĩa API tạo bài đăng tuyển dụng
router.post("/create", verifyToken, jobController.createJob);

module.exports = router;

