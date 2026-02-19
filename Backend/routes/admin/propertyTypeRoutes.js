const express = require("express");
const {
  getPropertyTypes,
  postPropertyTypes,
  deletePropertyTypes,
} = require("../../controllers/admin/propertyTypeController");
const router = express.Router();

router
  .get("/propertyTypes", getPropertyTypes)
  .post("/propertyTypes", postPropertyTypes)
  .delete("/propertyType/delete/:propertyTypesId", deletePropertyTypes);

module.exports = router;
