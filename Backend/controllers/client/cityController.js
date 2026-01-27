const asyncHandler = require("express-async-handler");
const City = require("../../models/cityModel");

const getCity = asyncHandler(async (req, res) => {
  await City.find({ active: true })
    .populate("country", "name")
    .populate("state", "name")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const getCityByState = asyncHandler(async (req, res) => {
  await City.find({ state: req.body.state_id })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
module.exports = { getCity, getCityByState };
