const express = require("express");
const {
  uploadImage,
  multipleUploadImage,
  getImages,
  deleteImages,
} = require("../../controllers/admin/imageUploadController");

const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.route("/upload").post(uploadImage);
router.route("/multiple-upload").post(protect, multipleUploadImage);
router.route("/getimages").get(protect, getImages);
router.route("/delete/:imageId").delete(protect, deleteImages);
module.exports = router;
