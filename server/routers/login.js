const express = require("express");
const client = require("../db/pgDB");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const result = await client.query(
      `SELECT * FROM ${userType}s WHERE email = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    var user = result.rows[0];

    const isPasswordValid = password == user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const { password: p, ...rest } = user;
    const token = jwt.sign({ ...rest, userType }, "111", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, user: { rest } });
  } catch (err) {
    console.error("Error logging in user", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
