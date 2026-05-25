const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("EMAIL NHẬN:", email);
    console.log("PASSWORD NHẬN:", password);

    const [rows] = await db.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    console.log("USER TÌM ĐƯỢC:", rows);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Email không tồn tại"
      });
    }

    const user = rows[0];

    console.log("HASH DB:", user.password_hash);

    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log("MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Sai mật khẩu"
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