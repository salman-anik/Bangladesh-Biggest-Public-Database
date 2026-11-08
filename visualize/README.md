# Bangladesh Public Database Visualizer & Explorer

A fast, interactive web application built with **React**, **Vite**, and **Tailwind CSS** to search, explore, and visualize 50,000+ public records across Bangladesh.

## Features

- **Standardized Administrative Hierarchy:** Browse data seamlessly via `Division > District > Upazila`.
- **Global Instant Search:** Real-time search across 53,000+ entities including:
  - 🎓 Schools, Colleges, and Madrasas (search by Name, EIIN, Phone)
  - 🏥 Hospitals, Clinics, and UHCs (search by Bed Capacity, ICU, Emergency Hotlines)
  - 🏦 Bank Branches (search by Bank Name, Branch Name, Routing Numbers, Swift Codes)
  - 🚨 Police Stations, Fire Service, and National Hotlines (999, 333, 1098, etc.)
  - 📍 Post Offices & Postal Codes (search by 4-digit code or office name)
  - 📜 Digitized Land Khatians
- **Copy to Clipboard:** 1-click copy for phone numbers, EIIN codes, and routing numbers.
- **Detailed Entity Modals:** Inspect deep metadata for any institution or service.

## Getting Started

```bash
# Navigate to the visualize directory
cd visualize

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

The optimized static production bundle will be generated in `visualize/dist/`.
