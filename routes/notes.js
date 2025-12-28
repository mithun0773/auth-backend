const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Category = require("../models/Category");
const { authMiddleware } = require("../middlewares/authMiddleware");

// GET /api/notes?categoryId=<id>
// If categoryId is provided, filter by it; otherwise return all user's notes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.categoryId) filter.category = req.query.categoryId;
    const notes = await Note.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .populate("category", "name");
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// POST /api/notes
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, color, categoryId } = req.body;
    const noteData = {
      userId: req.user.id,
      title,
      content,
      color,
      category: categoryId || null,
    };
    const note = await Note.create(noteData);
    await note.populate("category", "name");
    res.status(201).json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create note" });
  }
});

// PATCH /api/notes/:id
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const update = req.body; // allow title/content/color/pinned/category
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    ).populate("category", "name");
    res.json({ note: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE /api/notes/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
