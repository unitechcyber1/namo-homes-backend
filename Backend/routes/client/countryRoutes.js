const express = require("express");
const {
  getCountries,
  getCountryById,
} = require("../../controllers/client/countryController");
const router = express.Router();

router.get("/countries", getCountries).get("/country/:id", getCountryById);

module.exports = router;
