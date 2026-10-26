const pool = require("../config/db");

const validStatuses = ["Open", "In Progress", "Completed"];

async function getMaintenanceRecords(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        m.*,
        a.asset_tag,
        a.name AS asset_name
      FROM maintenance_records m
      JOIN assets a ON a.id = m.asset_id
      ORDER BY m.reported_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function createMaintenanceRecord(req, res, next) {
  const { asset_id, issue_description, technician, repair_cost } =
    req.body;

  if (!asset_id || !issue_description?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Asset ID and issue description are required.",
    });
  }

  const cost = Number(repair_cost ?? 0);

  if (!Number.isFinite(cost) || cost < 0) {
    return res.status(400).json({
      success: false,
      message: "Repair cost must be a valid non-negative number.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const asset = await client.query(
      "SELECT id, status FROM assets WHERE id = $1 FOR UPDATE",
      [asset_id]
    );

    if (!asset.rowCount) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    const record = await client.query(
      `INSERT INTO maintenance_records
       (asset_id, issue_description, technician, repair_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        asset_id,
        issue_description.trim(),
        technician?.trim() || null,
        cost,
      ]
    );

    if (asset.rows[0].status !== "Retired") {
      await client.query(
        "UPDATE assets SET status = 'Under Repair' WHERE id = $1",
        [asset_id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Maintenance record created.",
      data: record.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
}

async function updateMaintenanceRecord(req, res, next) {
  const id = Number(req.params.id);
  const { status, technician, repair_cost } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid maintenance record ID.",
    });
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid maintenance status.",
    });
  }

  if (
    repair_cost !== undefined &&
    (!Number.isFinite(Number(repair_cost)) ||
      Number(repair_cost) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Repair cost must be non-negative.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM maintenance_records WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (!existing.rowCount) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Maintenance record not found.",
      });
    }

    const current = existing.rows[0];
    const nextStatus = status ?? current.status;
    const nextCost = repair_cost ?? current.repair_cost;
    const nextTechnician =
      technician === undefined ? current.technician : technician;

    const result = await client.query(
      `UPDATE maintenance_records
       SET status = $1,
           repair_cost = $2,
           technician = $3,
           completed_at = CASE
             WHEN $1 = 'Completed'
             THEN COALESCE(completed_at, NOW())
             ELSE NULL
           END
       WHERE id = $4
       RETURNING *`,
      [nextStatus, nextCost, nextTechnician, id]
    );

    if (nextStatus === "Completed") {
      const otherOpen = await client.query(
        `SELECT 1
         FROM maintenance_records
         WHERE asset_id = $1
           AND id <> $2
           AND status <> 'Completed'
         LIMIT 1`,
        [current.asset_id, id]
      );

      if (!otherOpen.rowCount) {
        await client.query(
          `UPDATE assets
           SET status = 'Available'
           WHERE id = $1 AND status = 'Under Repair'`,
          [current.asset_id]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Maintenance record updated.",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
};