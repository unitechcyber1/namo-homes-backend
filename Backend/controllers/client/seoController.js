const asyncHandler = require("express-async-handler");
const SEO = require("../../models/seoModel");

const getSeo = asyncHandler(async (req, res) => {
  const path = req.params.path;

  try {
    const seos = await SEO.findOne({
      path: path,
    }).exec();
    if (!seos) {
      return res.status(404).json({ error: "path not found" });
    }

    res.json(seos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { getSeo };
