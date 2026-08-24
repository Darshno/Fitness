import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import authRoutes from "./routes/auth.js";
import workoutRoutes from "./routes/workout.js";
import chatRoutes from "./routes/chat.js";
import foodRoutes from "./routes/food.js";
import cycleRoutes from "./routes/cycle.js";
import analyticsRoutes from "./routes/analytics.js";

// Fix DNS resolution issues on Windows for MongoDB Atlas mongodb+srv URIs
try {
  dns.setDefaultResultOrder?.("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("Could not set custom DNS servers:", dnsErr.message);
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
];
const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not set. The API will not be able to persist data.");
}
if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Authentication endpoints will fail until it is configured.");
}

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/cycle", cycleRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  const hasUsableMongoUri = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("USERNAME:PASSWORD");
  if (hasUsableMongoUri) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
    }
  }

}

start();
