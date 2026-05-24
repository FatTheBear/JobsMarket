const express = require('express');
const cors = require('cors');
require('dotenv').config();

const companyRoutes = require('./routes/company');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/company', companyRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'JobsMarket API đang chạy ✅', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
