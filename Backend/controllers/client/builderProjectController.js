const asyncHandler = require("express-async-handler");
const BuilderProject = require("../../models/builderProjectModel");
const City = require("../../models/cityModel");
const MicroLocation = require("../../models/microLocationModel");
const PropertyType = require("../../models/propertyTypeModel");
require("dotenv").config();

// Best-effort parser to turn starting_price (string or number) into a numeric value
// for sort/display. Examples: "5000000", "50 Lakh", "1.2 Cr", or already 5000000
function parseStartingPrice(value) {
  if (value == null) return NaN;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value !== "string") return NaN;
  const lower = value.toLowerCase();

  // Extract number part (digits, commas, dots)
  const match = lower.match(/[\d.,]+/);
  if (!match) return NaN;
  let num = match[0].replace(/,/g, "");
  let parsed = parseFloat(num);
  if (Number.isNaN(parsed)) return NaN;

  // Scale for common Indian units if present
  if (lower.includes("cr")) {
    parsed = parsed * 1e7; // 1 Cr = 1,00,00,000
  } else if (lower.includes("lac") || lower.includes("lakh")) {
    parsed = parsed * 1e5; // 1 Lakh = 1,00,000
  }

  return parsed;
}
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await BuilderProject.find()
      .populate("amenties", "name")
      .populate("builder", "name")
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .populate("plans.category", "name")
      .exec();

    if (!projects) {
      return res.status(404).json({ message: "project not found" });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
const getProjectsWithPagination = asyncHandler(async (req, res) => {
  try {
    let condition = {}
    const {
      name,
      city,
      location,
      microlocation,
      status,
      page = 1,
      limit = 10,
      project_type,
      plans_type,
      project_status,
      price_sort, // 'low_to_high' | 'high_to_low'
      min_price,  // optional, numeric (rupees), e.g. 5000000 for 50 Lakh
      max_price,  // optional, numeric (rupees), e.g. 100000000 for 1 Cr
    } = req.query;
    if (name) {
      condition['name'] = { $regex: name, $options: "i" };
    }
    if (city) {
      condition['location.city'] = city;
    }
    if (location) {
      condition['location.micro_location'] = location;
    }
    if (microlocation && microlocation.trim()) {
      const searchTerm = microlocation.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const microLocations = await MicroLocation.find({
        name: { $regex: searchTerm, $options: "i" },
      })
        .select("_id")
        .lean();
      const microIds = microLocations.map((m) => m._id);
      if (microIds.length > 0) {
        condition["location.micro_location"] = { $in: microIds };
      } else {
        condition["_id"] = null;
      }
    }
    // if (shouldApprove) {
    //     condition['status'] = 'approve';
    //     condition['is_active'] = true;
    // }
    if (status) {
      condition['status'] = status;
    }
    if (status == 'all') {
      delete condition['status']
    }
    if (project_type) {
      condition['project_type'] = project_type;
    }
    // plans_type: frontend sends PropertyType name (string); resolve to ObjectId and filter
    if (plans_type && plans_type !== "all") {
      const name = String(plans_type).trim();
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const types = await PropertyType.find({
        name: { $regex: escaped, $options: "i" },
      })
        .select("_id")
        .lean();
      const typeIds = types.map((t) => t._id);
      if (typeIds.length > 0) {
        condition["plans_type"] =
          typeIds.length === 1 ? typeIds[0] : { $in: typeIds };
      } else {
        condition["_id"] = null;
      }
    }

    // Price range filter at DB level.
    // Your existing data shows `starting_price` stored as numeric strings (e.g. "29000000"),
    // so `$gte/$lte` with numbers will not match unless we cast.
    // This uses $convert so it works whether starting_price is stored as number or string.
    const minVal =
      min_price != null && min_price !== "" ? Number(min_price) : null;
    const maxVal =
      max_price != null && max_price !== "" ? Number(max_price) : null;

    const priceExpr = [];
    if (minVal != null && !Number.isNaN(minVal)) {
      priceExpr.push({
        $gte: [
          {
            $convert: {
              input: "$starting_price",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
          minVal,
        ],
      });
    }
    if (maxVal != null && !Number.isNaN(maxVal)) {
      priceExpr.push({
        $lte: [
          {
            $convert: {
              input: "$starting_price",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
          maxVal,
        ],
      });
    }

    if (priceExpr.length === 1) {
      condition.$expr = priceExpr[0];
    } else if (priceExpr.length > 1) {
      condition.$expr = { $and: priceExpr };
    }
    if (project_status && project_status !== 'all') {
      condition['project_status'] = project_status;
    }
    condition['status'] = 'approve';
    const allProjects = await BuilderProject.find(condition)
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("builder", "name")
      .populate('images.image')
      .exec();

    if (!allProjects) {
      return res.status(404).json({ message: "project not found" });
    }

    // Sort in-memory to support complex string -> number parsing for starting_price
    let sortedProjects = [...allProjects];
    if (price_sort === 'low_to_high' || price_sort === 'high_to_low') {
      sortedProjects.sort((a, b) => {
        const aVal = parseStartingPrice(a.starting_price);
        const bVal = parseStartingPrice(b.starting_price);

        // Put NaN (missing/invalid) at the end for both directions
        const aNaN = Number.isNaN(aVal);
        const bNaN = Number.isNaN(bVal);
        if (aNaN && bNaN) return 0;
        if (aNaN) return 1;
        if (bNaN) return -1;

        return price_sort === 'low_to_high' ? aVal - bVal : bVal - aVal;
      });
    } else {
      // Default: newest first (like before)
      sortedProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCount = sortedProjects.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const projects = sortedProjects.slice(startIndex, endIndex);
    res.status(200).json({
      totalCount,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
const getProjectsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const project = await BuilderProject.findById(id)
      .populate('images.image')
      .populate("allAmenities.commercial", "name icon")
      .populate("allAmenities.residential", "name icon")
      .populate('plans.floor_plans.image')
      .populate('plans.category', 'name')
      .populate('master_plan')
      .populate('location_map')
      .populate('brochure')
      .exec();
    if (!project) {
      res.status(404).json({ message: "Project not found" });
    } else {
      project.images.sort((a, b) => a.order - b.order);
      res.status(200).json(project);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const searchProjects = asyncHandler(async (req, res) => {
  try {
    const { name, city, microlocation, status } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (city) {
      const cities = await City.findOne({
        name: { $regex: `^${city}`, $options: "i" },
      });
      if (cities) {
        query["location.city"] = cities._id;
      }
    }

    if (microlocation) {
      const micro = await MicroLocation.findOne({ name: { $regex: `^${microlocation}`, $options: 'i' } });
      if (micro) {
        query["location.micro_location"] = micro._id;
      }
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10;
    const totalCount = await BuilderProject.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const projects = await BuilderProject.find(query)
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.json({
      totalPages,
      totalCount,
      currentPage: page,
      projects,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
})

const getProjectBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await BuilderProject.findOne({ slug })
    .populate('images.image')
    .populate("allAmenities.commercial", "name icon")
    .populate("allAmenities.residential", "name icon")
    .populate('plans.floor_plans.image')
    .populate('plans.category', 'name')
    .populate('master_plan')
    .populate('location_map')
    .populate('brochure')
    .exec();
    if (!project) {
      res.status(404).json({ message: "Project not found" });
    } else {
      project.images.sort((a, b) => a.order - b.order); 
      res.status(200).json(project);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = {
  getProjects,
  getProjectsById,
  searchProjects,
  getProjectsWithPagination,
  getProjectBySlug,
};
