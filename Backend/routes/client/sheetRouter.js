const express = require("express");

const router = express.Router();

// Google Apps Script URL - kept configurable via env
const GAS_URL = process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbyzX_6SEZfqifXcRv6gNgiHiBLxohzGm-iJkXfZ9igmmlewkNWthMUyMz-nbtC_AiMcAw/exec";

router.post("/sheet", async (req, res) => {
  try {
    const resp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    // try parse JSON, otherwise forward text
    try {
      const json = JSON.parse(text);
      res.status(resp.status).json(json);
    } catch (e) {
      res.status(resp.status).send(text);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;

