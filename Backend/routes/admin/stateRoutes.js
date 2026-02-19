const express = require("express");
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
  .get("/states", getState)
  .get("/states/priority/:id", getStateWithPriority)
  .post("/statesbycountry", getStateByCountry)
  .post("/state", postState)
  .put("/states/:stateId", addOrEditState)
  .delete("/state/delete/:stateId", deleteState);

module.exports = router;
