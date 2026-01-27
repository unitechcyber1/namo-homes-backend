const asyncHandler = require("express-async-handler");
const Country = require("../../models/countryModel");

const getCountries = asyncHandler(async (req, res) => {
  Country.find()
    .then((result) => {
      res.status(200).json({
        country: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

const getCountryById = asyncHandler(() => {});

module.exports = {
  getCountries,

  getCountryById,
};
