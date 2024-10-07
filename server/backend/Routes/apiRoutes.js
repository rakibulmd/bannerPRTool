// server/routes/apiRoutes.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("API is working!");
});

export default router;
