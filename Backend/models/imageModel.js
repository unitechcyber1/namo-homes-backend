const mongoose = require("mongoose");

const imageModel = mongoose.Schema(
  {
        name: String,
        real_name: String,
        category: String,
        size: Number,
        height: Number,
        width: Number,
        s3_link: String,
        folder_name: String,
        title: String,
        title1: String,
        brightness: Number,
        contrast: Number,
        isDwarka: {type: Boolean, default: false}, 
        isProp: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

const Image = mongoose.model("Image", imageModel);
module.exports = Image;
