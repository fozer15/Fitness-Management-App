const express = require("express");
const router = express.Router();
const client = require("../db/pgDB");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  try {
    const existingUser = await client.query(
      "SELECT * FROM members WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const registeredMember = await client.query(
      `INSERT INTO members (fullName, email, password, address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password, address, phone]
    );

    await client.query(
      "INSERT INTO bills (billType, dueDate, amount, issuedDate, paidBy) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        "Club Registration",
        new Date(new Date().setDate(new Date().getDate() + 10))
          .toISOString()
          .split("T")[0],
        150,
        new Date(),
        registeredMember.rows[0].member_id,
      ]
    );

    res.status(201).json({ message: "registered successfully" });
  } catch (err) {
    console.error("Error registering member", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
