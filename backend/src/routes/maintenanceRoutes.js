const express = require("express");

const {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
} = require("../controllers/maintenanceController");

const router = express.Router();

router.get("/", getMaintenanceRecords);
router.post("/", createMaintenanceRecord);
router.put("/:id", updateMaintenanceRecord);

module.exports = router;
