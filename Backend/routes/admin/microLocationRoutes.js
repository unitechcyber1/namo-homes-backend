const express = require("express");
const {
  getMicroLocation,
  postMicroLocation,
  deleteMicroLocation,
  getMicrolocationByCity,
  getMicroBycityName,
  addOrEditMicrolocation,
  getMicrolocationWithPriority,
  changeOrderMicrolocation,
  changeOrderMicrolocationbyDrag,
  getMicrolocationForWorkspace,
} = require("../../controllers/admin/microlocationController");
const router = express.Router();

router
  .get("/locations",  getMicroLocation)
  .get(
    "/priority/:cityId",
    

    getMicrolocationWithPriority
  )
  .get(
    "/priority-location/:cityId",
    

    getMicrolocationForWorkspace
  )
  .put("/priority-microlocation/:id",  changeOrderMicrolocation)
  .put(
    "/update-microlocation-priority",
    
    changeOrderMicrolocationbyDrag
  )
  .post("/microbycity",  getMicrolocationByCity)
  .post("/microlocations",  postMicroLocation)
  .delete("/microlocation/delete/:microlocationId",  deleteMicroLocation)
  .get("/micro-locations/:cityname",  getMicroBycityName)
  .put("/micro-by-id/:id",  addOrEditMicrolocation);

module.exports = router;
