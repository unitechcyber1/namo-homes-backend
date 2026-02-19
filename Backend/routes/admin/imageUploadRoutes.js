const express = require("express");
const {
  uploadImage,
  multipleUploadImage,
  getImages,
  deleteImages,
} = require("../../controllers/admin/imageUploadController");

const router = express.Router();

router.route("/upload").post(uploadImage);
router.route("/multiple-upload").post(multipleUploadImage);
router.route("/getimages").get(getImages);
router.route("/delete/:imageId").delete(deleteImages);
module.exports = router;
