const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("RECEIVED EMAIL:", email);
    console.log("RECEIVED PASSWORD:", password);

    const [rows] = await db.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    console.log("USER FOUND:", rows);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Email does not exist"
      });
    }

    const user = rows[0];

    console.log("DB HASH:", user.password_hash);

    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log("MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  login
};