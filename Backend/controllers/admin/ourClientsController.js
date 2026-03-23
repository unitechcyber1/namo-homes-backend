const asyncHandler = require("express-async-handler");
const OurClient = require("../../models/ourClientModel");

const postOurClients = asyncHandler(async (req, res) => {
  const { name, logo_url } = req.body;

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const ourClient = await OurClient.create({
      name: String(name).trim(),
      logo_url,
    });
    return res.status(201).json(ourClient);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A client with this name already exists" });
    }
    console.error("postOurClients:", error);
    return res.status(500).json({ message: "Failed to create client", error: error.message });
  }
});

/**
 * GET /clients
 * Query: page (default 1), limit (default 20), search (optional, name regex), active (optional: true|false|all)
 */
const getOurClients = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const search = (req.query.search || "").trim();
  const activeParam = req.query.active;

  const condition = {};
  if (search) {
    condition.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  if (activeParam === "true") {
    condition.active = true;
  } else if (activeParam === "false") {
    condition.active = false;
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
    active: activeParam === "true" || activeParam === "false" ? activeParam : "all",
    clients,
  });
});

const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await OurClient.findByIdAndDelete(id).exec();

  if (!deleted) {
    return res.status(404).json({ message: "Client not found" });
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

module.exports = { postOurClients, getOurClients, deleteClient };
