const mongoose = require("mongoose");

const seoModel = mongoose.Schema(
  {
    page_title: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
    robots: String,
    index: Boolean,
    keywords: String,
    url: String,
    footer_title: String,
    footer_description: String,
    script: String,
    header_description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    twitter: {
      title: String,
      description: String,
    },
    open_graph: {
      title: String,
      description: String,
    },
  },
  {
    timestamps: true,
  }
);

const SEO = mongoose.model("SEO", seoModel);
module.exports = SEO;
