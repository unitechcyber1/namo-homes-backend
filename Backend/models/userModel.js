const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userModel = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,        // ✅ Prevent duplicates
      lowercase: true,     // ✅ Auto lowercase
      trim: true,          // ✅ Remove spaces
    },
    password: {
      type: String,
      required: true,
      minlength: 6,        // ✅ Basic validation
    },
    verifytoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Compare password
userModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Hash password before save
userModel.pre("save", async function (next) {

  if (!this.isModified("password")) {
    return next();   // ✅ VERY IMPORTANT (return added)
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

const User = mongoose.model("User", userModel);
module.exports = User;
  
