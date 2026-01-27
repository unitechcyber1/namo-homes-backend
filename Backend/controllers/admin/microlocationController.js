const asyncHandler = require("express-async-handler");
const MicroLocation = require("../../models/microLocationModel");
const City = require("../../models/cityModel");

const getMicroLocation = asyncHandler(async (req, res) => {
  await MicroLocation.find({})
    .populate("country", "name")
    .populate("state", "name")
    .populate("city", "name")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const postMicroLocation = asyncHandler(async (req, res) => {
  const { name, description, image, country, state, city } = req.body;
  try {
    const microLocationData = await MicroLocation.create({
      name,
      description,
      image,
      country,
      state,
      city,
    });

    res.json(microLocationData);
  } catch (error) {
    console.log(error);
  }
});
const deleteMicroLocation = asyncHandler(async (req, res) => {
  const { microlocationId } = req.params;
  await MicroLocation.findByIdAndDelete(microlocationId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
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
    }).exec();

    res.json(microlocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const addOrEditMicrolocation = asyncHandler(async (req, res) => {
  const { name, country, image, city, state, active } = req.body;
  const { id } = req.params;

  MicroLocation.findByIdAndUpdate(id, {
    name,
    image,
    country,
    city,
    state,
    active,
  })
    .then(() => res.send("updated successfully"))
    .catch((err) => {
      console.log(err);
      res.send({
        error: err,
      });
    });
});

const getMicrolocationWithPriority = asyncHandler(async (req, res) => {
  try {
    const cityId = req.params.cityId;

    const microLocations = await MicroLocation.find({
      city: cityId,
      "priority.order": { $ne: 1000 }, // Exclude order 0 and 1000
    }).sort({ "priority.order": 1 });

    res.json(microLocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const getMicrolocationForWorkspace = asyncHandler(async (req, res) => {
  try {
    const cityId = req.params.cityId;

    const microLocations = await MicroLocation.find({
      city: cityId,
    }).sort({ "priority.order": 1 });

    res.json(microLocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const changeOrderMicrolocationbyDrag = asyncHandler(async (req, res) => {
  try {
    const updatedMicrolocation = req.body; // The array of updated spaces sent from the client

    // Loop through the updatedSpaces array and update each coworking space in the database
    for (const micro of updatedMicrolocation) {
      const { _id, priority } = micro;
      // Find the coworking space by its _id and update its priority order
      await MicroLocation.findByIdAndUpdate(_id, {
        $set: {
          "priority.order": priority.order,
          "priority.is_active": priority.order !== 1000,
        },
      });
    }

    res.json({ message: "Priority updated successfully" });
  } catch (error) {
    console.error("Error updating priority:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating priority" });
  }
});
const changeOrderMicrolocation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { order, is_active, cityId } = req.body;

    // Find the coworking space to be updated
    const microlocationToUpdate = await MicroLocation.findById(id);
    if (!microlocationToUpdate) {
      return res.status(404).json({ error: "microlocation not found" });
    }

    const currentOrder = microlocationToUpdate.priority.order;
    if (microlocationToUpdate.city.toString() !== cityId) {
      return res.status(400).json({
        error: "microlocation does not find",
      });
    }
    if (is_active === false && order === 1000) {
      microlocationToUpdate.priority.is_active = false;
      microlocationToUpdate.priority.order = order;
      await microlocationToUpdate.save();

      // Decrement the higher order coworking spaces by one
      await MicroLocation.updateMany(
        {
          city: cityId,
          _id: { $ne: id }, // Exclude the current coworking space
          "priority.order": { $gt: currentOrder }, // Higher order workspaces
          "priority.is_active": true,
        },
        { $inc: { "priority.order": -1 } }
      );
    } else {
      // Update the priority of the coworking space to the specified order
      microlocationToUpdate.priority.order = order;

      // Update the "is_active" field based on the specified order
      microlocationToUpdate.priority.is_active = order !== 1000;

      await microlocationToUpdate.save();
    }

    res.json(microlocationToUpdate);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
module.exports = {
  getMicroBycityName,
  getMicroLocation,
  postMicroLocation,
  deleteMicroLocation,
  getMicrolocationByCity,
  addOrEditMicrolocation,
  getMicrolocationWithPriority,
  changeOrderMicrolocationbyDrag,
  changeOrderMicrolocation,
  getMicrolocationForWorkspace,
};
