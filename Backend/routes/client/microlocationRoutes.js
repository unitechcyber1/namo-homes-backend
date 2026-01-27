const express = require("express");
const {
  getMicroLocation,
  getMicrolocationByCity,
  getMicroBycityName,
  getMicrolocationWithPriority,
} = require("../../controllers/client/microlocationController");
const router = express.Router();

router
  .get("/microlocations", getMicroLocation)
  .get("/priority/:cityname", getMicrolocationWithPriority)
  .post("/microbycity", getMicrolocationByCity)
  .get("/micro-locations/:cityname", getMicroBycityName);

module.exports = router;
