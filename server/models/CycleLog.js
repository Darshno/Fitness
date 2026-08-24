import mongoose from "mongoose";

const cycleLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  lastPeriodStart: String,
  cycleLength: { type: Number, default: 28, min: 21, max: 45 },
  periodLength: { type: Number, default: 5, min: 1, max: 10 },
}, { timestamps: true });

export default mongoose.model("CycleLog", cycleLogSchema);
