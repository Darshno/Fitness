import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mode: { type: String, enum: ["home", "physical", "mental", "nutrition"] },
  role: { type: String, enum: ["user", "assistant", "safety"] },
  text: String,
  title: String,
  resources: [{ label: String, href: String }],
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);
