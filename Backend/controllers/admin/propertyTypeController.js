const asyncHandler = require("express-async-handler");
const PropertyType = require("../../models/propertyTypeModel");

const getPropertyTypes = asyncHandler(async (req, res) => {
  await PropertyType.find().sort({createdAt: -1})
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const postPropertyTypes = asyncHandler(async (req, res) => {
  const { name } = req.body;
  try {
    const propertyData = await PropertyType.create({
      name,
    });

    res.json(propertyData);
  } catch (error) {
    console.log(error);
  }
});
const deletePropertyTypes = asyncHandler(async (req, res) => {
  const { propertyTypesId } = req.params;
  await PropertyType.findByIdAndDelete(propertyTypesId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});

module.exports = { getPropertyTypes, postPropertyTypes, deletePropertyTypes };
