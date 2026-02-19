const express = require("express");
const {
  getCountries,
  postCountry,
  addOrEditCountry,
  getCountryById,
  toggleCountryStatus,
  deleteCountry,
  s,
} = require("../../controllers/admin/manageCountry");
const router = express.Router();

router
  .get("/countries", getCountries)
  .post("/country", postCountry)
  .put("/country/:countryId", addOrEditCountry)
  .get("/country/:id", getCountryById)
  .get("/country/changeStatus/:countryId", toggleCountryStatus)
  .delete("/country/:countryId", deleteCountry);

module.exports = router;
