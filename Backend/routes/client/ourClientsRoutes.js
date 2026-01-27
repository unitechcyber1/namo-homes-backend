const express = require("express");
const {
  getOurClients,
} = require("../../controllers/client/ourClientController");

const router = express.Router();

router.get("/our-client", getOurClients);

module.exports = router;
