const asyncHandler = require("express-async-handler");
const Amenity = require("../../models/amenitiesModel");

const getAmenities = asyncHandler(async (req, res) => {
  try {
    let condition = {};
    const {isCommercial, isResidential} = req.query;
    if(isCommercial){
      condition['isCommercial'] = isCommercial;
    }
    if(isResidential){
      condition['isResidential'] = isResidential;
    }
    const amenity = await Amenity.find(condition).sort({createdAt: -1})
    res.status(200).json(amenity)
  } catch (error) {
    console.log(error)
  }
});
const postAmenities = asyncHandler(async (req, res) => {
  const { name, icon, isResidential, isCommercial } = req.body;
  try {
    const amenitiesData = await Amenity.create({
      name,
      icon,
      isResidential, isCommercial
    });

    res.json(amenitiesData);
  } catch (error) {
    console.log(error);
  }
});
const deleteAmenities = asyncHandler(async (req, res) => {
  const { amenityId } = req.params;
  await Amenity.findByIdAndDelete(amenityId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});
 const addOrEditAmenity = asyncHandler(async (req, res) => {
   const { name, icon, isResidential, isCommercial } = req.body;
   const { id } = req.params;
   try {
      await Amenity.findByIdAndUpdate(
       { _id: id },
       {
         name,
         icon,
         isResidential, isCommercial
       },
       { new: true }
     )
       .then(() => res.send("updated successfully"))
       .catch((err) => {
         console.log(err);
         res.send({
           error: err,
         });
       });
   } catch (error) {
     console.log(error);
   }
 });
const getAmenityById = asyncHandler(async (req, res) => {
  try {
    const {id} = req.params;
    const amenity = await Amenity.findById(id)
    res.status(200).json(amenity)
  } catch (error) {
    console.log(error);
  }
})


 module.exports = {
   getAmenities,
   postAmenities,
   deleteAmenities,
   addOrEditAmenity,
   getAmenityById
 };
