import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import unzipper from "unzipper";
import { mkdirp } from "mkdirp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const projectName = req.headers["x-project-name"];
      if (!projectName) {
        return cb(new Error("Project name is missing"), null);
      }

      const uploadPath = path.join(__dirname, "../../../server/public/uploads", projectName);
      await mkdirp(uploadPath);
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const extractZip = (req, res, next) => {
  try {
    if (
      (req.file && req.file.mimetype === "application/zip") ||
      (req.file && req.file.mimetype === "application/x-zip-compressed")
    ) {
      const projectName = req.headers["x-project-name"];
      const uploadPath = path.join(__dirname, "../../../server/public/uploads", projectName);
      const zipFilePath = path.join(uploadPath, req.file.originalname);

      if (!fs.existsSync(zipFilePath)) {
        return next(new Error("Uploaded file not found"));
      }

      fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: uploadPath }))
        .on("close", () => {
          fs.unlink(zipFilePath, (err) => {
            if (err) console.error("Error deleting ZIP file:", err);
          });
          next();
        })
        .on("error", (err) => {
          next(err);
        });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

export default upload;
