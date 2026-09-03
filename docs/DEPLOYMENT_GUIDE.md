# Imota LCDA Youth Data Registration Portal - Deployment & Installation Guide

This guide provides instructions for deploying the Imota LCDA Youth Data Registration Portal to production environments.

---

## 1. Project Directory Structure
```
├── docs/
│   ├── API_DOCUMENTATION.md      # REST API endpoints & payloads
│   ├── DATABASE_SCHEMA.sql       # MySQL and PostgreSQL DDL schemas
│   ├── DEPLOYMENT_GUIDE.md       # Production hosting & Docker guide
│   └── TESTING_PROCEDURES.md     # Duplicate rule testing procedures
├── public/
│   └── assets/
│       └── imota_logo.jpg        # Official Imota LCDA Seal
├── server/
│   ├── auth.ts                   # JWT Admin authentication
│   ├── db.ts                     # SQL relational database engine & constraints
│   └── validation.ts             # Input sanitization & phone normalization
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Admin portal, stats, table, search, export
│   │   ├── ConfirmationCard.tsx  # Green success card, printable youth slip
│   │   ├── Navigation.tsx        # Council header with seal & portal links
│   │   ├── RegistrationForm.tsx  # Multi-step responsive registration form
│   │   └── RulesInspector.tsx    # Live rule runner & SQL schema inspector
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── App.tsx                   # Main layout & state router
│   ├── index.css                 # Tailwind CSS 4 styling
│   └── main.tsx                  # React entry point
├── server.ts                     # Node.js + Express backend with Vite integration
├── package.json                  # Dependencies & production build scripts
└── metadata.json                 # AI Studio application metadata
```

---

## 2. Environment Variables (.env)
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_long_random_secret_key_here
ADMIN_EMAIL=admin@imota.gov.ng
ADMIN_PASSWORD=Admin@Imota2026!
```

---

## 3. Installation & Local Execution
```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (starts Express backend + Vite on port 3000)
npm run dev

# 3. Compile for production
npm run build

# 4. Start production server
npm start
```

---

## 4. Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]
```

Build and run:
```bash
docker build -t imota-youth-portal .
docker run -p 3000:3000 --env-file .env imota-youth-portal
```

---

## 5. Deploying to Cloud Platforms (Vercel, Render, Railway, Supabase)
- **Render / Railway / Cloud Run**: Connect your GitHub repository. Set the build command to `npm run build` and start command to `npm start`. Add the environment variables in the dashboard.
- **Supabase / PostgreSQL Integration**: Run the PostgreSQL schema from `docs/DATABASE_SCHEMA.sql` in the Supabase SQL editor.
- **MySQL Integration**: Execute `docs/DATABASE_SCHEMA.sql` on your MySQL server (Amazon RDS, DigitalOcean, or cPanel MySQL).
