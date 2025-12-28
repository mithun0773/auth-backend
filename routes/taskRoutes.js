const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const {authMiddleware} = require("../middlewares/authMiddleware");

//Create Task
router.post("/", authMiddleware, async (req,res) => {
    const {title,priority} = req.body;

    const task = await Task.create({
        user:req.user.id,
        title,
        priority,
    });
    res.json({task});
});

router.get("/",authMiddleware,async (req,res) => {
    const tasks = await Task.find({user:req.user.id}).sort({createdAt:-1});
    res.json(tasks);
})

// Update Task
router.patch("/:id", authMiddleware, async (req, res) => {
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );

  res.json(updated);
});

// Delete Task
router.delete("/:id", authMiddleware, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  res.json({ message: "Task deleted" });
});


// GET: last 30 days activity heatmap
router.get("/activity/heatmap", authMiddleware, async (req, res) => {
  const days = 30;
  const today = new Date();

  // build last 30 days list
  const dates = [...Array(days)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  // fetch user tasks
  const tasks = await Task.find({ user: req.user.id });

  // count per day
  const data = dates.reverse().map((date) => {
    const count = tasks.filter(
      (t) => new Date(t.createdAt).toISOString().split("T")[0] === date
    ).length;

    return { date, count };
  });

  res.json(data);
});

module.exports = router;