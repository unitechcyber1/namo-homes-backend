const express = require("express");
const {
  postBuilder,
  getBuilder,
  getBuilderById,
  editBuilders,
  deleteBuilderById,
  getAllBuilder,
  topBuilderPropOrder,
  topBuildersOrderByDrag,
  getTopBuilders,
} = require("../../controllers/admin/builderController");
const router = express.Router();

router
  .post("/", postBuilder)
  .put("/edit-builder/:id", editBuilders)
  .get("/builders", getBuilder)
  .get("/builders/:id", getBuilderById)
  .delete("/builder/delete/:id", deleteBuilderById)
  .get("/allbuilders", getAllBuilder)
  .put("/update-order/:id", topBuilderPropOrder)
  .put("/change-order", topBuildersOrderByDrag)
  .get("/top-builders", getTopBuilders);

module.exports = router;
