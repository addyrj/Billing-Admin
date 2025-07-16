const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();



// Import routes
const companyRoutes = require("./routes/companyRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const purchaseProductRoutes = require("./routes/purchaseProductRoutes");
const grnRoutes = require("./routes/grnRoutes");
const debitRoutes = require("./routes/debitNoteRoutes");
const paymentRoutes = require("./routes/payment"); // Add this line

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static file serving
app.use('/api/signatures', express.static(path.join(__dirname, 'public/signatures')));
app.use('/api/payment-images', express.static(path.join(__dirname, 'public/payment-images')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api", companyRoutes);
app.use("/api", invoiceRoutes);
app.use('/api', purchaseProductRoutes);
app.use('/api', grnRoutes);
app.use('/api', debitRoutes);
app.use('/api', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});