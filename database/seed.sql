INSERT INTO assets (
    asset_tag, name, category, brand, model,
    department, status
)
VALUES
(
    'MFP-LAP-001', 'Office Laptop', 'Laptop',
    'HP', 'ProBook', 'ICT Department', 'Available'
),
(
    'MFP-PRN-001', 'Office Printer', 'Printer',
    'HP', 'LaserJet', 'Admin Department', 'Assigned'
),
(
    'MFP-RTR-001', 'Office Router', 'Router',
    'TP-Link', 'Archer', 'ICT Department', 'Under Repair'
)
ON CONFLICT (asset_tag) DO NOTHING;