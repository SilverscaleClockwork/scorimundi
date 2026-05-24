# Project Mandates: Scorimundi

## Technical Stack
- **Frontend:** Astro with SolidJS components.
- **Backend:** Hono API located in `/api` (managed as a git subtree).
- **Database:** SQLite/LibSQL with Drizzle ORM.
- **Styling:** SCSS with a focus on the "Ash and Fire" theme.

## Architecture
- **API First:** All data-heavy character sheet logic should reside in the Hono API.
- **Type Safety:** Use Hono's RPC client (`hc`) on the frontend for type-safe API interactions.
- **Persistence:** All character stats, health, and notes must be persistently stored in the database.
- **Auth:** Argon2 for hashing, JWT for sessions, with optional "Remember Me" persistence.

## Styling & UX
- **Theme:** "Ashen world reborn from fire." Use `--primary-color` (flare) for accents and ember/ash tones for cards and backgrounds.
- **Interactivity:** Maintain the mouse-glow card effect and smooth transitions between UI states (e.g., Minified Mode).
- **Responsive:** Ensure the character sheet and heroes hub remain functional on mobile.

## Development Workflow
- **Dev Environment:** Always assume a development instance (both Astro and the Hono API) is already running on the standard ports (4321 and 3001). DO NOT attempt to start, stop, or restart the development servers unless specifically instructed.
- **Unified Dev:** Use `npm run dev` from the root to start both Astro and the Hono API if a fresh start is required.
- **Migrations:** Always use `npm run db:generate` and `npm run db:migrate` within the `/api` folder for schema changes.

## References
- **SRD:** The file `@SRD_CC_v5.2.1.pdf` is the primary reference for D&D-related content that is public domain and can be freely used.
- **Rules:** While the SRD is a reference, it is NOT a hard rulebook that must be strictly followed. It provides a foundation, but the application may diverge or simplify rules for better UX or specific setting needs.
