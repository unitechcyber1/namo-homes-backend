const asyncHandler = require("express-async-handler");
const CoworkingSpace = require("../../models/coworkingSpaceModel");
const City = require("../../models/cityModel");
const MicroLocation = require("../../models/microLocationModel");
const Brand = require("../../models/brandModel");

const getWorkSpaces = asyncHandler(async (req, res) => {
  try {
    const coworkingSpace = await CoworkingSpace.find({ status: "approve" })
      .populate("amenties", "name")
      .populate("brand", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .populate("plans.category", "name")
      .exec();

    if (!coworkingSpace) {
      return res.status(404).json({ message: "Coworking space not found" });
    }

    res.json(coworkingSpace);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const getWorkSpacesById = asyncHandler(async (req, res) => {
  try {
    const workSpace = await CoworkingSpace.findById(
      req.params.workSpaceId
    ).exec();
    res.status(200).json(workSpace);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const searchWorkSpacesByName = asyncHandler(async (req, res) => {
  const { name } = req.query;

  try {
    const workSpaceData = await CoworkingSpace.find({
      name: { $regex: name, $options: "i" },
    });
    res.json(workSpaceData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while searching for coworking spaces.",
    });
  }
});

const getWorkSpacesbyCity = asyncHandler(async (req, res) => {
  const cityName = req.params.city;

  try {
    const city = await City.findOne({
      name: cityName,
    }).exec();

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const coworkingSpaces = await CoworkingSpace.find({
      "location.city": city._id,
      status: "approve",
    })
      .populate("amenties", "name")
      .populate("brand", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .exec();

    res.json(coworkingSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getWorkSpacesbyCityId = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  try {
    const coworkingSpaces = await CoworkingSpace.find({
      "location.city": cityId,
      status: "approve",
    }).exec();

    res.json(coworkingSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getWorkSpacesbyMicrolocation = asyncHandler(async (req, res) => {
  const { citySlug, microlocationSlug } = req.params;
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of results per page

  try {
    const regexCitySlug = new RegExp(`^${citySlug}$`, "i");
    const city = await City.findOne({ name: regexCitySlug }).exec();
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const regexMicrolocationSlug = new RegExp(`^${microlocationSlug}$`, "i");

    // Find all microlocations with the matching name (case-insensitive) under the specific city
    const microlocationsInCity = await MicroLocation.find({
      name: regexMicrolocationSlug,
      city: city._id,
    }).exec();
    if (microlocationsInCity.length === 0) {
      return res.status(404).json({ error: "Microlocation not found" });
    }

    // Extract an array of microlocation ObjectId values
    const microlocationIds = microlocationsInCity.map(
      (microlocation) => microlocation._id
    );

    const totalCount = await CoworkingSpace.countDocuments({
      "location.city": city._id,
      "location.micro_location": { $in: microlocationIds },
      status: "approve",
    }).exec();

    const totalPages = Math.ceil(totalCount / limit); // Calculate total number of pages
    const count = await CoworkingSpace.countDocuments({
      "location.city": city._id,
      "location.micro_location": { $in: microlocationIds },
      status: "approve",
    });

    const coworkingSpaces = await CoworkingSpace.find({
      "location.city": city._id,
      "location.micro_location": { $in: microlocationIds },
      status: "approve",
    })
      .populate("amenties", "name")
      .populate("brand", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .sort({ "priority.order": 1 })
      .skip((page - 1) * limit) // Skip results based on page number
      .limit(limit) // Limit the number of results per page
      .exec();

    res.json({
      totalPages,
      totalCount: count,
      currentPage: page,
      coworkingSpaces,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getPriorityWorkSpacesbyCityandLocation = asyncHandler(
  async (req, res) => {
    const { city, location } = req.params;
    try {
      const regexCitySlug = new RegExp(`^${city}$`, "i");
      const city_name = await City.findOne({ name: regexCitySlug }).exec();
      if (!city_name) {
        return res.status(404).json({ error: "City not found" });
      }

      const regexMicrolocationSlug = new RegExp(`^${location}$`, "i");

      // Find all microlocations with the matching name (case-insensitive) under the specific city
      const microlocationsInCity = await MicroLocation.find({
        name: regexMicrolocationSlug,
        city: city_name._id,
      }).exec();
      if (microlocationsInCity.length === 0) {
        return res.status(404).json({ error: "Microlocation not found" });
      }

      // Extract an array of microlocation ObjectId values
      const microlocationIds = microlocationsInCity.map(
        (microlocation) => microlocation._id
      );

      const coworkingSpaces = await CoworkingSpace.find({
        "location.city": city_name._id,
        "location.micro_location": { $in: microlocationIds },
        status: "approve",
      })
        .populate("amenties", "name")
        .populate("brand", "name")
        .populate("location.city", "name")
        .populate("location.micro_location", "name")
        .sort({ "priority.order": 1 })
        .exec();

      res.json(coworkingSpaces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

const getWorkSpacesbyBrand = asyncHandler(async (req, res) => {
  const brand = req.params.brand;
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of results per page

  try {
    const all_brand = await Brand.findOne({
      name: { $regex: new RegExp(brand, "i") },
    }).exec();

    if (!all_brand) {
      return res.status(404).json({ error: "brand not found" });
    }

    const totalCount = await CoworkingSpace.countDocuments({
      brand: all_brand._id,
      status: "approve",
    }).exec();

    const totalPages = Math.ceil(totalCount / limit); // Calculate total number of pages
    const count = await CoworkingSpace.countDocuments({
      brand: all_brand._id,
      status: "approve",
    });
    const coworkingSpaces = await CoworkingSpace.find({
      brand: all_brand._id,
      status: "approve",
    })
      .populate("amenties", "name")
      .populate("brand", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .populate("plans.category", "name")
      .skip((page - 1) * limit) // Skip results based on page number
      .limit(limit) // Limit the number of results per page
      .exec();

    res.json({
      totalPages,
      totalCount: count,
      currentPage: page,
      coworkingSpaces,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getWorkSpacesbySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;

  try {
    const coworkingSpaces = await CoworkingSpace.find({
      slug: slug,
      status: "approve",
    })
      .populate("amenties", "name")
      .populate("brand", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .populate("plans.category", "name")
      .exec();

    res.json(coworkingSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getWorkSpacesbyLocation = asyncHandler(async (req, res) => {
  const workspaceSlug = req.params.workspaceSlug;

  CoworkingSpace.findOne({ slug: workspaceSlug })
    .then((workspace) => {
      if (!workspace) {
        return res.status(404).send("Workspace not found");
      }

      CoworkingSpace.find({
        _id: { $ne: workspace._id },
        "location.latitude": {
          $gte: workspace.location.latitude - 0.045,
          $lte: workspace.location.latitude + 0.045,
        },
        "location.longitude": {
          $gte: workspace.location.longitude - 0.045,
          $lte: workspace.location.longitude + 0.045,
        },
      })
        .populate("amenties", "name")
        .populate("brand", "name")
        .populate("location.city", "name")
        .populate("location.micro_location", "name")
        .then((nearbyWorkspaces) => {
          const result = {
            workspace,
            nearbyCount: nearbyWorkspaces.length,
            nearbyWorkspaces,
          };
          res.json(result);
        })
        .catch((error) => {
          console.error("Error while fetching nearby workspaces", error);
          res.status(500).send("Internal server error");
        });
    })
    .catch((error) => {
      console.error("Error while fetching workspace", error);
      res.status(500).send("Internal server error");
    });
});

const getPopularWorkSpacesbyCity = asyncHandler(async (req, res) => {
  const city = req.params.city;

  try {
    const regexCity = new RegExp(`^${city}$`, "i");
    const city_data = await City.findOne({
      name: regexCity,
    }).exec();

    if (!city_data) {
      return res.status(404).json({ error: "City not found" });
    }

    const coworkingSpaces = await CoworkingSpace.find({
      "location.city": city_data._id,
      status: "approve",
      "is_popular.order": { $nin: [0, 1000] }, // Exclude documents with priority.order equal to 1000
    })
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .sort({ "is_popular.order": 1 }) // Sort by priority.order in ascending order
      .exec();

    res.json(coworkingSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const getNearByWorkSpace = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.query;

  try {
    // Convert latitude and longitude to numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // Find nearby coworking spaces using the $geoNear aggregation
    const nearbyCoworkingSpaces = await CoworkingSpace.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lon, lat], // NOTE: The order is longitude (X), then latitude (Y)!
          },
          distanceField: "distance",
          maxDistance: 5000, // Adjust this value to set the maximum distance in meters (5 km in this example)
          spherical: true,
          query: { status: "approve" },
        },
      },
      {
        $lookup: {
          from: "microlocations", // Replace "microlocations" with the actual collection name for microlocations
          localField: "location.micro_location",
          foreignField: "_id",
          as: "microlocationData",
        },
      },
      {
        $unwind: "$microlocationData",
      },
      {
        $lookup: {
          from: "cities", // Replace "cities" with the actual collection name for cities
          localField: "location.city",
          foreignField: "_id",
          as: "cityData",
        },
      },
      {
        $unwind: "$cityData",
      },
      {
        $addFields: {
          "location.micro_location": "$microlocationData.name",
          "location.city": "$cityData.name",
        },
      },
      {
        $project: {
          microlocationData: 0, // Exclude microlocationData field from the final result
          cityData: 0, // Exclude cityData field from the final result
        },
      },
    ]);
    res.json(nearbyCoworkingSpaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching nearby coworking spaces" });
  }
});
module.exports = {
  getWorkSpaces,
  getWorkSpacesById,
  getWorkSpacesbyCity,
  searchWorkSpacesByName,
  getWorkSpacesbyMicrolocation,
  getWorkSpacesbyCityId,
  getWorkSpacesbyBrand,
  getWorkSpacesbySlug,
  getWorkSpacesbyLocation,
  getPopularWorkSpacesbyCity,
  getPriorityWorkSpacesbyCityandLocation,
  getNearByWorkSpace,
};
