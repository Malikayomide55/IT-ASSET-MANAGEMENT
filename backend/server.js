
require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("PostgreSQL connected successfully.");
    });
  } catch (error) {
    console.error("PostgreSQL connection failed.");
    console.error("Error name:", error.name);
    console.error("Error message:", JSON.stringify(error.message));
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    process.exit(1);
  }
}

startServer();
