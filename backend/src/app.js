const express = require("express");
const cors = require("cors");

const assetRoutes = require("./routes/assetRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IT Asset Management API is running.",
  });
});

app.get("/api/health", async (req, res) => {
  const pool = require("./config/db");

  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "API and PostgreSQL are connected.",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

app.use("/api/assets", assetRoutes);
app.use("/api/maintenance", maintenanceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;