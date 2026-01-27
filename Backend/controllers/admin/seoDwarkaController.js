const asyncHandler = require("express-async-handler");
const SeoDwarka = require("../../models/seoDwarkaModel")

const getSeo = asyncHandler(async (req, res) => {
  SeoDwarka.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
const postSeo = asyncHandler(async (req, res) => {
  const {
    title,
    page_title,
    script,
    header_description,
    description,
    robots,
    index,
    keywords,
    url,
    status,
    path,
    footer_title,
    footer_description,
    twitter,
    open_graph,
  } = req.body;
  try {
    const seoData = await SeoDwarka.create({
      title,
      page_title,
      script,
      header_description,
      description,
      robots,
      index,
      keywords,
      url,
      status,
      path,
      footer_title,
      footer_description,
      twitter,
      open_graph,
    });
    res.json(seoData);
  } catch (error) {
    console.log(error);
  }
});
const addOrEditSeo = asyncHandler(async (req, res) => {
  const {
    title,
    page_title,
    script,
    header_description,
    description,
    robots,
    index,
    keywords,
    url,
    status,
    path,
    footer_title,
    footer_description,
    twitter,
    open_graph,
  } = req.body;
  const { seoId } = req.params;
  SeoDwarka.findByIdAndUpdate(
    seoId,
    {
      title,
      page_title,
      script,
      header_description,
      description,
      robots,
      index,
      keywords,
      url,
      status,
      path,
      footer_title,
      footer_description,
      twitter,
      open_graph,
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
});
const deleteSeo = asyncHandler(async (req, res) => {
  const { seoId } = req.params;
  await SeoDwarka.findByIdAndDelete(seoId)
    .then(() => {
      res.send("delete successfully");
    })
    .catch((err) => {
      res.send({
        error: err,
      });
    });
});

const getSeoById = asyncHandler(async (req, res) => {
  try {
    const user = await SeoDwarka.findById(req.params.seoId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = { getSeo, postSeo, addOrEditSeo, deleteSeo, getSeoById };
