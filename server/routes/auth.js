import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function requireJwtSecret(res) {
  if (!process.env.JWT_SECRET) {
    res.status(503).json({ error: "Authentication is not configured on the server." });
    return false;
  }
  return true;
}

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["name", "onboardingComplete", "goalAssessment", "planAccepted", "companion", "profile", "reminders"];
    const updates = Object.fromEntries(
      allowed.filter((key) => Object.prototype.hasOwnProperty.call(req.body || {}, key))
        .map((key) => [key, req.body[key]])
    );

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({ error: "Name is required." });
      }
      updates.name = updates.name.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found." });
    const safeUser = user.toObject();
    safeUser.id = user._id.toString();
    delete safeUser.passwordHash;
    res.json({ user: safeUser });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required." });

    // Do not reveal whether an account exists.
    await User.exists({ email });
    res.json({
      pendingBackend: true,
      message: "If an account exists for that email, password-reset instructions will be sent when email delivery is configured.",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    if (!requireJwtSecret(res)) return;

    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || name.length > 100) return res.status(400).json({ error: "Enter a valid name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ error: "Password must be 8–128 characters." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const safeUser = user.toObject();
    safeUser.id = user._id.toString();
    delete safeUser.passwordHash;
    res.status(201).json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    if (!requireJwtSecret(res)) return;

    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash || ""))) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const safeUser = user.toObject();
    safeUser.id = user._id.toString();
    delete safeUser.passwordHash;
    res.json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
});

export default router;
