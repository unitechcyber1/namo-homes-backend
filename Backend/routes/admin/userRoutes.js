const express = require("express");
const {registerUser,authUser,allUsers,sendUserEmail,forgotUserPassword,updateNewPassword,} = require("../../controllers/admin/authController");

const router = express.Router();

router.post("/signup", registerUser)
      .get("/users", allUsers)
      .post("/login", authUser)
      .post("/sendpasswordlink", sendUserEmail)
      .get("/forgot-password/:id/:token", forgotUserPassword)
      .post("/:id/:token", updateNewPassword);

module.exports = router;
