const express = require("express");
const {
  postBuilderProjects,
  getProjects,
  getProjectsById,
  searchProjects,
  getProjectsbyBuilder,
  getProjectsWithPagination,
  
} = require("../../controllers/admin/builderProjectController");
const {uploadFilesToS3} = require("../../controllers/admin/fileUpload")
const router = express.Router();
const multer = require("multer");
require("dotenv").config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadMiddleware = (bucketName) => (req, res, next) => {
  uploadFilesToS3(req, res, bucketName, false, true);
};
router
  .get("/projects", getProjects)
  .get("/projects-page", getProjectsWithPagination)
  .get("/projects/:id", getProjectsById)  
  .get("/search-projects", searchProjects)
  .get("/projects-by-builder/:id", getProjectsbyBuilder)
module.exports = router;
