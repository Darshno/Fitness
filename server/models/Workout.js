import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  planId: String,
  dayId: String,
  exercises: [{ id: String, name: String, sets: Number, reps: String, rest: String }],
  progress: {
    exercises: { type: Map, of: Boolean, default: () => new Map() },
    completed: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model("Workout", workoutSchema);
