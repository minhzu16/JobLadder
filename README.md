# JobLadder - AI-Powered Job Portal & Career Platform

A full-stack, enterprise-grade job search platform and AI-powered career assistant built with React, Vite, Express, TypeScript, and Prisma.

---

## Features

- 🤖 **AI CV Analysis & Scoring**: Upload your CV (PDF/DOCX/Text) and receive instant personalized feedback, skills breakdown, matching job recommendations, and an actionable career improvement roadmap powered by Google Gemini AI.
- 🔍 **Smart Job Search & Filtering**: Fast, multi-criteria filtering by keyword, location, salary range, experience level, and job type with full pagination and sorting.
- 🏢 **Company Profiles & Reviews**: Detailed company pages with verified badges, active job listings, company culture, and employee ratings.
- 🔐 **Role-Based Authentication & Security**: Complete JWT-based auth with granular access control (`USER`, `EMPLOYER`, `ADMIN`), secure password hashing (BCrypt), rate limiting, and input sanitization.
- 💼 **Employer Portal**: Dedicated dashboard for hiring managers to post job listings, review applicants, and track candidate progress.
- 🛡️ **Admin Dashboard**: System administration portal for managing users, approving employer accounts, and monitoring jobs.
- 🎨 **Modern High-Performance UI**: Ultra-responsive, sleek dark/light interface built with React, Tailwind CSS, and Lucide Icons.

---

## Tech Stack

### Client
- **Framework**: React 19 + Vite + TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS, PostCSS, Lucide React
- **HTTP Client**: Axios

### Server
- **Runtime**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM with SQLite (PostgreSQL compatible)
- **AI Integration**: Google Gemini 1.5 Pro / Flash API
- **Authentication**: JSON Web Tokens (JWT) & BCrypt
- **File Uploads**: Multer with PDF text extraction (`pdf-parse`)

---

## Project Structure

```
jobladder-clone/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components & layouts
│   │   ├── contexts/       # Auth & State contexts
│   │   ├── pages/          # Application views (Jobs, CV Analysis, Dashboard, etc.)
│   │   └── services/       # API client integrations
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Initial mock database seed
│   ├── src/
│   │   ├── controllers/    # Request handlers (Auth, Job, CV, Company, etc.)
│   │   ├── middlewares/    # Auth, validation, rate limiting
│   │   ├── routes/         # Express API routes
│   │   └── services/       # AI (Gemini) & business logic
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml      # Container orchestration
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or yarn
- Git

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/jobladder.git
cd jobladder
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and provide your GEMINI_API_KEY and JWT_SECRET

# Run database migrations and seed mock data
npx prisma db push
npm run prisma:seed

# Start development server
npm run dev
```
Backend will be running on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Frontend will be running on `http://localhost:5173`.

---

## Environment Variables

In `server/.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="your-google-gemini-api-key"
```

---

## License
MIT License
