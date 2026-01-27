const mongoose = require("mongoose");

const microLocationModel = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    image: String,
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    active: {
      type: Boolean,
      default: true,
    },
    priority: {
      is_active: {
        type: Boolean,
        default: false,
      },
      order: {
        type: Number,
        default: 1000,
      },
      city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
      },
    },
  },
  {
    timestamps: true,
  }
);

const MicroLocation = mongoose.model("MicroLocation", microLocationModel);
module.exports = MicroLocation;
