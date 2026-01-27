const asyncHandler = require("express-async-handler");
const Country = require("../../models/countryModel");
// const generateToken = require("../config/jwtToken");

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
const postCountry = asyncHandler(async (req, res) => {
  const { name, dial_code, iso_code, description } = req.body;

  try {
    const country = await Country.create({
      name,
      dial_code,
      iso_code,
      description,
    });
    if (country) {
      res.status(201).json({
        _id: country._id,
        name: country.name,
        dial_code: country.dial_code,
        iso_code: country.iso_code,
        description: country.description,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the country!");
    }
  } catch (error) {
    res.send({
      error: error,
    });
  }
});

const addOrEditCountry = asyncHandler(async (req, res) => {
  const { name, dial_code, iso_code } = req.body;
  const { countryId } = req.params;

  Country.findByIdAndUpdate(countryId, {
    name,
    dial_code,
    iso_code,
  })
    .then(() => res.send("updated successfully"))
    .catch((err) => {
      console.log(err);
      res.send({
        error: err,
      });
    });
});
const getCountryById = asyncHandler(() => {});
const toggleCountryStatus = asyncHandler(() => {});
const deleteCountry = asyncHandler(async (req, res) => {
  const { countryId } = req.params;
  await Country.findByIdAndDelete(countryId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});

module.exports = {
  getCountries,
  postCountry,
  addOrEditCountry,
  getCountryById,
  toggleCountryStatus,
  deleteCountry,
};
