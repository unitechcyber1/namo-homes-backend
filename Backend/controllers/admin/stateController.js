const asyncHandler = require("express-async-handler");
const State = require("../../models/stateModel");

const getState = asyncHandler(async (req, res) => {
  State.find({})
    .populate("country", "name")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const postState = asyncHandler(async (req, res) => {
  const { name, description, country } = req.body;
  try {
    const statesData = await State.create({ name, description, country });
    res.json(statesData);
  } catch (error) {
    console.log(error);
  }
});
const addOrEditState = asyncHandler(async (req, res) => {});
const deleteState = asyncHandler(async (req, res) => {
  const { stateId } = req.params;
  await State.findByIdAndDelete(stateId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
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

const getStateWithPriority = asyncHandler(async (req, res) => {
  try {
    const country = req.params.id;

    const states = await State.find({
      country: country,
    }).sort({ "priority.order": 1 });

    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = {
  getState,
  postState,
  addOrEditState,
  deleteState,
  getStateByCountry,
  getStateWithPriority,
};
