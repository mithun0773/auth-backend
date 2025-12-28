require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");
const User = require("./models/User");
const noteRoutes = require("./routes/notes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(
  cors({
    origin: ["https://auth-dashboard1.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json()); // <-- THIS MUST BE HERE BEFORE ROUTES

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/auth/notes",noteRoutes);
app.use("/api/categories", require("./routes/category"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/tasks",taskRoutes);
app.get("/", (req, res) => res.json({ message: "Auth API Running" }));
app.use("/api/analytics", require("./routes/analytics"));



app.patch("/api/auth/update", authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  console.log("REQUEST BODY:", req.body);
  console.log("USER FROM TOKEN:", req.user);

  try {
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-passwordHash");

    console.log("UPDATED USER:", updateUser);

    res.json({ user: updateUser });
  } catch (err) {
    console.log("BACKEND UPDATE ERROR:", err);
    res.status(500).json({ message: "Update Failed" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server Running on Port", PORT));
