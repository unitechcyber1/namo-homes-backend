const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getAmenities,
  postAmenities,
  deleteAmenities,
  addOrEditAmenity,
  getAmenityById
} = require("../../controllers/admin/amenitiesController");
const router = express.Router();

router
  .get("/amenities", getAmenities)
  .get("/:id", protect, getAmenityById)
  .post("/amenities", protect, postAmenities)
  .delete("/delete/:amenityId", protect, deleteAmenities)
  .put("/amenity-by-id/:id", protect, addOrEditAmenity);

module.exports = router;
