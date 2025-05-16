import React from "react";
import { CircularProgress } from "@mui/material";
import "./loader.css";

const Loader = ({ 
  message = "Loading...",
  size = 60,
  thickness = 4,
  color = "#00a3c6", // Your primary color
  textColor = "#4a5568", // Grayish text
  background = "rgba(255, 255, 255, 0.9)", // Slightly transparent white
  blurBackground = false
}) => {
  return (
    <div className={`centered-loader ${blurBackground ? "blur-background" : ""}`}>
      <div className="loader-content">
        <CircularProgress 
          size={size} 
          thickness={thickness}
          sx={{ 
            color,
            animationDuration: "800ms",
            marginBottom: "20px"
          }} 
        />
        {message && (
          <p style={{ color: textColor }} className="loader-text">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;