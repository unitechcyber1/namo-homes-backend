const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const generateToken = require("../../config/jwtToken");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Basic validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  // 2️⃣ Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // 3️⃣ Check existing user
  const userExist = await User.findOne({ email: normalizedEmail });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists!");
  }

  // 4️⃣ Create user
  const user = await User.create({
    email: normalizedEmail,
    password
  });

  if (!user) {
    res.status(400);
    throw new Error("Failed to create the user!");
  }

  // 5️⃣ Generate token properly (await)
  const token = await generateToken(user._id);

  res.status(201).json({
    _id: user._id,
    email: user.email,
    token,
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter email and password");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {

    const token = await generateToken(user._id);

    res.json({
      _id: user._id,
      email: user.email,
      token,
    });

  } else {
    res.status(401);
    throw new Error("Invalid Email or password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [{ email: { $regex: req.query.search, $options: "i" } }],
    }
    : {};
  const users = await User.find(keyword).find({
    _id: { $ne: req.admin?.id || req.user?._id },
  });
  res.send(users);
});

const sendUserEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await User.findOne({ email: email });
    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, process.env.JWT_SECRET_ADMIN, {
      expiresIn: "120s",
    });
    const setusertoken = await User.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES ${process.env.ADMIN_FRONTEND_URL || 'https://admin.spacite.com'}/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});
const forgotUserPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});
const updateNewPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    if (validuser && verifyToken._id) {
      const salt = await bcrypt.genSalt(10);
      const newpassword = await bcrypt.hash(password, salt);

      const setnewuserpass = await User.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res
        .status(201)
        .json({ status: 201, message: "password updated successfully" });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  sendUserEmail,
  forgotUserPassword,
  updateNewPassword,
};
