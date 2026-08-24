import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Workout from "../models/Workout.js";

const router = Router();
router.use(requireAuth);

router.get("/today", async (req, res) => {
  const workout = await Workout.findOne({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(workout);
});

router.patch("/:id/exercise/:exerciseId/toggle", async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, userId: req.userId });
  if (!workout) return res.status(404).end();
  const current = workout.progress.exercises.get(req.params.exerciseId) || false;
  workout.progress.exercises.set(req.params.exerciseId, !current);
  await workout.save();
  res.json(workout);
});

router.patch("/:id/complete", async (req, res) => {
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    [{ $set: { "progress.completed": { $not: "$progress.completed" } } }],
    { new: true }
  );
  res.json(workout);
});

export default router;
