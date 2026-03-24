const express = require("express");
const {
  getBuilders,
  getBuilderById,
} = require("../../controllers/client/builderController");

const router = express.Router();

router.get("/builders", getBuilders);
router.get("/builders/:id", getBuilderById);

module.exports = router;
