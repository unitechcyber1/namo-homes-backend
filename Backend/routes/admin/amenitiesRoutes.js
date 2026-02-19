const express = require("express");
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
  .get("/amenity/:id", getAmenityById)
  .post("/amenities", postAmenities)
  .delete("/amenity/delete/:amenityId", deleteAmenities)
  .put("/amenity-by-id/:id", addOrEditAmenity);

module.exports = router;
