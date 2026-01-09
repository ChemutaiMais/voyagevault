const express = require("express");
const Trip = require("../models/Trip");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * CREATE TRIP
 */
router.post("/", auth, async (req, res) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "owner"
        }
      ]
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET USER TRIPS
 */
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({
      "members.user": req.user.id
    })
      .populate("owner", "name email")
      .populate("members.user", "name email");

    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * INVITE USER TO TRIP
 */
router.post("/:tripId/invite", auth, async (req, res) => {
  try {
    const { email, role } = req.body;

    const trip = await Trip.findById(req.params.tripId).populate("members.user");
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isOwner = trip.members.some(
      m => m.user._id.toString() === req.user.id && m.role === "owner"
    );
    if (!isOwner) return res.status(403).json({ message: "Not authorized" });

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: "User not found" });

    const alreadyMember = trip.members.some(
      m => m.user._id.toString() === userToInvite._id.toString()
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User already in trip" });

    trip.members.push({
      user: userToInvite._id,
      role: role || "viewer"
    });

    await trip.save();
    res.json({ message: "User invited successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
