const express = require("express");
const {
  uploadImage,
  getImages,
  deleteImages,
} = require("../../controllers/admin/mediaController");

const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/media/upload",protect, uploadImage)
.get("/media/images", protect, getImages)
.delete("/delete/:imageId", protect, deleteImages)
module.exports = router;