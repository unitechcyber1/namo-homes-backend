const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Builder = require("../../models/builderModel");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /builders — list builders for public site (active only).
 * Query: page, limit, search (name), has_logo (true|false) — only builders with non-empty BuilderLogo
 */
const getBuilders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const search = (req.query.search || "").trim();
  const hasLogoParam = req.query.has_logo;

  let condition = {};
  if (search) {
    condition.name = { $regex: escapeRegex(search), $options: "i" };
  }
  if (hasLogoParam === "true" || hasLogoParam === true) {
    condition.BuilderLogo = { $exists: true, $nin: [null, ""] };
  }
  const [totalCount, builders] = await Promise.all([
    Builder.countDocuments(condition),
    Builder.find(condition)
      .populate("cities", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
  ]);
  const totalPages = Math.ceil(totalCount / limit) || 0;

  return res.status(200).json({
    totalCount,
    totalPages,
    page,
    limit,
    search: search || null,
    has_logo: hasLogoParam === "true" || hasLogoParam === true,
    builders,
  });
});

/**
 * GET /builders/:id — single builder by MongoDB id or slug
 */
const getBuilderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  let builder;
  if (mongoose.Types.ObjectId.isValid(id) && String(id).length === 24) {
    builder = await Builder.findOne({ _id: id, is_active: true })
      .populate("cities", "name")
      .lean()
      .exec();
  }
  if (!builder) {
    builder = await Builder.findOne({ slug: id, is_active: true })
      .populate("cities", "name")
      .lean()
      .exec();
  }

  if (!builder) {
    return res.status(404).json({ message: "Builder not found" });
  }

  return res.status(200).json(builder);
});

module.exports = { getBuilders, getBuilderById };
