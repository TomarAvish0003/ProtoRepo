import "dotenv/config";
import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import { connectDB } from "./db.js";

await connectDB();

const Move = mongoose.model(
  "Move",
  new mongoose.Schema({
    name: String,
    id: Number,
    accuracy: Number,
    pp: Number,
    power: Number,
    priority: Number,
    type: String,
    generation: String,
    short_description: String,
    damage_class: String,
  })
);

const updatePromises = [];

fs.createReadStream("src/config/metadata_pokemon_moves.csv")
  .pipe(csv())
  .on("data", (row) => {
    row.accuracy = row.accuracy ? Number(row.accuracy) : null;
    row.pp = row.pp ? Number(row.pp) : null;
    row.power = row.power ? Number(row.power) : null;
    // Collect promises instead of awaiting here
    updatePromises.push(
      Move.updateOne({ name: row.name }, { $set: row }, { upsert: true })
    );
  })
  .on("end", async () => {
    try {
      await Promise.all(updatePromises); // Wait for all updates to finish
      console.log("CSV import complete");
    } catch (err) {
      console.error("Error during DB update:", err);
    } finally {
      await mongoose.disconnect();
    }
  });
