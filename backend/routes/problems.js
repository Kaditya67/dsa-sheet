const express = require("express");
const Problem = require("../models/Problem");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/problems
// @desc Get all problems with filtering by tag, status, difficulty, or search query
router.get("/", protect, async (req, res) => {
  try {
    const { status, difficulty, tagId, search, favorite } = req.query;
    const filter = { userId: req.user._id };

    if (status && status !== "All") filter.status = status;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
    if (tagId) filter.tags = tagId;
    if (favorite === "true") filter.isFavorite = true;

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { personalNotes: { $regex: q, $options: "i" } },
        { "solutions.title": { $regex: q, $options: "i" } },
        { "solutions.explanation": { $regex: q, $options: "i" } },
      ];
    }

    const problems = await Problem.find(filter)
      .populate("tags")
      .sort({ updatedAt: -1 });

    res.json(problems);
  } catch (error) {
    console.error("Get Problems Error:", error);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// @route GET /api/problems/stats
// @desc Get analytics summary (totals by status and difficulty)
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Problem.countDocuments({ userId });
    const solved = await Problem.countDocuments({ userId, status: { $in: ["Solved", "Mastered"] } });
    const mustRevise = await Problem.countDocuments({ userId, status: "Must Revise" });
    const understood = await Problem.countDocuments({ userId, status: "Understood" });
    const attempted = await Problem.countDocuments({ userId, status: "Attempted" });
    const favorites = await Problem.countDocuments({ userId, isFavorite: true });

    const easy = await Problem.countDocuments({ userId, difficulty: "Easy" });
    const medium = await Problem.countDocuments({ userId, difficulty: "Medium" });
    const hard = await Problem.countDocuments({ userId, difficulty: "Hard" });

    res.json({
      total,
      solved,
      mustRevise,
      understood,
      attempted,
      favorites,
      byDifficulty: { easy, medium, hard },
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// @route GET /api/problems/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id }).populate("tags");
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (error) {
    console.error("Get Problem Detail Error:", error);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// @route POST /api/problems
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, difficulty, status, links, tags, solutions, personalNotes, isFavorite } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Problem title is required" });
    }

    const problem = await Problem.create({
      userId: req.user._id,
      title: title.trim(),
      description: description || "",
      difficulty: difficulty || "Medium",
      status: status || "Todo",
      links: links || [],
      tags: tags || [],
      solutions: solutions || [],
      personalNotes: personalNotes || "",
      isFavorite: Boolean(isFavorite),
      lastPracticedAt: new Date(),
    });

    const populated = await Problem.findById(problem._id).populate("tags");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Problem Error:", error);
    res.status(500).json({ error: "Failed to create problem" });
  }
});

// @route PUT /api/problems/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    updates.lastPracticedAt = new Date();

    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate("tags");

    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (error) {
    console.error("Update Problem Error:", error);
    res.status(500).json({ error: "Failed to update problem" });
  }
});

// @route PATCH /api/problems/:id/status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, lastPracticedAt: new Date() },
      { new: true }
    ).populate("tags");

    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (error) {
    console.error("Patch Status Error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// @route PATCH /api/problems/:id/toggle-favorite
router.patch("/:id/toggle-favorite", protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    problem.isFavorite = !problem.isFavorite;
    await problem.save();
    const populated = await Problem.findById(problem._id).populate("tags");
    res.json(populated);
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

// @route POST /api/problems/bulk-sync
// @desc Bulk import, update, or replace problems via JSON
router.post("/bulk-sync", protect, async (req, res) => {
  try {
    const { problems, mode } = req.body; // mode: 'upsert' (default) or 'replace'

    if (!Array.isArray(problems)) {
      return res.status(400).json({ error: "Input must be an array of problem objects" });
    }

    const userId = req.user._id;

    if (mode === "replace") {
      // Clear existing problems before inserting
      await Problem.deleteMany({ userId });
    }

    const processed = [];

    for (const item of problems) {
      if (!item.title || !item.title.trim()) continue;

      const problemData = {
        userId,
        title: item.title.trim(),
        difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium",
        status: ["Todo", "Attempted", "Understood", "Solved", "Must Revise", "Mastered"].includes(item.status)
          ? item.status
          : "Todo",
        isFavorite: Boolean(item.isFavorite),
        revisionCount: Number(item.revisionCount) || 0,
        description: item.description || "",
        links: Array.isArray(item.links) ? item.links : [],
        solutions: Array.isArray(item.solutions) ? item.solutions : [],
        tags: Array.isArray(item.tags)
          ? item.tags.map((t) => (typeof t === "object" && t !== null && t._id ? t._id : t))
          : [],
        personalNotes: item.personalNotes || "",
        lastPracticedAt: new Date(),
      };

      if (item._id && mode !== "replace") {
        // Try updating existing document by _id
        const existing = await Problem.findOneAndUpdate(
          { _id: item._id, userId },
          problemData,
          { new: true, upsert: true }
        );
        processed.push(existing);
      } else {
        const created = await Problem.create(problemData);
        processed.push(created);
      }
    }

    res.json({
      message: `Successfully processed ${processed.length} problems!`,
      count: processed.length,
    });
  } catch (error) {
    console.error("Bulk Sync Error:", error);
    res.status(500).json({ error: error.message || "Failed to process bulk problems" });
  }
});

// @route DELETE /api/problems/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Delete Problem Error:", error);
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

module.exports = router;

