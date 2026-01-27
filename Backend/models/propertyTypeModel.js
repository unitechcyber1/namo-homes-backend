const mongoose = require("mongoose");

const propertyTypeModel = mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PropertyType = mongoose.model("PropertyType", propertyTypeModel);
module.exports = PropertyType;
