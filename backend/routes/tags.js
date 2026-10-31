const express = require("express");
const Tag = require("../models/Tag");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Default starter tags to seed for new users
const DEFAULT_TAGS = [
  // Data Structures
  { parentGroup: "Data Structures", name: "Array", color: "#3b82f6" },
  { parentGroup: "Data Structures", name: "String", color: "#6366f1" },
  { parentGroup: "Data Structures", name: "Linked List", color: "#8b5cf6" },
  { parentGroup: "Data Structures", name: "Stack", color: "#ec4899" },
  { parentGroup: "Data Structures", name: "Queue", color: "#f43f5e" },
  { parentGroup: "Data Structures", name: "Tree & BST", color: "#10b981" },
  { parentGroup: "Data Structures", name: "Heap / Priority Queue", color: "#14b8a6" },
  { parentGroup: "Data Structures", name: "Graph", color: "#f59e0b" },
  { parentGroup: "Data Structures", name: "Trie", color: "#06b6d4" },

  // Algorithms
  { parentGroup: "Algorithms", name: "Two Pointers", color: "#0ea5e9" },
  { parentGroup: "Algorithms", name: "Sliding Window", color: "#3b82f6" },
  { parentGroup: "Algorithms", name: "Binary Search", color: "#8b5cf6" },
  { parentGroup: "Algorithms", name: "Recursion & Backtracking", color: "#d946ef" },
  { parentGroup: "Algorithms", name: "Dynamic Programming", color: "#ef4444" },
  { parentGroup: "Algorithms", name: "Greedy", color: "#f59e0b" },
  { parentGroup: "Algorithms", name: "Bit Manipulation", color: "#64748b" },

  // Standalone Curated Lists
  { parentGroup: null, name: "Top 100 Liked", color: "#eab308" },
  { parentGroup: null, name: "Must Revise", color: "#f97316" },
  { parentGroup: null, name: "Blind 75", color: "#84cc16" },
];

// @route GET /api/tags
// @desc Get all tags for logged in user (auto-seeds defaults if empty)
router.get("/", protect, async (req, res) => {
  try {
    let tags = await Tag.find({ userId: req.user._id }).sort({ parentGroup: 1, name: 1 });

    if (tags.length === 0) {
      const initialTags = DEFAULT_TAGS.map((t) => ({ ...t, userId: req.user._id }));
      tags = await Tag.insertMany(initialTags);
    }

    res.json(tags);
  } catch (error) {
    console.error("Get Tags Error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// @route POST /api/tags
// @desc Create a new tag or parent group tag
router.post("/", protect, async (req, res) => {
  try {
    const { name, parentGroup, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const tag = await Tag.create({
      userId: req.user._id,
      name: name.trim(),
      parentGroup: parentGroup ? parentGroup.trim() : null,
      color: color || "#3b82f6",
    });

    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Tag already exists in this group" });
    }
    console.error("Create Tag Error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

// @route DELETE /api/tags/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete Tag Error:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

module.exports = router;

