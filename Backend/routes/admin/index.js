const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Current directory of this file
const currentDir = __dirname;

// Read all files in current directory
fs.readdirSync(currentDir).forEach((file) => {
  // Skip index.js and non-js files
  if (file === "index.js" || path.extname(file) !== ".js") return;

  const routePath = path.join(currentDir, file);
  const route = require(routePath);

  // route can export using module.exports or exports.default
  if (route && route.default) {
    router.use(route.default);
  } else {
    router.use(route);
  }
});

module.exports = router;
