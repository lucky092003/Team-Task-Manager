import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, default: "", trim: true },
	status: { type: String, enum: ["active", "on-hold", "completed"], default: "active" },
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
