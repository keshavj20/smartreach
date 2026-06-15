# 🚀 SmartReach AI CRM

> An AI-native marketing CRM that helps brands discover customer audiences, generate campaigns, simulate communication delivery, and analyse campaign performance — powered by **Google Gemini AI**, **React**, **Node.js**, and **MongoDB Atlas**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Live analytics cards, revenue charts, customer activity, campaign status pie |
| 👥 **Customers** | Full CRUD, search, pagination, spend-tier badges, side-drawer detail view |
| 🛒 **Orders** | Full CRUD, category filter, auto-updates customer spend totals |
| 🎯 **Smart Audience Discovery** | 5 rule-based segments auto-discovered from your data |
| 🤖 **Gemini AI Layer** | Per-segment AI strategy, channel pick, personalized message |
| 📣 **Campaign Builder** | Select audience → edit AI message → pick channel → launch |
| 📡 **Channel Simulation** | Simulates Delivered / Opened / Clicked / Failed events asynchronously |
| 🔁 **Campaign Replay** | Journey timeline, funnel chart, per-recipient status table |
| 🌙 **Dark Mode** | Full dark/light theme toggle, persisted to localStorage |
| 🔔 **Notifications** | Real-time notification panel |
| ⚙️ **Settings** | Gemini API key management, profile, theme toggle |

---

## 🏗️ Tech Stack

**Frontend** — React 18, Material UI 5, React Router 6, Recharts, Axios, Notistack  
**Backend** — Node.js, Express 4, Mongoose 8  
**Database** — MongoDB Atlas  
**AI** — Google Gemini 1.5 Flash (`@google/generative-ai`)  
**Deploy** — Vercel (frontend) + Render (backend)

---

## 📁 Project Structure

```
smartreach-crm/
├── backend/
│   ├── controllers/        # Business logic per resource
│   ├── middleware/         # errorHandler, requestLogger, rateLimiter
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── services/           # geminiService, channelService
│   ├── utils/              # seed.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/     # StatCard, PageElements, CustomerDetailDrawer, ConfirmDialog, …
│       │   └── layout/     # Sidebar + TopBar Layout
│       ├── context/        # AppContext (theme)
│       ├── hooks/          # useApi, useDebounce
│       ├── pages/          # Dashboard, Customers, Orders, AudienceDiscovery, …
│       ├── services/       # api.js (Axios)
│       └── utils/          # theme.js, format.js
├── .gitignore
├── render.yaml
└── vercel.json
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (free tier works)
- Google Gemini API key (optional — falls back to smart mock responses)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/smartreach-crm.git
cd smartreach-crm

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/smartreach_crm
GEMINI_API_KEY=AIza...your_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Configure Frontend

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Seed Demo Data

```bash
cd backend && node utils/seed.js
```

This creates 50 customers, ~300 orders, 5 campaigns, and communications.

### 5. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

Open **http://localhost:3000** 🎉

---

## 🗄️ Database Models

### Customer
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | unique, required |
| phone | String | optional |
| city | String | optional |
| totalSpent | Number | auto-updated on order create/delete |
| lastPurchaseDate | Date | auto-updated |

### Order
`customerId · amount · category · orderDate`

### Campaign
`name · audienceName · audienceSize · channel · message · status · stats{sent,delivered,opened,clicked,failed}`

### Communication
`campaignId · customerId · status · statusHistory[]`

### AudienceDiscovery
`title · description · audienceSize · recommendation · aiSuggestion{campaignGoal,bestChannel,marketingStrategy,personalizedMessage} · ruleKey`

---

## 🤖 Audience Discovery Rules

| Segment | Rule |
|---|---|
| High Value Inactive | totalSpent > ₹5,000 AND lastPurchase > 30 days ago |
| Frequent Buyers | More than 5 orders |
| New Customers | Exactly 1 order |
| Cross-Sell Opportunities | Bought Shoes but never Socks |
| Churn Risk | No purchase in 45+ days |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Dashboard stats + charts |
| GET/POST/PUT/DELETE | `/api/customers` | Customer CRUD |
| GET | `/api/customers/:id/stats` | Customer + orders + spend breakdown |
| GET/POST/PUT/DELETE | `/api/orders` | Order CRUD |
| GET/POST/PUT/DELETE | `/api/campaigns` | Campaign CRUD |
| POST | `/api/campaigns/:id/send` | Launch campaign |
| GET | `/api/campaigns/:id/stats` | Campaign funnel stats |
| GET | `/api/audiences/discover` | Run all 5 audience rules |
| POST | `/api/audiences/ai-recommendation` | Get Gemini AI strategy |
| GET/POST | `/api/settings` | Read/write settings |
| GET | `/health` | Health check |

---

## 🌐 Deployment

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `cd backend && npm install`
4. Set **Start Command**: `cd backend && node server.js`
5. Add environment variables:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy

---

## 🔑 Environment Variables Summary

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Backend | Google AI Studio API key |
| `FRONTEND_URL` | Backend | Allowed CORS origin |
| `PORT` | Backend | Server port (default 5000) |
| `NODE_ENV` | Backend | `development` / `production` |
| `REACT_APP_API_URL` | Frontend | Backend API base URL |

---

## 📝 License

MIT — free to use and modify.

---

Built with ❤️ using React + Node.js + MongoDB + Google Gemini AI
