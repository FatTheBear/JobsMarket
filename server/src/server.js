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


app.use('/api/auth', authRoutes);


app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});