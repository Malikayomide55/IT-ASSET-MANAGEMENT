# IT Asset and Maintenance Management System

## Description

A full-stack application for registering IT equipment, tracking asset assignments, and recording maintenance activities.

## Technologies

- React and TypeScript
- Vite
- Node.js and Express
- PostgreSQL
- `pg` database driver
- Postman

## Features

- Asset registration and inventory
- Dashboard statistics
- Asset search
- Edit and delete assets
- Maintenance and repair records
- Asset status tracking
- Warranty expiry tracking in dashboard statistics

## Setup

1. Install Node.js and PostgreSQL.
2. Create the database `it_asset_db`.
3. Run `database/schema.sql` against the database.
4. Run `database/seed.sql` if sample data is needed.
5. Configure `backend/.env`.
6. Install dependencies in both the `backend` and `frontend` directories.

## Start the Backend

Open a terminal and run:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

## Start the Frontend

Open another terminal and run:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

## API Endpoints

### Assets

- `GET /api/health`
- `GET /api/assets`
- `GET /api/assets/stats`
- `GET /api/assets/:id`
- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`

### Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`
- `PUT /api/maintenance/:id`

## Author

OLAYIWOLA ABDULMALIK AYOMIDE

Matric Number: 24/CSC/011
