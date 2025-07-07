import Move from "../models/moves.js";

export const getMovesBatch = async (req, res) => {
  try {
    const { names } = req.body; // expects { names: ["tackle", "water-gun", ...] }
    if (!Array.isArray(names)) {
      return res.status(400).json({ error: "names must be an array" });
    }
    const moves = await Move.find({ name: { $in: names } }).lean();
    res.json({ moves });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch move details" });
  }
};
