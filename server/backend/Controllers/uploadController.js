import path from "path";
import fs from "fs";
import Project from "../Models/projectModel.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectName = req.headers["x-project-name"];
    console.log("from db controller: ", projectName);
    const uploadPath = path.join(
      __dirname,
      "../../../server/public/uploads",
      projectName.split(".")[0]
    );

    console.log("from db control, upload path: ", uploadPath);
    const bannerFiles = fs
      .readdirSync(uploadPath)
      .map((dir) => {
        const dirPath = path.join(uploadPath, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath);
          const htmlFile = files.find((file) => file.endsWith(".html"));
          if (htmlFile) {
            return {
              bannerSize: dir,
              bannerLink: path.join("uploads", projectName, dir, htmlFile),
            };
          }
        }
        return null;
      })
      .filter((banner) => banner !== null);

    console.log("Updated banners:", bannerFiles);

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { banners: bannerFiles },
      { new: true }
    );

    if (!updatedProject) {
      console.log("db update failed");
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ status: "ok", updateProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
};
