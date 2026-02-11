#  Chess Tournament Frontend

> Frontend client for the Chess Tournament platform  
> Provides UI for authentication, tournaments, rounds, matches, and winner tracking.

---

#  Overview

This application is the user interface for managing chess tournaments.  
It connects to the backend API and allows organizers and players to interact with tournaments in real time.

Features include:

- User login & authentication
- Tournament creation and listing
- Player management
- Round generation
- Match viewing
- Winner tracking
- Next-round progression

---

#  Tech Stack

- React
- Vite
- React Router
- Axios / Fetch API
- CSS / Tailwind (update if needed)
- Vercel deployment

---

#  Getting Started

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run dev
```

## Build for production

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

---

#  Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Example usage in code:

```js
const API = import.meta.env.VITE_API_BASE_URL;

fetch(`${API}/api/users/login`, {
  method: "POST",
  body: JSON.stringify(data)
});
```

---

#  Project Structure

```bash
src/
│
├── api/                 # API request helpers
├── components/          # Reusable UI components
├── pages/               # Route-level pages
├── routes/              # Router configuration
├── hooks/               # Custom hooks
├── styles/              # Global styles
├── utils/               # Helper functions
│
├── App.jsx
├── main.jsx
```

---

# Authentication Flow

```text
Login Form
   ↓
POST /api/users/login
   ↓
Receive JWT / cookie
   ↓
Store auth state
   ↓
Protected routes unlocked
```

---

# Tournament Flow (Frontend View)

```text
Create Tournament
    ↓
Add Players
    ↓
Generate Round 1
    ↓
View Matches
    ↓
Submit Results
    ↓
Next Round Button
    ↓
Repeat until Winner
```

---

#  Next Round Handling (Frontend Logic)

Frontend should call:

```bash
POST /api/rounds/next
```

Possible responses:

## Tournament completed

```json
{
  "status": "COMPLETED",
  "winner": { "playerId": "..." }
}
```

→ Show Winner Screen

## Next round created

```json
{
  "status": "ADVANCED",
  "round": { "id": "...", "roundNumber": 2 },
  "matches": []
}
```

→ Render matches UI

---

#  Debug Tips

Check API base URL:

```js
console.log(import.meta.env.VITE_API_BASE_URL);
```

Check final request URL:

```js
console.log(`${API}/api/users/login`);
```

Never concatenate two full domains together.

---

# Deployment

This frontend is optimized for:

- Vercel hosting
- Static build output
- Environment-based API URLs

Deploy steps:

```bash
npm run build
```

Upload `dist/` to hosting provider.

---

#  Developer Notes

- Keep API base URL configurable
- Do not hardcode backend domains
- Handle `"COMPLETED"` status separately in UI
- Always check for empty matches array
- Protect organizer-only routes

---

