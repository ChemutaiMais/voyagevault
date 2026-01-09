const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "viewer"
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Trip", TripSchema);
