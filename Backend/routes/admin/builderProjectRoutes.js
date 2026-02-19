const express = require("express");
const {
  postBuilderProjects,
  getProjects,
  deleteProjects,
  changeProjectStatus,
  getProjectsById,
  editProjects,
  topProjectsPropOrder,
  topProjectsOrderByDrag,
  getProjectsbyCityId,
  getTopProjectbyCity,
  getProjectsbyMicrolocation,
  changeProjectOrder,
  getProjectbyMicrolocationWithPriority,
  changeProjectOrderbyDrag,
  searchProjects,
  getProjectsbyBuilder,
  changeBuilderProjectOrder,
  changeBuilderProjectOrderbyDrag,
  getProjectbyByBuilderWithPriority,
  getProjectsbyPlansAndCity,
  changePlansProjectOrder,
  changePlansProjectOrderbyDrag,
  getProjectbyByPlansWithPriority,
  getProjectsWithPagination,
  indiaProjectsOrder,
  indiaProjectsWithPriority,
  indiaProjectOrderbyDrag,
  imageOrderChanges,
  deleteProjectImage
} = require("../../controllers/admin/builderProjectController");
const { uploadFilesToS3 } = require("../../controllers/admin/fileUpload")
const router = express.Router();
const multer = require("multer");
require("dotenv").config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadMiddleware = (bucketName) => (req, res, next) => {
  uploadFilesToS3(req, res, bucketName, false, true);
};
router
  .post("/project", postBuilderProjects)
  .get("/projects", getProjects)
  .get("/projects-page", getProjectsWithPagination)
  .post("/upload", upload.array("files"), uploadMiddleware(process.env.BUCKET_NAME))
  .get("/projects/:id", getProjectsById)
  .delete("/delete/:id", deleteProjects)
  .post("/file/delete", deleteProjectImage)
  .put("/changeStatus/:id", changeProjectStatus)
  .put("/edit-project/:id", editProjects)
  .put("/best-projects/:id", topProjectsPropOrder)
  .put("/update-top-projects", topProjectsOrderByDrag)
  .get(
    "/projects-by-order/:city",

    getTopProjectbyCity
  )
  .get("/project-details/:cityId", getProjectsbyCityId)
  .get("/projects-by-location/:id", getProjectsbyMicrolocation)
  .put("/change-order/:id", changeProjectOrder)
  .get(
    "/priority-projects/:id",
    getProjectbyMicrolocationWithPriority
  )
  .put("/update-priority", changeProjectOrderbyDrag)
  .get("/search-projects", searchProjects)
  .get("/projects-by-builder/:id", getProjectsbyBuilder)
  .put("/builder-order/:id", changeBuilderProjectOrder)
  .put("/builder-priority", changeBuilderProjectOrderbyDrag)
  .get(
    "/builder-projects/:id",
    getProjectbyByBuilderWithPriority
  )
  .get("/projects-by-plans/:id/:city", getProjectsbyPlansAndCity)
  .put("/plans-order/:id", changePlansProjectOrder)
  .put("/plans-priority", changePlansProjectOrderbyDrag)
  .get(
    "/plans-projects/:id/:city",
    getProjectbyByPlansWithPriority
  )
  .put("/priority-india/:id", indiaProjectsOrder)
  .put("/drag-priority", indiaProjectOrderbyDrag)
  .get("/project-india", indiaProjectsWithPriority)
  .put("/drag-images", imageOrderChanges);
module.exports = router;
