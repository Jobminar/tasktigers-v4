// File: src/components/Loading/loading.js

import React from "react";
import tigerSplashscreen from "../../assets/images/tiger-splashscreen.gif"; // Import the GIF
import "./loading.css";

const Loading = () => {
  return (
    <>
      <div className="loading-main-con">
        <div className="loading-sub-con">
          {/* Display the GIF */}
          <img
            src={tigerSplashscreen}
            alt="splashscreen animation"
            width="100%"
            height="100%"
          />
        </div>
        <div className="loadrtl">{/* Additional content if needed */}</div>
      </div>
    </>
  );
};

export default Loading;
