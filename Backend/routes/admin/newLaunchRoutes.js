const express = require("express")
const { protect } = require("../../middleware/authMiddleware")
const { createNewLaunch, updateNewLaunch, getNewLaunch, deleteNewLaunch, getNewLaunchById, changeStatus } = require("../../controllers/admin/newLaunchController")
const router = express.Router()


router.post("/create", protect, createNewLaunch)
      .put("/update/:id", protect, updateNewLaunch)
      .delete("/delete/:id", protect, deleteNewLaunch)
      .get("/all", protect, getNewLaunch)
      .get("/byId/:id", protect, getNewLaunchById)
      .put("/changeStatus/:id",protect, changeStatus)
      
      
    module.exports = router;