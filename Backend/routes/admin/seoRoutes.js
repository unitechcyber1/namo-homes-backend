const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getSeo,
  postSeo,
  addOrEditSeo,
  deleteSeo,
  getSeoById,
} = require("../../controllers/admin/seoController");
const router = express.Router();

router
  .get("/seos", protect, getSeo)
  .get("/seos/:seoId", protect, getSeoById)
  .post("/seos", protect, postSeo)
  .put("/seos/:seoId", protect, addOrEditSeo)
  .delete("/delete/:seoId", protect, deleteSeo);

module.exports = router;
