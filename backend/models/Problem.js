const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g. "Optimal - Monotonic Stack"
  language: { type: String, default: "cpp", trim: true }, // cpp, python, java, javascript
  code: { type: String, required: true },
  timeComplexity: { type: String, default: "", trim: true }, // e.g. "O(N)"
  spaceComplexity: { type: String, default: "", trim: true }, // e.g. "O(N)"
  explanation: { type: String, default: "" }, // Markdown notes/intuition
});

const linkSchema = new mongoose.Schema({
  platform: { type: String, required: true, trim: true }, // LeetCode, GFG, YouTube, etc.
  url: { type: String, required: true, trim: true },
  label: { type: String, default: "", trim: true },
});

const problemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"],
      default: "Todo",
    },
    isFavorite: { type: Boolean, default: false },
    revisionCount: { type: Number, default: 0 },
    lastPracticedAt: { type: Date, default: Date.now },

    // External problem links (LeetCode, GFG, YouTube, Codeforces)
    links: [linkSchema],

    // Hierarchical & custom tags
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],

    // Multi-approach solutions
    solutions: [solutionSchema],

    // Personal markdown notes, tricky test cases & pitfalls
    personalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);

