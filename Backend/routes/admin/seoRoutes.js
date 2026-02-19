const express = require("express");
const {
  getSeo,
  postSeo,
  addOrEditSeo,
  deleteSeo,
  getSeoById,
} = require("../../controllers/admin/seoController");
const router = express.Router();

router
  .get("/seos",  getSeo)
  .get("/seos/:seoId",  getSeoById)
  .post("/seos",  postSeo)
  .put("/seos/:seoId",  addOrEditSeo)
  .delete("/delete/:seoId",  deleteSeo);

module.exports = router;
