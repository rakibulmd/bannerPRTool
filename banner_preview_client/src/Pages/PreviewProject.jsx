import { useProject } from "../Context/ProjectContext";

export default function PreviewProject() {
  const { projectData } = useProject();
  const host = "http://localhost:3000/";
  return (
    <div style={{ display: "inline-block" }}>
      {projectData.banners.map((banner, index) => {
        const [width, height] = banner.bannerSize.split("x");

        return (
          <div
            key={banner._id}
            style={{
              display: "inline-block",
              padding: "10px",
              margin: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              boxSizing: "border-box", // Ensure padding and border are included in the element's total width and height
            }}
          >
            <label style={{ display: "inline", marginBottom: "5px", fontWeight: "bold" }}>
              {banner.bannerSize}
            </label>
            <iframe
              src={`${host}${banner.bannerLink}`}
              width={width}
              height={height}
              style={{ border: "none" }} // Adjust iframe to fill the parent container's width and maintain its aspect ratio
              title={`Banner ${index + 1}`}
            />
          </div>
        );
      })}
    </div>
  );
}
