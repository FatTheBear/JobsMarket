const express = require("express");
const { getStats, getUsers, getPendingJobs, updateUserStatus, updateJobStatus } = require("../controllers/adminController.js");
const router = express.Router();

router.get('/dashboard-stats', getStats);
router.get('/users', getUsers);
router.get('/pending-jobs', getPendingJobs);

router.put('/users/:id/status', updateUserStatus);
router.put('/jobs/:id/status', updateJobStatus);

module.exports = router;