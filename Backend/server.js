const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Add this line
require("dotenv").config();

const companyRoutes = require("./routes/companyRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const purchaseProductRoutes = require("./routes/purchaseProductRoutes");

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Add this static file serving middleware - CRUCIAL FOR IMAGES
app.use('/api/signatures', express.static(path.join(__dirname, 'public/signatures')));

// Routes
app.use("/api/auth", authRoutes); // Public auth routes
app.use("/api", productRoutes); // Public product routes
app.use("/api", companyRoutes);
app.use("/api", invoiceRoutes);
app.use('/api', purchaseProductRoutes)

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signatures/test.png'));
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});