const asyncHandler = require("express-async-handler");
const Brand = require("../../models/brandModel");

const getBrand = asyncHandler(async (req, res) => {
  Brand.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});

module.exports = { getBrand };
