# FitBuddy Frontend MVP

AI companion UI for fitness and wellbeing. This is a **frontend-only** MVP: authentication, plans, chat, and nutrition estimates run locally so a backend can be connected later.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Start the API in a second terminal:

```bash
npm run backend
```

The API runs at `http://localhost:4000`. Set a real `MONGODB_URI` and `JWT_SECRET` in `server/.env` for account persistence.

## Flow

Landing → Signup / Login → Onboarding → Goal check → Workout plan → Home dashboard.

Returning users go Login → Home.

## Notes

- Data is stored in `localStorage` through service modules in `src/services/`.
- Chat replies and food analysis are mock service responses, not live AI.
- Crisis language is intercepted in `safetyService.js` and does not continue a normal conversation.
- FitBuddy is a wellbeing support tool and is not a replacement for professional care.
