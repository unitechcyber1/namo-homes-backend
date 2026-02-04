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
  .get("/amenity", getAmenities)
  .get("/amenity/:id", protect, getAmenityById)
  .post("/amenities", protect, postAmenities)
  .delete("/amenity/delete/:amenityId", protect, deleteAmenities)
  .put("/amenity-by-id/:id", protect, addOrEditAmenity);

module.exports = router;
