const express = require("express")
const { createNewLaunch, updateNewLaunch, getNewLaunch, deleteNewLaunch, getNewLaunchById, changeStatus } = require("../../controllers/admin/newLaunchController")
const router = express.Router()


router.post("/create", createNewLaunch)
  .put("/update/:id", updateNewLaunch)
  .delete("/delete/:id", deleteNewLaunch)
  .get("/all", getNewLaunch)
  .get("/byId/:id", getNewLaunchById)
  .put("/changeStatus/:id", changeStatus)


module.exports = router;