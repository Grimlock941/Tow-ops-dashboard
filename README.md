# Tow-ops-dashboard
# Tow Ops Dashboard

A real-time fleet management dashboard built for tow truck operations — live vehicle tracking, dispatch coordination, and fleet analytics in one interface.

## About

Tow Ops Dashboard is a full-stack fleet operations tool designed around how tow companies actually work: tracking trucks in real time, managing an incoming dispatch queue, and keeping tabs on driver status at a glance. Built as a proof-of-concept for a real towing business, it demonstrates a complete data flow from a live backend API to an interactive frontend map.

## Features

- **Live fleet map** — Interactive Leaflet map showing real-time truck positions
- **Truck status board** — At-a-glance view of every truck's status (available, en route, on-scene, out of service)
- **Dispatch queue** — Incoming job requests ready to assign to available trucks
- **Driver detail panel** — Driver info, current assignment, and ETA
- **Fleet analytics** — Jobs completed, average response time, and activity trends

## Tech Stack

**Frontend**
- React 18
- Tailwind CSS
- React-Leaflet (interactive mapping)
- Lucide React (icons)
- Vite (build tool / dev server)

**Backend**
- Node.js + Express
- better-sqlite3 (embedded database)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or later recommended)

### Installation

```bash
git clone https://github.com/Grimlock941/Tow-ops-dashboard.git
cd Tow-ops-dashboard
npm install
```

### Running locally

```bash
npm run dev
```

This starts both the backend API (`http://localhost:3001`) and the frontend dev server (`http://localhost:5173`) concurrently. Open `http://localhost:5173` in your browser.

## Project Structure

```
tow-ops-dashboard/
├── server/          # Express backend + API routes
├── src/             # React frontend source
├── index.html
├── package.json
└── vite.config.js
```

## Roadmap

- [ ] Real GPS integration for live truck positioning
- [ ] User authentication for dispatchers/drivers
- [ ] Job history and reporting export
- [ ] Mobile-responsive driver view

## Author

Built by [Grimlock941](https://github.com/Grimlock941) — drawing on hands-on experience in the towing industry to design a dashboard that reflects real dispatch workflows.
