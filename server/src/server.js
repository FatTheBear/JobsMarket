require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection
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
const jobsRoutes = require('./routes/jobs');
const skillsRoutes = require('./routes/skills');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/skills', skillsRoutes);

app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});