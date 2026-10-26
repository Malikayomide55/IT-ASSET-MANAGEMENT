require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("PostgreSQL connected successfully.");
    });
  } catch (error) {
    console.error("Could not connect to PostgreSQL.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();