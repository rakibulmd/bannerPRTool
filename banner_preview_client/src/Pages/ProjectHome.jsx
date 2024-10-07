import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProjectHome() {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/projects/recent");
        setRecentProjects(response.data);
      } catch (err) {
        console.error("Error fetching recent projects:", err);
      }
    };

    fetchRecentProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (projectName.trim().length < 3) {
      setError("Project name must be at least 3 characters long.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/projects/create", {
        projectName,
      });
      if (response.data && response.data._id) {
        console.log(response.data);
        navigate(`/project/${response.data._id}/upload`);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("An error occurred while creating the project.");
    } finally {
      setLoading(false);
      setProjectName("");
    }
  };

  return (
    <div className="h-screen max-h-screen w-screen max-w-screen bg-animated-gradient flex justify-center items-center">
      <div className="bg-black/40 backdrop-blur-lg p-8 py-12 rounded-lg shadow-lg w-full max-w-lg border-white/50 border">
        <h1 className="text-2xl font-light tracking-wider mb-8 text-center text-white">
          Create New Project
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col ">
          <label htmlFor="projectNameInput" className="block text-lg font-thin text-white/80 mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="projectNameInput"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="p-2 border border-gray-300 rounded-md"
            required
          />

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`p-2 py-4 bg-blue-500 text-white rounded-md  uppercase mt-5 font-semibold tracking-wider ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
        <div className="mt-8">
          <h2 className="text-xl text-white mb-4">Recent Projects</h2>
          <ul>
            {recentProjects.map((project) => (
              <li key={project._id}>
                <a
                  href={`/project/${project._id}/preview`}
                  className="text-blue-400 hover:underline"
                >
                  {project.projectName || "Untitled Project"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProjectHome;
