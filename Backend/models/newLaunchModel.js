const mongoose = require("mongoose")

const newLaunchModel = mongoose.Schema({
    name: { type: String, unique: true, required: true },
    configuration: { type: String },
    starting_price: { type: String },
    tagline: { type: String },
    status: {
        type: String,
        enum: ["pending", "approve", "reject"],
        default: "pending",
      },

}, {
    timestamps: true,
})

const NewLaunch = mongoose.model("NewLaunch", newLaunchModel)

module.exports = NewLaunch;