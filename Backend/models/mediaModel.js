const mongoose = require("mongoose");

const mediaModel = mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: false
    },
    description: String,
    active: {
        type: Boolean,
        default: true
    },
  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model("Media", mediaModel);
module.exports = Media;