const asyncHandler = require("express-async-handler");
const OurClient = require("../../models/ourClientModel");

const postOurClients = asyncHandler(async (req, res) => {
  const { name, logo_url } = req.body;

  try {
    const ourClient = await OurClient.create({
      name,
      logo_url,
    });
    res.json(ourClient);
  } catch (error) {
    console.log(error);
  }
});

const getOurClients = asyncHandler(async (req, res) => {
  OurClient.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await OurClient.findByIdAndDelete(id)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});
module.exports = { postOurClients, getOurClients, deleteClient };
