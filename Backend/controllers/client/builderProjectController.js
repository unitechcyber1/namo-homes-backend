const asyncHandler = require("express-async-handler");
const BuilderProject = require("../../models/builderProjectModel");
const City = require("../../models/cityModel");
const MicroLocation = require("../../models/microLocationModel");
require("dotenv").config();

// Best-effort parser to turn starting_price string into a numeric value
// so we can sort low-to-high / high-to-low consistently.
// Examples handled: "5000000", "50,00,000", "₹ 75 Lakh", "1.2 Cr"
function parseStartingPrice(value) {
  if (!value || typeof value !== "string") return NaN;
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
    if(plans_type){
      condition['plans_type'] = plans_type
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



module.exports = {
  getProjects,
  getProjectsById,
  searchProjects,
  getProjectsWithPagination,
};
