import React from "react";
import logo from "../../assets/images/logo.png";
import "./loading.css";

const loading = () => {
  return (
    <>
      <div className="loading-main-con">
        <div className="loading-sub-con">
          <img src={logo} alt="animation" />
        </div>
        <div className="loadrtl"></div>
      </div>
    </>
  );
};

export default loading;
