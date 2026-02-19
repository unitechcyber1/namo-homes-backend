const express = require("express");
const {
  getCity,
  postCity,
  deleteCity,
  getCityByState,
  addOrEditCity,
} = require("../../controllers/admin/manageCity");
const router = express.Router();

router
  .get("/cities", getCity)
  .post("/cities", postCity)
  .delete("/city/delete/:cityId", deleteCity)
  .post("/citybystate", getCityByState)
  .put("/city-by-id/:id", addOrEditCity);

module.exports = router;
