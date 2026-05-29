The backend service is an Express API written in TypeScript that enforces all legal tracking state-machine transitions and automatically calculates compensation splits.

### 🚀 Getting Started
#### 1. Prerequisites
Ensure you have Node.js (v18+) and a database provider (PostgreSQL, MySQL, or SQLite) ready.

#### 2. Installation

Navigate to the backend directory and install the necessary dependencies:
```bash
cd backend
npm install
```

#### 3. Database Sync, Migration & Seeding
Configure your database URL inside your `.env` file, sync your schema, and populate the database with initial mock data (Reporters and Editors) using the seed script:

```bash    
# Push the Prisma schema to your database
npx prisma db push
# Seed the database with initial master data (Reporters & Editors)
npx prisma db seed
```

#### 4. Running the Server
Start the development server:
```Bash
npm start
```
The server will boot up and listen on `http://localhost:5000`.

### 🧪 Running Test Cases
The backend includes an automated Jest unit testing suite to verify that business rule guardrails prevent illegal data updates. To execute the tests, run:
```Bash
npm run test
```
### 📋 API Specifications
| Method | Endpoint | Description | Business Rules & Guardrails Enforced |
| :--- | :--- | :--- | :---: |
| **GET** | `/api/jobs` | Fetches all tracking jobs | Dynamically computes earnings: `Reporter Split = mins × rate. Editor Split = Fixed Fee`. |
| **POST** | `/api/jobs` | Ingests a new audio file | Defaults status to `NEW`. Generates standard baseline financial rates. |
| **PUT** | `/api/jobs/:id/assign` | Assigns staff to a job | Rule 2: Blocks unavailable reporters. Rule 3: Blocks editor assignment if status is not `TRANSCRIBED`. |
| **PUT** | `/api/jobs/:id/status` | Mutates workflow state | Validates strict sequence: `NEW` ➔ `ASSIGNED` ➔ `TRANSCRIBED` ➔ `REVIEWED` ➔ `COMPLETED`. Blocks forward-skipping and downgrades. |
| **PUT** | `/api/jobs/:id` | Edits core audio parameters | Retains data updates. Guardrail: Blocks edits completely once status is marked `COMPLETED`. |