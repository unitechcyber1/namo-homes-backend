const mongoose = require("mongoose");

const stateModel = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
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
      country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
      },
    },
  },
  {
    timestamps: true,
  }
);

const State = mongoose.model("State", stateModel);
module.exports = State;
