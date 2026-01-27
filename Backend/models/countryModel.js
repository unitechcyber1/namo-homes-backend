const mongoose = require("mongoose");

const countryModel = mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    dial_code: String,
    iso_code: String,
    description: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.model("Country", countryModel);
module.exports = Country;
