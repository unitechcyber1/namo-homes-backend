const asyncHandler = require("express-async-handler");
const OurClient = require("../../models/ourClientModel");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /our-client — public list of clients (only active by default).
 * Query: page (default 1), limit (default 50, max 100), search (optional, name)
 */
const getOurClients = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const search = (req.query.search || "").trim();

  const condition = { active: true };
  if (search) {
    condition.name = { $regex: escapeRegex(search), $options: "i" };
  }

  const [totalCount, clients] = await Promise.all([
    OurClient.countDocuments(condition),
    OurClient.find(condition)
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
    clients,
  });
});

module.exports = { getOurClients };
