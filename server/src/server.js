import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);


require('./config/db');


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


app.get("/", (req, res) => {
  res.send("JobsMarket API running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});