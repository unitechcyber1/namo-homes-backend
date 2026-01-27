const asyncHandler = require("express-async-handler");
const State = require("../../models/stateModel");
const Country = require("../../models/countryModel");

const getState = asyncHandler(async (req, res) => {
  State.find({})
    .populate("country", "name")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

const getStateByCountry = asyncHandler(async (req, res) => {
  const countryId = req.body.country_id;

  if (!countryId) {
    return res.status(400).json({ message: "Missing country ID" });
  }

  await State.find({ country: countryId })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

module.exports = {
  getState,

  getStateByCountry,
};
