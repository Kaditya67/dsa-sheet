const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    // parentGroup e.g., "Data Structures", "Algorithms", or null/empty for custom lists
    parentGroup: { type: String, default: null, trim: true },
    color: { type: String, default: "#3b82f6" },
  },
  { timestamps: true }
);

// Ensure unique tag per user under the same parentGroup
tagSchema.index({ userId: 1, name: 1, parentGroup: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);

