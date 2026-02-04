const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getPropertyTypes,
  postPropertyTypes,
  deletePropertyTypes,
} = require("../../controllers/admin/propertyTypeController");
const router = express.Router();

router
  .get("/propertyTypes", protect, getPropertyTypes)
  .post("/propertyTypes", protect, postPropertyTypes)
  .delete("/propertyType/delete/:propertyTypesId", protect, deletePropertyTypes);

module.exports = router;
