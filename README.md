# 🎟️ Eventora — Next-Gen Event & Movie Ticket Booking Platform

Eventora is a modern, high-performance web application for discovering and booking tickets to movies, stadium concerts, sports tournaments, comedy specials, and theatrical productions. Built with a rich dark aesthetic, interactive seat maps, real-time booking flows, and an enterprise administration dashboard.

---

## ✨ Features

- **🎬 Multi-Category Entertainment Catalog**:
  - **Movies**: Blockbuster cinema releases with IMAX & 4DX format tags (*Pushpa 2, Kalki 2898 AD, Stree 2, Deadpool & Wolverine, Inside Out 2, Dune: Part Two, Venom: The Last Dance*).
  - **Concerts**: Stadium mega-shows and musical tours (*Taylor Swift Eras Tour, Coldplay Music of the Spheres, Diljit Dosanjh Dil-Luminati, Arijit Singh*).
  - **Sports**: Iconic matches (*IPL 2026 Final, FIFA World Cup 2026 Qualifier, Pro Kabaddi League Final, Wimbledon Finals*).
  - **Comedy**: Stand-up specials (*Zakir Khan Sakht Launda 3.0, Kapil Sharma Live*).
  - **Theatre**: Broadway and stage productions (*Hamilton, The Lion King*).
- **💺 Interactive Seat Selection**:
  - Curved cinema auditoriums and stadium arena layouts.
  - Multi-tier seat pricing (Silver, Gold, Premium, VIP Recliner).
  - Real-time seat locking with optimistic concurrency.
- **🛡️ Secure User Authentication & Guest Protection**:
  - Guests can explore events and showtimes freely.
  - Smart registration guard triggers a seamless modal whenever unauthenticated users attempt to reserve seats.
  - Automatic session resumption after registration or login.
- **🎟️ Instant Digital E-Tickets**:
  - Dynamic QR code generation for gate entry scanning.
  - Apple Wallet & Google Pay pass styling.
  - Downloadable/printable confirmation receipts with seat breakdown.
- **📊 Admin Portal & Analytics**:
  - Live revenue metrics, booking graphs, and capacity utilization.
  - Event management (Add, update, or remove events).
  - Venue and screen configuration.
  - User and customer directory management.

---

## 🛠️ Technology Stack

- **Frontend**:
  - [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/) (Micro-interactions & transitions)
  - [Lucide React](https://lucide.dev/) (Iconography)
  - [Recharts](https://recharts.org/) (Admin analytics)
  - [qrcode.react](https://github.com/zpao/qrcode.react) (Digital ticket passes)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/)
  - [SQLite](https://sqlite.org/) (Zero-setup local database)
  - [JWT](https://jwt.io/) & [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) authentication

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <YOUR_REPOSITORY_URL>
cd eventora
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
JWT_SECRET=eventora_super_secret_jwt_key_2026
DATABASE_URL="file:./dev.db"
```

### 4. Database Setup & Seeding
Initialize the SQLite database with Prisma and load initial venues, screens, seats, and programs:
```bash
npx prisma db push --schema=server/prisma/schema.prisma
npm run seed
```

### 5. Running the Application

In **Terminal 1** (Backend API):
```bash
npm run server
# Express running on http://localhost:5000
```

In **Terminal 2** (Frontend Dev Server):
```bash
npm run dev
# Vite server running on http://localhost:5173
```

---

## 👤 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@eventora.com` | `Admin@123` |
| **Customer** | `user@eventora.com` | `User@123` |

*New users can also create their own accounts instantly using the "Sign Up" tab in the authentication modal.*

---

## 📂 Project Structure

```
eventora/
├── public/
│   ├── posters/          # High-resolution local poster assets for all events
│   ├── ipl_final_poster.jpg
│   └── fifa_qualifier_poster.jpg
├── server/
│   ├── prisma/           # Prisma schema & SQLite database
│   ├── routes/           # Auth, Events, Showtimes, Bookings, Admin API
│   ├── seed.js           # Database seed script
│   └── index.js          # Express application entrypoint
├── src/
│   ├── api/              # API fetch client
│   ├── components/       # UI components (Hero, EventCard, SeatMapModal, AdminLayout, etc.)
│   ├── context/          # Auth and Toast notification contexts
│   ├── data/             # Static event catalogs & category data
│   ├── App.jsx           # Main application view & router
│   ├── index.css         # Tailwind & custom glassmorphism styles
│   └── main.jsx          # React DOM entry
├── .env.example
├── package.json
└── vite.config.js
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
