const asyncHandler = require("express-async-handler");
const Builder = require("../../models/builderModel");

const getBuilder = asyncHandler(async (req, res) => {
  Builder.find().sort({ createdAt: -1 })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const getAllBuilder = asyncHandler(async (req, res) => {
  try {
    let condition = {}
    const { name, status, page = 1, limit = 10 } = req.query;
    if (name) {
      condition['name'] = { $regex: name, $options: "i" };
    }
    const builder = await Builder.find(condition)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalCount = await Builder.countDocuments(condition);
    res.status(200).json({ message: "all builder", data: builder, totalCount });
  } catch (error) {
    console.log(error)
  }
});
const postBuilder = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    about_builder,
    starting_price,
    configuration,
    estb_year,
    dwarka_page_url,
    ratings,
    type,
    slug,
    residential_num,
    commercial_num,
    coming_soon,
    images,
    BuilderLogo,
    cities,
    seo,
  } = req.body;

  try {
    const BuilderData = await Builder.create({
      name,
      description,
      about_builder,
      starting_price,
      configuration,
      estb_year,
      dwarka_page_url,
      ratings,
      type,
      slug,
      residential_num,
      commercial_num,
      coming_soon,
      images,
      BuilderLogo,
      cities,
      seo,
    });
    res.json(BuilderData);
  } catch (error) {
    console.log(error);
  }
});

const getBuilderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const builder = await Builder.findById(id).exec();
    res.status(200).json(builder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const editBuilders = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      about_builder,
      starting_price,
      configuration,
      estb_year,
      dwarka_page_url,
      ratings,
      type,
      slug,
      residential_num,
      commercial_num,
      coming_soon,
      images,
      BuilderLogo,
      cities,
      seo,
    } = req.body;
    const builder = await Builder.findByIdAndUpdate(
      id,
      {
        name,
        description,
        about_builder,
        starting_price,
        configuration,
        estb_year,
        dwarka_page_url,
        ratings,
        type,
        slug,
        residential_num,
        commercial_num,
        coming_soon,
        images,
        BuilderLogo,
        cities,
        seo,
      },
      { new: true }
    );
    await builder.save();

    return res.status(200).json({ message: "builder updated successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const deleteBuilderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Builder.findByIdAndDelete({ _id: id })
    return res.status(200).json({ message: "builder deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
const topBuilderPropOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { order, status } = req.body;
    const modifiedProject = await Builder.findById(id);
    if (!modifiedProject) {
      return res.status(404).json({ error: "builder not found" });
    }
    const currentOrder = modifiedProject.is_popular.order;
    // if (modifiedProject.location.city.toString() !== cityId) {
    //   return res.status(400).json({
    //     error: "project does not belong to the specified city",
    //   });
    // }
    if (status === false && order === 1000) {
      modifiedProject.is_popular.status = false;
      modifiedProject.is_popular.order = order;
      await modifiedProject.save();
      await Builder.updateMany(
        {
          _id: { $ne: id },
          "is_popular.order": { $gt: currentOrder },
          "is_popular.status": true,
        },
        { $inc: { "is_popular.order": -1 } }
      );
    } else {
      modifiedProject.is_popular.order = order;
      modifiedProject.is_popular.status = order !== 1000;
      await modifiedProject.save();
    }
    res.json(modifiedProject);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
const topBuildersOrderByDrag = asyncHandler(async (req, res) => {
  try {
    const updatedProjects = req.body;
    for (const project of updatedProjects) {
      const { _id, is_popular } = project;
      await Builder.findByIdAndUpdate(_id, {
        $set: {
          "is_popular.order": is_popular.order,
          "is_popular.status": is_popular.order !== 1000,
        },
      });
    }
    res.json({ message: "Priority updated successfully" });
  } catch (error) {
    console.error("Error updating priority:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating priority" });
  }
});
const getTopBuilders = asyncHandler(async (req, res) => {
  try {
    const projects = await Builder.find({
      "is_popular.order": { $ne: 1000 } ,
    }).sort({ "is_popular.order": 1 })
      .exec();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = {
  getBuilder,
  postBuilder,
  getBuilderById,
  editBuilders,
  deleteBuilderById,
  getAllBuilder,
  topBuilderPropOrder,
  topBuildersOrderByDrag,
  getTopBuilders
};
