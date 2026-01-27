const mongoose = require("mongoose");

const builderModel = mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: String,
    about_builder: String,
    starting_price: String,
    configuration: String,
    estb_year: Number,
    ratings: Number,
    type: String,
    residential_num: Number,
    commercial_num: Number,
    coming_soon: String,
    slug: { type: String, unique: true, required: true },
    dwarka_page_url: String,
    is_active: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        image: String,
        name: String,
        alt: String,
      },
    ],
    BuilderLogo: String,
    cities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
      },
    ],
    seo: {
      title: { type: String },
      description: { type: String },
      footer_title: String,
      footer_description: String,
      robots: String,
      index: Boolean,
      keywords: String,
      url: String,
      status: {
        type: Boolean,
        default: true,
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
    is_popular: {
      status: {
        type: Boolean,
        default: false,
      },
      order: {
        type: Number,
        default: 1000,
      },
      cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Builder = mongoose.model("Builder", builderModel);
module.exports = Builder;
