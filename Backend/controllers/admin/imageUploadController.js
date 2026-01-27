const asyncHandler = require("express-async-handler");
const Image = require("../../models/imageModel");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");
dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
});
const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `image-${Date.now()}.jpeg`);
      },
    }),
  });

const uploadImage = asyncHandler(async (req, res, next) => {
  const uploadSingle = upload("my-bucket-image").single("file");
  uploadSingle(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    res.status(200).json({ data: req.file });
  });
});

const multipleUploadImage = asyncHandler(async (req, res, next) => {
  const { name, real_name, category, size, height, width, title, title1 } =
    req.body;

  try {
    if (!name || !real_name) {
      res.status(400);
      throw new Error("Please enter all the fields!");
    }
    const images = await Image.create({
      name,
      real_name,
      category,
      size,
      height,
      width,
      title,
      title1,
    });
    res.json(images);
  } catch (error) {
    console.log(error);
  }
});

const getImages = asyncHandler(async (req, res) => {
  Image.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
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

module.exports = { uploadImage, multipleUploadImage, getImages, deleteImages };
