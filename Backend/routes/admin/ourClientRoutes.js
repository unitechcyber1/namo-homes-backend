const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getOurClients,
  postOurClients,
  deleteClient,
} = require("../../controllers/admin/ourClientsController");
const router = express.Router();

router
  .get("/clients", protect, getOurClients)
  .post("/client", protect, postOurClients)
  .delete("/delete/:id", protect, deleteClient);

module.exports = router;
