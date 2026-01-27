const express = require("express");
const {
  getCity,
  getCityByState,
} = require("../../controllers/client/cityController");
const router = express.Router();

router.get("/cities", getCity)
  .post("/citybystate", getCityByState);

module.exports = router;
