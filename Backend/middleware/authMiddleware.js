const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const redis = require("../config/redis");
require("dotenv").config();

const jwtAdminVerify = async (req, res, next) => {
  try {

    // ✅ Routes to exclude
    const excludedRoutes = [
      "/login",
      "/signup",
      "/forgot-password"
    ];

    if (excludedRoutes.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_ADMIN
    );

    const decryptedId = aes256.decrypt(
      process.env.AES_SECRET_KEY,
      decoded.id
    );

    const storedToken = await redis.get(decryptedId);

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    req.admin = {
      id: decryptedId,
      role: "admin",
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = jwtAdminVerify;
