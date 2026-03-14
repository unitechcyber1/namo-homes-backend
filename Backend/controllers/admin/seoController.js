const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const SEO = require("../../models/seoModel");

/** Return 400 if id is missing or not a valid MongoDB ObjectId. */
const validateObjectId = (id, res) => {
  if (!id) {
    res.status(400).json({ message: "ID is required" });
    return false;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid SEO ID" });
    return false;
  }
  return true;
};

/** Send a 400 response for Mongoose validation/cast errors. */
const handleMongooseError = (err, res) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({
      message: "SEO record with this path already exists",
      field: Object.keys(err.keyPattern || {})[0] || "path",
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  throw err;
};

/**
 * GET /seos - List SEO records with pagination and search.
 * Query: page (default 1), limit (default 10), search (optional, matches path only, case-insensitive)
 */
const getSeo = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const search = (req.query.search || "").trim();

  const condition = {};
  if (search) {
    condition.path = { $regex: search, $options: "i" };
  }
  const [totalCount, seos] = await Promise.all([
    SEO.countDocuments(condition),
    SEO.find(condition)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json({
    totalCount,
    totalPages,
    page,
    limit,
    seos,
  });
});

/**
 * POST /seos - Create a new SEO record.
 */
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

  if (!title || !description || !path) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["title", "description", "path"],
    });
  }

  const existing = await SEO.findOne({ path: path.trim() }).lean();
  if (existing) {
    return res.status(409).json({
      message: "SEO record with this path already exists",
      path: path.trim(),
    });
  }

  try {
    const seoData = await SEO.create({
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
      path: path.trim(),
      footer_title,
      footer_description,
      twitter,
      open_graph,
    });
    return res.status(201).json(seoData);
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

/**
 * PUT /seos/:seoId - Update an SEO record.
 */
const addOrEditSeo = asyncHandler(async (req, res) => {
  const { seoId } = req.params;
  if (!validateObjectId(seoId, res)) return;

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

  if (!title || !description || !path) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["title", "description", "path"],
    });
  }

  try {
    const updated = await SEO.findByIdAndUpdate(
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
        path: path.trim(),
        footer_title,
        footer_description,
        twitter,
        open_graph,
      },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return res.status(404).json({ message: "SEO record not found" });
    }
    return res.status(200).json(updated);
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

/**
 * DELETE /delete/:seoId - Delete an SEO record.
 */
const deleteSeo = asyncHandler(async (req, res) => {
  const { seoId } = req.params;
  if (!validateObjectId(seoId, res)) return;

  const deleted = await SEO.findByIdAndDelete(seoId).exec();

  if (!deleted) {
    return res.status(404).json({ message: "SEO record not found" });
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

/**
 * GET /seos/:seoId - Get a single SEO record by ID.
 */
const getSeoById = asyncHandler(async (req, res) => {
  const { seoId } = req.params;
  if (!validateObjectId(seoId, res)) return;

  const seo = await SEO.findById(seoId).lean().exec();

  if (!seo) {
    return res.status(404).json({ message: "SEO record not found" });
  }

  return res.status(200).json(seo);
});

module.exports = { getSeo, postSeo, addOrEditSeo, deleteSeo, getSeoById };
