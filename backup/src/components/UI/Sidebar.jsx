import React from "react";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>

      {/* Furniture Section */}
      <div className="sidebar-section">
        <h3>Furniture</h3>
        <button onClick={() => alert("Adding a chair!")}>Add Chair</button>
        <button onClick={() => alert("Adding a table!")}>Add Table</button>
      </div>

      {/* Settings Section */}
      <div className="sidebar-section">
        <h3>Settings</h3>
        <label>
          <input type="checkbox" />
          Toggle Shadows
        </label>
        <label>
          <input type="checkbox" />
          Wireframe Mode
        </label>
      </div>

      {/* View Section */}
      <div className="sidebar-section">
        <h3>View</h3>
        <button onClick={() => alert("Switching to top-down view!")}>
          Top-Down View
        </button>
        <button onClick={() => alert("Switching to 3D view!")}>3D View</button>
      </div>
    </div>
  );
};

export default Sidebar;
