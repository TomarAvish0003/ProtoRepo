import express from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import auth from "../middleware/auth.js";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Auth middleware ensures only logged-in users can upload
router.get("/signature", auth, (req, res) => {
  // Optionally, you can restrict what can be uploaded here
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder: "avatars", // Optional: upload to avatars folder
    // Any other upload options you want to restrict
  };
  const signature = cloudinary.v2.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    signature,
    timestamp,
    folder: paramsToSign.folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
