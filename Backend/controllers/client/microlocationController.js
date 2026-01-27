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
  const cityname = req.params.cityname;

  try {
    const city = await City.findOne({
      name: cityname,
    }).exec();

    if (!city) {
      return res.status(404).json({ error: "city not found" });
    }

    const microlocation = await MicroLocation.find({
      city: city._id,
      active: true,
    }).exec();

    res.json(microlocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getMicrolocationWithPriority = asyncHandler(async (req, res) => {
  try {
    const cityname = req.params.cityname;
    const city = await City.findOne({
      name: cityname,
    }).exec();

    if (!city) {
      return res.status(404).json({ error: "city not found" });
    }
    const microLocations = await MicroLocation.find({
      city: city._id,
      "priority.order": { $ne: 1000 }, // Exclude order 0 and 1000
    }).sort({ "priority.order": 1 });

    res.json(microLocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  getMicroLocation,
  getMicrolocationByCity,
  getMicroBycityName,
  getMicrolocationWithPriority,
};
