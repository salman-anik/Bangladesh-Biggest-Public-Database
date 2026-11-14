# Bangladesh Public Database Explorer (Next.js App Router)

Interactive Next.js 15 App Router web explorer for **Bangladesh-Biggest-Public-Database**, configured with static export (`output: 'export'`, `distDir: 'dist'`) for seamless deployment on Vercel or any static host.

## Features

- **Location Explorer (494 Upazilas):** Cascading `Division → District → Upazila` drilldown covering Education, Healthcare, Banking, Emergency & Admin, Unions & Postcodes, **Land Khatians, Mouzas & 2.33 TB Google Drive Mouza Maps**, and **Governance** (UNO/District portals, Parliamentary seats, Citizen e-Services).
- **Dataset Categories Browser (22 Folders):** Browse all 22 categorized dataset directories with direct links to GitHub subfolders/files and the uncompressed Google Drive mirror.
- **Global Search & Entity Modal:** Filter across Schools/EIIN, Hospitals, Banks & Routing Numbers, Police Stations, and Postcodes.

## Commands

```bash
npm install
npm run dev      # Start Next.js dev server on http://localhost:3000
npm run build    # Export static production bundle into visualize/dist/
npm run start    # Start Next.js production server (when not using static export)
```
