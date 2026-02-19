const asyncHandler = require("express-async-handler");
const BuilderProject = require("../../models/builderProjectModel");
const City = require("../../models/cityModel");
const MicroLocation = require("../../models/microLocationModel");
require("dotenv").config();
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
    const { name, city, location, status, page = 1, limit = 10, project_type, plans_type } = req.query;
    if (name) {
      condition['name'] = { $regex: name, $options: "i" };
    }
    if (city) {
      condition['location.city'] = city;
    }
    if (location) {
      condition['location.micro_location'] = location;
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
    const projects = await BuilderProject.find(condition)
      .populate("location.city", "name")
      .populate("location.micro_location", "name")
      .populate("builder", "name")
      .populate('images.image')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalCount = await BuilderProject.countDocuments(condition);
    if (!projects) {
      return res.status(404).json({ message: "project not found" });
    }
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
      .populate('plans.floor_plans.image')
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
