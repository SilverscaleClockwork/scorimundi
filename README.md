# Scorimundi

Scorimundi is a character sheet management application for TTRPGs, specifically focused on a "Ashen world reborn from fire" theme. It features a high-performance frontend built with Astro and SolidJS, and a type-safe backend powered by Hono.

## 🚀 Project Overview

- **Theme:** Ash and Fire - an ashen world reborn from fire.
- **Tech Stack:**
  - **Frontend:** Astro with SolidJS components.
  - **Backend:** Hono API (Node.js).
  - **Database:** SQLite/LibSQL with Drizzle ORM.
  - **Styling:** SCSS with focus on ember/ash tones and mouse-glow interactive cards.

## 🛠️ Development

### Prerequisites

- Node.js >= 22.12.0
- npm

### Running the Project

To start both the Astro frontend and the Hono API concurrently, run:

```sh
npm run dev
```

The frontend will be available at `http://localhost:4321` and the API at `http://localhost:3001/api`. Note that Astro proxies `/api` requests to the backend during development.

### Backend & Database

The API is located in the `/api` directory.

- **Schema Changes:**
  1. Modify `api/src/db/schema.ts`.
  2. Run `npm run db:generate` in the `/api` directory.
  3. Run `npm run db:migrate` in the `/api` directory.

### Available Scripts

- `npm install`: Install all dependencies.
- `npm run dev`: Start Astro and the API concurrently.
- `npm run build`: Build the frontend for production.
- `npm run preview`: Preview the production build.

## 🚀 CI/CD

A GitHub Action is configured to automatically build and push the monorepo Docker image to Scaleway Container Registry on every push to `main`.

### Required GitHub Secrets

To enable this, ensure the following secrets are set in your GitHub repository:
- `SCALEWAY_ACCESS`: Your Scaleway access key.
- `SCALEWAY_SECRET`: Your Scaleway secret key.
- `SCALEWAY_PROJECT_ID`: Your Scaleway project ID.
