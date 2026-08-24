import mongoose from "mongoose";

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true, index: true },
  name: String,
  calories: { type: Number, min: 0 },
  protein: { type: Number, min: 0 },
  carbohydrates: { type: Number, min: 0 },
  fat: { type: Number, min: 0 },
  imageName: String,
}, { timestamps: true });

foodLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model("FoodLog", foodLogSchema);
