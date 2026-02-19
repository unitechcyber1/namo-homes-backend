const express = require("express");
const {
  getOurClients,
  postOurClients,
  deleteClient,
} = require("../../controllers/admin/ourClientsController");
const router = express.Router();

router
  .get("/clients", getOurClients)
  .post("/client", postOurClients)
  .delete("/client/delete/:id", deleteClient);

module.exports = router;
