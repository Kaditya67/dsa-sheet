require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Dev permissive
    },
    credentials: true,
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

// Start server
app.listen(PORT, () => console.log(`🚀 DSA Sheet Server running on port ${PORT}`));

