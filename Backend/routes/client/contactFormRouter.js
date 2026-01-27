const express = require("express");
const router = express.Router();
const { contactform, dwarkaContactform } = require("../../controllers/admin/contactController");

router.post("/sendmail", contactform)
      .post("/dwarka/mail", dwarkaContactform);

module.exports = router;