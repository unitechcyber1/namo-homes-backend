const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
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
  .post("/", protect, postBuilder)
  .put("/edit-builder/:id", editBuilders)
  .get("/builders", protect, getBuilder)
  .get("/builders/:id", protect, getBuilderById)
  .delete("/builder/delete/:id", protect, deleteBuilderById)
  .get("/allbuilders", protect, getAllBuilder)
  .put("/update-order/:id", protect, topBuilderPropOrder)
  .put("/change-order", protect, topBuildersOrderByDrag)
  .get("/top-builders",protect, getTopBuilders);

module.exports = router;
