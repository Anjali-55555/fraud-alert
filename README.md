# FraudAlert Lite 🛡️

### AI-Powered Financial Fraud Detection & Risk Intelligence Platform

FraudAlert Lite is a production-ready, enterprise-grade full-stack MERN application representing the fraud intelligence systems utilized by Stripe, PayPal, Visa, and Mastercard.

The platform integrates a dynamic rule evaluation engine, real-time streaming notifications over Socket.io, Explainable AI (XAI) risk breakdowns, interactive maps, and a ChatGPT-style AI Copilot chat drawer for analyst cases.

---

## Core System Features

1. **Real-Time Transaction Feed:** Live updates to dashboards and risk metrics via WebSockets.
2. **Customer Risk Timeline:** A historical trend line-graph of customer risk levels over preceding transactions.
3. **AI Copilot Sidebar:** Interactive chatbot for analysts to query metrics, investigate specific transaction anomalies, or check prevent exposure.
4. **Investigator Workspace:** Unified case view showing timelines, notes audit logs, resolve status actions, and an Explainable AI scorecard.
5. **AI Investigation Reports:** Generates structured HTML compliance logs printable directly as PDF documentation.
6. **Dynamic Rules Engine:** Rules loaded from MongoDB. Administrators can edit rule weights or toggle them active dynamically.
7. **Geographic Threat Heatmap:** Visual SVG World Map displaying hotspots based on fraud origin.
8. **Live Fraud Simulator:** Controls to start/stop periodic mock transaction generation or trigger immediate "fraud bursts."

---

## Tech Stack & Architecture

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide icons, Recharts, Socket.io-client, Axios.
- **Backend:** Node.js, Express.js, Mongoose, Socket.io.
- **Database:** MongoDB Atlas (or local MongoDB).
- **Security:** Helmet, CORS, Express-Rate-Limit, bcrypt, JWT (Access + Refresh tokens).

### Resiliency Engineering:
- **Redis Cache:** Switches to an internal in-memory events emitter fallback automatically if Redis is not running locally.
- **Gemini API:** Switches to a structured, rule-based diagnostic narration generator if no `GEMINI_API_KEY` is provided.

---

## User Accounts (For Demonstration)

All accounts share the default password: `password123`

| Email | Role | Function |
|---|---|---|
| `admin@fraudalert.com` | Admin | Manages active rules, toggles parameters, controls the Live Simulator |
| `analyst1@fraudalert.com` | Analyst | Reviews flagged queue in workspace, logs notes, updates case resolutions |
| `manager@fraudalert.com` | Manager | Analyzes financial BI charts, potential loss metrics, country hotspots |
| `customer@fraudalert.com` | Customer | Views personal statement, adds trusted devices/locations |

---

## Installation & Running

### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fraudalert_lite
JWT_SECRET=secretkey_fraud_alert_lite
JWT_REFRESH_SECRET=refreshsecret_fraud_alert_lite
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
USE_REDIS=false
```

### 2. Local Setup (Automated scripts)
Run the following in the root directory:

```bash
# Install root, backend and frontend dependencies concurrently
npm install

# Seed the MongoDB database with users, rules, customers, and transactions
npm run seed

# Spin up both Express backend and Vite frontend dev servers
npm start
```

- Open the Frontend dashboard: `http://localhost:5173`
- API base endpoint: `http://localhost:5000`

---

## Running with Docker

Docker Compose builds and links the MongoDB database, Express API server, and React client.

```bash
# Spin up complete stack
docker-compose up --build

# Ingest initial data within the backend container
docker-compose exec backend npm run seed
```
