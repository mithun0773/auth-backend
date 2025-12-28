const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { authMiddleware } = require("../middlewares/authMiddleware");

// CREATE CATEGORY
router.post("/", authMiddleware, async (req, res) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      user: req.user.id,
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

// GET ALL CATEGORIES (for logged-in user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// UPDATE
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category" });
  }
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

module.exports = router;
