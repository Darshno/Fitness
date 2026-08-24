import mongoose from "mongoose";

const hydrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true, index: true },
  glasses: { type: Number, default: 0, min: 0 },
  goal: { type: Number, default: 8, min: 1 },
}, { timestamps: true });

hydrationSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Hydration", hydrationSchema);
