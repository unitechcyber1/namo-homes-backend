const asyncHandler = require("express-async-handler");
const Image = require("../../models/imageModel");
const dotenv = require("dotenv");
const Media = require("../../models/mediaModel");
dotenv.config();

const uploadImage = asyncHandler(async (req, res) => {
 try {
    const {name, image, description, active} = req.body;
    const media = await Media.create({name, image, description, active})
    res.status(200).json({message: "Save successfully", data: media})
 } catch (error) {
    console.log(error)
 }
});
const getImages = asyncHandler(async (req, res) => {
try {
    const media = await Media.find().populate("image").sort({createdAt: -1})
    res.status(200).json({message: "All media",data: media})
} catch (error) {
   res.status(500).json({message: error})
}
});
const deleteImages = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  Image.findByIdAndDelete(imageId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});

module.exports = { uploadImage, getImages, deleteImages };
