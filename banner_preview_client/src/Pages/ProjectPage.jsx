import { useState, useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import axios from "axios";
import transformDate from "../utilities/TransformData";
import { useProject } from "../Context/ProjectContext";

function ProjectPage() {
  const { id } = useParams();
  const links = [
    { name: "Project Home", linkTo: "/" },
    { name: "Upload Banner", linkTo: `/project/${id}/upload` },
    { name: "Preview", linkTo: `/project/${id}/preview` },
    { name: "Review", linkTo: `/project/${id}/review` },
  ];
  const { projectData, setProjectData } = useProject();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/projects/${id}`);
        setProjectData(response.data);
        console.log("Project Data:", response.data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching the project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, setProjectData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="bg-gray-300 mb-6 p-1">
        <div className="flex justify-center items-center gap-5">
          <h1 className="bg-gradient-to-r from-blue-600 via-violet-800 to-indigo-800 inline-block text-transparent bg-clip-text text-2xl">
            {projectData?.projectName}
          </h1>
          <p>{transformDate(projectData?.uploadedAt)}</p>
        </div>
        <div className="flex justify-center gap-4">
          {links.map((pageLink, index) => (
            <NavLink
              to={pageLink.linkTo}
              key={index}
              className={({ isActive }) => {
                return isActive
                  ? "block tracking-wider flex-1  text-md bg-blue-600 text-white text-center py-3 px-4 mb-2  transition-all duration-300"
                  : "block tracking-wider flex-1 text-md bg-white text-black text-center py-3 mb-2  px-4  transition-all duration-300";
              }}
            >
              {pageLink.name}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet></Outlet>
    </div>
  );
}

export default ProjectPage;
