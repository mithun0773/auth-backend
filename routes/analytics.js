const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const Task = require("../models/Task");
const Note = require("../models/Note");

router.get("/daily", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const formatted = day.toISOString().split("T")[0];
      days.push(formatted);
    }

    const tasks = await Task.find({ user: userId });
    const notes = await Note.find({ user: userId });

    let daily = days.map((d) => ({
      date: d,
      tasksCreated: 0,
      tasksCompleted: 0,
      notesCreated: 0,
    }));

    tasks.forEach((t) => {
      const created = t.createdAt.toISOString().split("T")[0];
      const completed = t.completedAt?.toISOString().split("T")[0];

      daily.forEach((day) => {
        if (day.date === created) day.tasksCreated++;
        if (completed && day.date === completed) day.tasksCompleted++;
      });
    });

    notes.forEach((n) => {
      const created = n.createdAt.toISOString().split("T")[0];
      daily.forEach((day) => {
        if (day.date === created) day.notesCreated++;
      });
    });

    res.json(daily);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
});

module.exports = router;
