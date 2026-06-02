const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRoutes = require("../routes/adminRoutes.js");
const authRoutes = require("../routes/authRoutes");


const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);


require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
<<<<<<< HEAD
const jobRoutes = require('./routes/jobRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
=======
const companyRoutes = require('./routes/company');
const jobsRoutes = require('./routes/jobs');
const skillsRoutes = require('./routes/skills');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/skills', skillsRoutes);

app.use('/api/auth', authRoutes);

>>>>>>> main

app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});