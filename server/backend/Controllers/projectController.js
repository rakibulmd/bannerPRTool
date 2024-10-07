import Project from "../Models/projectModel.js";

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching the project" });
  }
};

export const getRecentProjects = async (req, res) => {
  try {
    const recentProjects = await Project.find({}).sort({ uploadedAt: -1 }).limit(10);
    res.status(200).json(recentProjects);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching recent projects" });
  }
};

export const createProject = async (req, res) => {
  const { projectName } = req.body;

  if (!projectName || projectName.length < 3) {
    return res
      .status(400)
      .json({ message: "Project name is required and must be at least 3 characters long" });
  }

  try {
    const newProject = new Project({
      projectName,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while creating the project" });
  }
};

export const deleteProjectById = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while deleting the project" });
  }
};

export const addCommentToProject = async (req, res) => {
  const { id } = req.params;
  const { iframeNo, width, height, x, y, timeFrame, textContent } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newComment = {
      iframeNo,
      width,
      height,
      x,
      y,
      timeFrame,
      textContent,
    };

    project.comments.push(newComment);

    await project.save();

    res.status(200).json({ message: "Comment added successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};

export const getCommentsByProjectId = async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId).select("comments");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
