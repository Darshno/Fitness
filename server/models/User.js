import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  onboardingComplete: { type: Boolean, default: false },
  goalAssessment: Object,
  planAccepted: { type: Boolean, default: false },
  companion: Object,
  profile: Object,
  reminders: Object,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
