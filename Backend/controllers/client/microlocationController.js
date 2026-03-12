const asyncHandler = require("express-async-handler");
const MicroLocation = require("../../models/microLocationModel");
const City = require("../../models/cityModel");

const getMicroLocation = asyncHandler(async (req, res) => {
  await MicroLocation.find({ active: true })
    .populate("country", "name")
    .populate("state", "name")
    .populate("city", "name")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

const getMicrolocationByCity = asyncHandler(async (req, res) => {
  await MicroLocation.find({ city: req.body.city_id })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

const getMicroBycityName = asyncHandler(async (req, res) => {
  let cityname = req.params.cityname;
  if (cityname == null || typeof cityname !== "string") {
    return res.status(400).json({ error: "City name is required" });
  }
  cityname = decodeURIComponent(cityname).trim();
  if (!cityname) {
    return res.status(400).json({ error: "City name is required" });
  }

  const city = await City.findOne({
    name: { $regex: new RegExp(`^${cityname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  }).exec();

  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  const microlocations = await MicroLocation.find({
    city: city._id,
    active: true,
  })
    .populate("city", "name")
    .sort({ name: 1 })
    .lean()
    .exec();

  return res.status(200).json(microlocations);
});

const getMicrolocationWithPriority = asyncHandler(async (req, res) => {
  let cityname = req.params.cityname;
  if (cityname == null || typeof cityname !== "string") {
    return res.status(400).json({ error: "City name is required" });
  }
  cityname = decodeURIComponent(cityname).trim();
  if (!cityname) {
    return res.status(400).json({ error: "City name is required" });
  }

  const city = await City.findOne({
    name: { $regex: new RegExp(`^${cityname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  }).exec();

  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  const microLocations = await MicroLocation.find({
    city: city._id,
    "priority.order": { $ne: 1000 },
  })
    .sort({ "priority.order": 1 })
    .lean()
    .exec();

  return res.status(200).json(microLocations);
});

module.exports = {
  getMicroLocation,
  getMicrolocationByCity,
  getMicroBycityName,
  getMicrolocationWithPriority,
};
