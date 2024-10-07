import express from "express";
import {
  getProjectById,
  createProject,
  getRecentProjects,
  deleteProjectById,
  addCommentToProject,
  getCommentsByProjectId,
} from "../Controllers/projectController.js";
import { updateProject } from "../Controllers/uploadController.js";
import upload, { extractZip } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();
router.post("/create", createProject);
router.post("/:id/comments", addCommentToProject);
router.get("/recent", getRecentProjects);
router.get("/:id", getProjectById);
router.get("/:id/comments", getCommentsByProjectId);
router.put("/:id", upload.single("file"), extractZip, updateProject);
router.delete("/:id", deleteProjectById);

export default router;
