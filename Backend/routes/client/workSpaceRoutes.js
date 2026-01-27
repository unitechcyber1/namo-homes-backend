// const express = require("express");
// const {
//   getWorkSpaces,
//   getWorkSpacesById,
//   searchWorkSpacesByName,
//   getWorkSpacesbyCity,
//   getWorkSpacesbyMicrolocation,
//   getWorkSpacesbyCityId,
//   getWorkSpacesbyBrand,
//   getWorkSpacesbySlug,
//   getWorkSpacesbyLocation,
//   getPopularWorkSpacesbyCity,
//   getPriorityWorkSpacesbyCityandLocation,
//   getNearByWorkSpace,
// } = require("../../controllers/client/workSpaceController");
// const router = express.Router();

// router
//   .get("/workSpace", getWorkSpaces)
//   .get("/workspaces/search", searchWorkSpacesByName)
//   .get("/:workSpaceId", getWorkSpacesById)
//   .get("/coworking/:city", getWorkSpacesbyCity)
//   .get("/coworking-details-byid/:cityId", getWorkSpacesbyCityId)
//   .get(
//     "/workSpace-details/:citySlug/:microlocationSlug",
//     getWorkSpacesbyMicrolocation
//   )
//   .get("/coworking-details-brand/:brand", getWorkSpacesbyBrand)
//   .get("/coworking-details-slug/:slug", getWorkSpacesbySlug)
//   .get("/workspaces/slug/:workspaceSlug", getWorkSpacesbyLocation)
//   .get(
//     "/popular-workspace/:city",

//     getPopularWorkSpacesbyCity
//   )
//   .get(
//     "/priority-city-workspace/:city/:location",

//     getPriorityWorkSpacesbyCityandLocation
//   )
//   .get(
//     "/coworking_spaces/nearby",

//     getNearByWorkSpace
//   );

// module.exports = router;
