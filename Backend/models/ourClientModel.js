const mongoose = require("mongoose");

const ourClientModel = mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    logo_url: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const OurClient = mongoose.model("OurClient", ourClientModel);
module.exports = OurClient;
