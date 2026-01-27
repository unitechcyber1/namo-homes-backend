const asyncHandler = require("express-async-handler");
const OurClient = require("../../models/ourClientModel");

const getOurClients = asyncHandler(async (req, res) => {
  OurClient.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

module.exports = { getOurClients };
