const express = require("express");
const {
  getProjects,
  getProjectsById,
  searchProjects,
  getProjectsWithPagination,
  getProjectBySlug,
} = require("../../controllers/client/builderProjectController");
const router = express.Router();

router
  .get("/projects", getProjects)
  .get("/projects-page", getProjectsWithPagination)
  .get("/projects/:id", getProjectsById)  
  .get("/search-projects", searchProjects)
  .get("/projects/slug/:slug", getProjectBySlug)
module.exports = router;
