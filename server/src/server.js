const express = require("express");
const cors = require("cors");
const { Server } = require('socket.io');
const http = require('http');
const dotenv = require("dotenv");



const app = express();
const server = http.createServer(app);
const path = require('path');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
// Database connection
app.use('/uploads', express.static('uploads'));
require('./config/db');

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const walletRoutes = require('./routes/walletRoutes');
const companyRoutes = require('./routes/company');
const jobs = require('./routes/jobs');
const skillsRoutes = require('./routes/skills');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/jobs', jobs);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});




app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});