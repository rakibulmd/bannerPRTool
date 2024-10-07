import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProjectHome from "./Pages/ProjectHome";
import ProjectPage from "./Pages/ProjectPage";
import UploadPage from "./Pages/UploadPage";
import { ProjectProvider } from "./Context/ProjectContext";
import PreviewProject from "./Pages/PreviewProject";
import ReviewPage from "./Pages/ReviewProject";

// Define the routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProjectHome />,
    errorElement: <div>Something went wrong!</div>,
  },
  {
    path: "/project/:id",
    element: <ProjectPage />,
    errorElement: <div>Something went wrong!</div>,
    children: [
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "review",
        element: <ReviewPage></ReviewPage>,
      },
      {
        path: "preview",
        element: <PreviewProject></PreviewProject>,
      },
    ],
  },
  {
    path: "*",
    element: <div>Page not found!</div>,
    errorElement: <div>Something went wrong!</div>,
  },
]);

function App() {
  return (
    <ProjectProvider>
      <RouterProvider router={router} />
    </ProjectProvider>
  );
}

export default App;
