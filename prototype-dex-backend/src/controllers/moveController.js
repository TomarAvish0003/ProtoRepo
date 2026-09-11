import { inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { moves as movesTable } from "../db/schema.js";

export const getMovesBatch = async (req, res) => {
  try {
    const { names } = req.body;
    if (!Array.isArray(names)) {
      return res.status(400).json({ error: "names must be an array" });
    }
    if (names.length === 0) {
      return res.json({ moves: [] });
    }

    const cleanNames = names.map((n) => String(n).toLowerCase().trim().replace(/\s+/g, "-"));
    const rows = await db.select().from(movesTable).where(inArray(movesTable.name, cleanNames));
    res.json({ moves: rows });
  } catch (err) {
    console.error("getMovesBatch error:", err);
    res.status(500).json({ error: "Failed to fetch move details" });
  }
};

