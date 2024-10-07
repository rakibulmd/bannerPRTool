import { useState } from "react";
import JSZip from "jszip";
import { FiUpload, FiFileText } from "react-icons/fi";
import { useProject } from "../Context/ProjectContext";
import axios from "axios";

function ZipUploader() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { projectData, setProjectData } = useProject();
  const [loading, setLoading] = useState(false);

  const checkNestedDirectories = (zipFiles) => {
    let isValid = true;
    zipFiles.forEach((relativePath, file) => {
      if (file.dir) {
        const parts = relativePath.split("/");
        if (parts.length > 2) {
          isValid = false;
        }
      }
    });
    return isValid;
  };

  const checkHtmlFiles = (zipFiles) => {
    let isValid = true;
    const folderContents = new Map();

    zipFiles.forEach((relativePath) => {
      const parts = relativePath.split("/");
      const directoryName = parts[0];
      const fileName = parts[1] || "";
      if (!folderContents.has(directoryName)) {
        folderContents.set(directoryName, []);
      }
      folderContents.get(directoryName).push(fileName);
    });

    folderContents.forEach((files, folderName) => {
      const htmlFiles = files.filter((file) => file.endsWith(".html"));
      if (htmlFiles.length !== 1) {
        console.log(`Folder '${folderName}' should contain exactly one HTML file.`);
        isValid = false;
      }
    });
    if (folderContents.size === 0) {
      console.log("No folders found.");
      isValid = false;
    }

    return isValid;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const validMimeTypes = ["application/zip", "application/x-zip-compressed"];
      const fileName = selectedFile.name;
      const fileExtension = fileName
        .slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
        .toLowerCase();

      if (validMimeTypes.includes(selectedFile.type) || fileExtension === "zip") {
        try {
          const zip = new JSZip();
          const content = await selectedFile.arrayBuffer();
          const zipFiles = await zip.loadAsync(content);
          const isNestedValid = checkNestedDirectories(zipFiles);
          if (!isNestedValid) {
            setIsValid(false);
          }
          const isHtmlValid = checkHtmlFiles(zipFiles);

          if (isNestedValid && isHtmlValid) {
            setFile(selectedFile);
            setIsValid(true);
            setError("");
          } else {
            if (!isNestedValid) {
              setError("Invalid ZIP file. Ensure no nested directories.");
            } else if (!isHtmlValid) {
              setError("Invalid ZIP file. Ensure each folder contains exactly one HTML file.");
            }
            setIsValid(false);
          }
        } catch (err) {
          setError("Failed to process the ZIP file.");
          setIsValid(false);
        }
      } else {
        setError("Please upload a valid ZIP file.");
        setIsValid(false);
      }
    } else {
      setError("Please select a file.");
      setIsValid(false);
    }
  };
  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/projects/${projectData._id}`);
      setProjectData(response.data);
    } catch (err) {
      setError(err.message || "An error occurred while fetching the project data.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        const response = await axios.put(
          `http://localhost:3000/api/projects/${projectData._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-Project-Name": projectData.projectName,
            },
          }
        );

        // Handle success
        console.log("Upload successful:", response.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setLoading(false);
        fetchProjectData();
      }
    } else {
      console.error("No file selected");
    }
  };

  return (
    <div>
      <div>
        {projectData?.banners.length > 0 && (
          <div>
            <h2 className="font-thin text-4xl text-center">Already uploaded banner sizes</h2>
            <div className="flex justify-center p-4 gap-4">
              {projectData.banners.map((banner, index) => (
                <div className="border border-blue-400 p-3 font-bold" key={index}>
                  {banner.bannerSize}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload ZIP File</h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <label
            className="w-full flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg py-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col items-center">
              {file ? (
                <div className="flex items-center space-x-2">
                  <FiFileText size={24} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <FiUpload size={24} />
                  <span>Drag & drop ZIP file here or click to select</span>
                </div>
              )}
            </div>
          </label>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <button
            type="submit"
            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg ${
              isValid ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
            disabled={!isValid}
          >
            {loading ? "Uploading" : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ZipUploader;
