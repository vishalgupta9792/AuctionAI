# Online Auction Platform with AI

Final Year Major Project (B.Tech / B.E. CSE) using MERN + Socket.io + OpenAI.

## Tech Stack
- Frontend: React.js (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Real-time: Socket.io
- AI: OpenAI API (with heuristic fallback)
- Payment: Razorpay integration (real payment) + test mode

## Implemented Features

### 1. Authentication
- Register/Login
- JWT-based protected APIs
- Role support: `Admin`, `Seller`, `Bidder`

### 2. Auction System
- Seller/Admin can create auctions
- Auction fields: title, description, base price, start/end time
- Status calculation: `Upcoming`, `Live`, `Ended`
- Live bidding with Socket.io room per auction
- Invalid bid prevention + minimum increment logic
- Basic auto-bid support with `maxAutoBid`

### 3. Live Bidding Page
- Real-time bid updates
- Highest bidder highlight
- Animated bid feed entries
- Countdown timer

### 4. Trending Section
- Most bids
- Highest price
- Ending soon

### 5. AI Features
- AI bid suggestion endpoint (`/api/ai/suggest-bid/:auctionId`)
- Winning probability estimate
- Fraud detection for rapid repeated bids
- AI chatbot for auction Q&A, bid history context, trending suggestions

### 6. Dashboards
- Seller: auctions, bids, revenue summary, notifications
- Bidder: active bids, won auctions, bid history, watchlist, Razorpay payment
- Admin: users, fraud reports, platform stats

### 7. Navbar
- Home
- Live Auctions
- Trending
- Sell Item
- Dashboard
- AI Chatbot button
- Profile/Logout actions
- Dark/Light toggle

### 8. Database Models
- `User`
- `Auction`
- `Bid`
- `FraudReport`
- `Notification` (extra for alerts)

### 9. Extra Features
- Watchlist APIs and UI integration
- Notifications APIs and dashboard display
- Dark/Light mode
- Razorpay payment integration

---

## Project Structure

```text
Online_Auction/
  backend/
    package.json
    .env.example
    src/
      server.js
      config/db.js
      middleware/
      models/
      routes/
      services/
      socket/
      utils/
      seed.js

  frontend/
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    index.html
    src/
      App.jsx
      main.jsx
      index.css
      api/client.js
      context/
      components/
      pages/
```

---

## Local Setup

## 1) Start MongoDB
Make sure MongoDB is running locally at:
`mongodb://127.0.0.1:27017/online_auction`

## 2) Backend Setup
```bash
cd backend
npm install
copy .env.example .env
# optional: add OPENAI_API_KEY in .env
npm run seed
npm run dev
```
Backend runs on `http://localhost:5000`.

## 3) Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## Seeded Test Accounts
After `npm run seed`:
- Admin: `admin@auction.com` / `123456`
- Seller: `seller@auction.com` / `123456`
- Bidder 1: `bidder1@auction.com` / `123456`
- Bidder 2: `bidder2@auction.com` / `123456`

---

## Important API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Auctions
- `POST /api/auctions` (Seller/Admin)
- `GET /api/auctions`
- `GET /api/auctions/trending`
- `GET /api/auctions/:id`

### Bidding
- `POST /api/bids/:auctionId`

### AI
- `POST /api/ai/suggest-bid/:auctionId`
- `POST /api/ai/chatbot`

### Dashboards
- `GET /api/dashboard/seller`
- `GET /api/dashboard/bidder`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/fraud`

### Watchlist & Notifications
- `GET /api/watchlist`
- `POST /api/watchlist/:auctionId`
- `DELETE /api/watchlist/:auctionId`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Payment (Razorpay)`r`n- `POST /api/payments/create-order``r`n- `POST /api/payments/verify``r`n- `GET /api/payments/my`

---

## Notes for Project Submission
- Replace fallback AI with active OpenAI key for full AI responses.
- Add charts and advanced analytics for richer dashboard presentation.
- Extend fraud detection with IP/device/session behavior.
- Add unit/integration tests for production-level quality.

---

## Deployment (Render + Vercel)

### Option A: Deploy both backend and frontend on Render

1. Push code to GitHub (already done).
2. On Render, create services from `render.yaml` in repo root.
3. Set backend env vars in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (optional)
   - `CLIENT_URL` = deployed frontend URL (for example `https://auctionai-frontend.onrender.com`)
4. Set frontend env vars in Render:
   - `VITE_API_BASE_URL` = backend URL + `/api`
   - `VITE_SOCKET_URL` = backend URL
5. Redeploy both services.

### Option B: Backend on Render, Frontend on Vercel

1. Deploy backend (`backend/`) on Render as Node Web Service.
2. Add backend env vars:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (optional)
   - `CLIENT_URL` = Vercel frontend URL
3. Deploy frontend (`frontend/`) on Vercel.
4. In Vercel project env vars, add:
   - `VITE_API_BASE_URL` = Render backend URL + `/api`
   - `VITE_SOCKET_URL` = Render backend URL
5. Redeploy frontend.

### Quick check after deploy
- Open frontend URL
- Register/login works
- Home page shows products
- `/live` shows live auctions with countdown
- Place bid and verify live update over socket


## Razorpay Setup (Real Payment)

Update `backend/.env`:
- `RAZORPAY_KEY_ID=your_key_id`
- `RAZORPAY_KEY_SECRET=your_key_secret`
- `RAZORPAY_CURRENCY=INR`

Payment APIs:
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/payments/my`

Frontend bidder dashboard now opens Razorpay checkout for won auctions.
