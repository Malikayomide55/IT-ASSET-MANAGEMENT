
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "it_asset_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

pool.connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully!");
    client.release();
  })
  .catch((error) => {
    console.error("Could not connect to PostgreSQL:", error.message);
  });

module.exports = pool;
