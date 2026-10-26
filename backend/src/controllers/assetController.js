const pool = require("../config/db");

const allowedStatuses = [
  "Available",
  "Assigned",
  "Under Repair",
  "Retired",
];

const assetFields = [
  "asset_tag",
  "name",
  "category",
  "brand",
  "model",
  "serial_number",
  "department",
  "assigned_to",
  "purchase_date",
  "warranty_expiry",
  "status",
  "notes",
];

function validateAsset(body, creating = false) {
  if (
    creating &&
    (!body.asset_tag?.trim() ||
      !body.name?.trim() ||
      !body.category?.trim())
  ) {
    return "Asset tag, name and category are required.";
  }

  if (
    body.status !== undefined &&
    !allowedStatuses.includes(body.status)
  ) {
    return "Invalid asset status.";
  }

  return null;
}

async function getAssets(req, res, next) {
  try {
    const search = String(req.query.search || "").trim();

    const result = await pool.query(
      `SELECT * FROM assets
       WHERE asset_tag ILIKE $1
          OR name ILIKE $1
          OR category ILIKE $1
          OR COALESCE(brand, '') ILIKE $1
          OR COALESCE(department, '') ILIKE $1
          OR COALESCE(assigned_to, '') ILIKE $1
       ORDER BY created_at DESC`,
      [`%${search}%`]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getAssetById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function createAsset(req, res, next) {
  try {
    const validationError = validateAsset(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const values = assetFields.map((field) => {
      const value = req.body[field];

      if (typeof value === "string") {
        return value.trim() || null;
      }

      return value ?? null;
    });

    const result = await pool.query(
      `INSERT INTO assets (
        asset_tag, name, category, brand, model,
        serial_number, department, assigned_to,
        purchase_date, warranty_expiry, status, notes
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, COALESCE($11, 'Available'), $12
      )
      RETURNING *`,
      values
    );

    res.status(201).json({
      success: true,
      message: "Asset registered successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "That asset tag already exists.",
      });
    }

    next(error);
  }
}

async function updateAsset(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const validationError = validateAsset(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const fields = assetFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const values = fields.map((field) => {
      const value = req.body[field];

      return typeof value === "string"
        ? value.trim() || null
        : value;
    });

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    values.push(id);

    const result = await pool.query(
      `UPDATE assets SET ${setClause}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    res.json({
      success: true,
      message: "Asset updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "That asset tag already exists.",
      });
    }

    next(error);
  }
}

async function deleteAsset(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 RETURNING id",
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    res.json({
      success: true,
      message: "Asset deleted successfully.",
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "This asset has maintenance records and cannot be deleted.",
      });
    }

    next(error);
  }
}

async function getAssetStats(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE status = 'Available'
        )::int AS available,
        COUNT(*) FILTER (
          WHERE status = 'Assigned'
        )::int AS assigned,
        COUNT(*) FILTER (
          WHERE status = 'Under Repair'
        )::int AS under_repair,
        COUNT(*) FILTER (
          WHERE status = 'Retired'
        )::int AS retired,
        COUNT(*) FILTER (
          WHERE warranty_expiry BETWEEN CURRENT_DATE
          AND CURRENT_DATE + 30
        )::int AS warranty_expiring
      FROM assets
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
};