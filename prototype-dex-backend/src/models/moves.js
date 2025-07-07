import mongoose from "mongoose";

const MoveSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Move name (e.g., "hydro-pump")
  id: { type: Number, required: true },                 // Move ID from PokeAPI or CSV
  accuracy: { type: Number, default: null },            // Accuracy percentage (e.g., 80)
  pp: { type: Number, default: null },                  // Power Points (e.g., 5)
  power: { type: Number, default: null },               // Power value (e.g., 110)
  priority: { type: Number, default: 0 },               // Priority of the move
  type: { type: String, required: true },               // Move type (e.g., "water")
  generation: { type: String, default: null },          // Generation (e.g., "generation-i")
  short_description: { type: String, default: "" },     // Short effect description
  damage_class: { type: String, default: "" },          // Category: "physical", "special", or "status"
}, {
  timestamps: true, // Optional: adds createdAt and updatedAt fields
});

const Move = mongoose.model("Move", MoveSchema);

export default Move;
