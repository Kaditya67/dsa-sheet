require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// CORS configuration - support all Vercel previews and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile, curl, etc.)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".vercel.app") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback permissive
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tags", require("./routes/tags"));
app.use("/api/problems", require("./routes/problems"));

// Health check route
app.get("/", (req, res) => {
  res.send("✅ DSA Sheet Tracker API is active and running!");
});

// For local server execution
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 DSA Sheet Server running on port ${PORT}`));
}

// Export for Vercel Serverless Function
module.exports = app;
