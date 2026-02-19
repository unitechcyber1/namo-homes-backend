const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const redis = require("../config/redis");
require("dotenv").config();

const generateToken = async (userId) => {
  const encryptedId = aes256.encrypt(
    process.env.AES_SECRET_KEY,
    userId.toString()
  );

  const token = jwt.sign(
    { id: encryptedId },
    process.env.JWT_SECRET_ADMIN,
    { expiresIn: "7d" }
  );

  // Save session in Redis (with expiry)
  await redis.set(userId.toString(), token, {
    EX: 60 * 60 * 24 * 7,
  });

  return token;
};

module.exports = generateToken;
