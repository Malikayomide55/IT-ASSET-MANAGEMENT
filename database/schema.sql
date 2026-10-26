CREATE DATABASE it_asset_db;

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    brand VARCHAR(80),
    model VARCHAR(100),
    serial_number VARCHAR(120),
    department VARCHAR(100),
    assigned_to VARCHAR(150),
    purchase_date DATE,
    warranty_expiry DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Available'
        CHECK (status IN (
            'Available', 'Assigned', 'Under Repair', 'Retired'
        )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL
        REFERENCES assets(id) ON DELETE RESTRICT,
    issue_description TEXT NOT NULL,
    technician VARCHAR(150),
    repair_cost NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (repair_cost >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'In Progress', 'Completed')),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);