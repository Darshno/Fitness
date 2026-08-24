import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import CycleLog from "../models/CycleLog.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const doc = await CycleLog.findOneAndUpdate(
    { userId: req.userId },
    { $setOnInsert: { cycleLength: 28, periodLength: 5 } },
    { upsert: true, new: true }
  );
  res.json(doc);
});

router.put("/", async (req, res) => {
  const { lastPeriodStart, cycleLength, periodLength } = req.body;
  const doc = await CycleLog.findOneAndUpdate(
    { userId: req.userId },
    { lastPeriodStart, cycleLength, periodLength },
    { upsert: true, new: true }
  );
  res.json(doc);
});

export default router;
