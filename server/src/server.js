const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require("express");
const cors = require("cors");
const { Server } = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const authController = require('./controllers/authController');



app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


const { uploadCompany } = require('./middleware/upload');
app.post('/api/auth/register-company', uploadCompany.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 }
]), authController.registerCompany);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
// Database connection
require('./config/db');

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const walletRoutes = require("./routes/walletRoutes");
const companyRoutes = require('./routes/company');
const jobs = require('./routes/jobs');
const skillsRoutes = require('./routes/skills');
const applicationRoutes = require('./routes/applicationRoutes');
const industryRoutes = require('./routes/industryRoutes');
const newsController = require('./controllers/adminController');
const postRoutes = require('./routes/postRoutes');


app.use('/api/company', companyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobs);
app.use('/api/industries', industryRoutes);
app.use('/api/posts', postRoutes);


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});


// Thêm route lấy danh sách tin tức công khai
app.get('/api/public/news', newsController.getPublicNews); 

// Giữ nguyên route lấy chi tiết
app.get('/api/public/news/:id', newsController.getPublicNewsById);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});