const express = require("express");
const {
  uploadImage,
  getImages,
  deleteImages,
} = require("../../controllers/admin/mediaController");
const router = express.Router();

router.post("/media/upload", uploadImage)
  .get("/media/images", getImages)
  .delete("/delete/:imageId", deleteImages)
module.exports = router;