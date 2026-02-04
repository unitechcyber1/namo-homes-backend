const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getState,
  postState,
  addOrEditState,
  deleteState,
  getStateByCountry,
  getStateWithPriority,
} = require("../../controllers/admin/stateController");
const router = express.Router();

router
  .get("/states", protect, getState)
  .get("/states/priority/:id", protect, getStateWithPriority)
  .post("/statesbycountry", protect, getStateByCountry)
  .post("/states", protect, postState)
  .put("/states/:stateId", protect, addOrEditState)
  .delete("/state/delete/:stateId", protect, deleteState);

module.exports = router;
