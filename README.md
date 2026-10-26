<<<<<<< HEAD
# IT Asset and Maintenance Management System

## Description

A full-stack application for registering IT equipment,
tracking asset assignments, and recording maintenance activities.

## Technologies

- React and TypeScript
- Vite
- Node.js and Express
- PostgreSQL
- pg database driver
- Postman

## Features

- Asset registration and inventory
- Dashboard statistics
- Search assets
- Edit and delete assets
- Maintenance and repair records
- Track asset status
- Warranty expiry tracking in dashboard statistics

## Setup

1. Install Node.js and PostgreSQL.
2. Create the database `it_asset_db`.
3. Run `database/schema.sql` against the database.
4. Run `database/seed.sql` if sample data is needed.
5. Configure `backend/.env`.
6. Install dependencies in both `backend` and `frontend`.

## Start the backend

Open a terminal:

    cd backend
    npm run dev

## Start the frontend

Open another terminal:

    cd frontend
    npm run dev

## API endpoints

GET    /api/health
GET    /api/assets
GET    /api/assets/stats
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
DELETE /api/assets/:id

GET    /api/maintenance
POST   /api/maintenance
PUT    /api/maintenance/:id

## Author

OLAYIWOLA ABDULMALIK AYOMIDE.
24/CSC/011.
=======
# IT-ASSET-MANAGEMENT
>>>>>>> origin/main
