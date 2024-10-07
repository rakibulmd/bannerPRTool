import express from "express";
import path from "path";
import fs from "fs-extra";
import upload from "../Middlewares/uploadMiddleware.js";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/upload", upload.array("files"), async (req, res, next) => {
  try {
    const folderName = req.body.directoryName || "default";
    const targetPath = path.join(__dirname, "../../public/uploads", folderName);
    await fs.ensureDir(targetPath);
    const htmlFile = req.files.find((file) => path.extname(file.originalname) === ".html");
    if (htmlFile) {
      const htmlFileNameWithoutExt = path.basename(htmlFile.originalname, ".html");
      const htmlFileDir = path.join(targetPath, htmlFileNameWithoutExt);
      await fs.ensureDir(htmlFileDir);
      await Promise.all(
        req.files.map(async (file) => {
          const newPath = path.join(htmlFileDir, file.originalname);
          await fs.move(file.path, newPath, { overwrite: true });
        })
      );

      res.status(200).json({ message: "Files uploaded and organized successfully" });
    } else {
      res.status(400).json({ message: "No HTML file found in the uploaded files" });
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    next(error);
  }
});

export default router;
