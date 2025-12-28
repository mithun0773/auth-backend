const express = require("express");
const router = express.Router();
const {register,login} = require("../controllers/authControllers");
const {authMiddleware} = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
router.post("/register",register);
router.post("/login",login);

router.get("/me",authMiddleware,(req,res) => {
    res.json({user:req.user});
});
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.log("CHANGE PASSWORD ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports  = router;