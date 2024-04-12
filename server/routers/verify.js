const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/verifyToken", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token from the Authorization header
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, "111", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }
    res.status(200).json({ message: "Token verified", user: decoded });
  });
});

module.exports = router;
