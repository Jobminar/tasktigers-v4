import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext"; // Import auth context
import { CartContext } from "../../context/CartContext"; // Import cart context
import { useLocationPrice } from "../../context/LocationPriceContext"; // Import location context
import CitySearchComponent from "./CitySearchComponent"; // Import city search component
import LoginComponent from "../LoginComponent"; // Import login component
import "./MobileHeader.css"; // Import custom CSS
import profileIcon from "../../assets/images/profile.png"; // Profile icon placeholder
import locationIcon from "../../assets/images/navigation.svg"; // Location icon placeholder
import searchIcon from "../../assets/images/Minisearch-icon.svg";
import minicart from "../../assets/images/minicart.svg";

const MobileHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth(); // Use authentication context
  const { totalItems } = useContext(CartContext); // Cart context for cart items
  const { fetchCityName, updateUserLocation } = useLocationPrice(); // Location context

  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState(
    sessionStorage.getItem("selectedCity") || "Dilsukhnagar",
  );
  const [selectedCity, setSelectedCity] = useState(
    sessionStorage.getItem("selectedCity") || "Dilsukhnagar",
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // For location dropdown
  const [isLoginVisible, setLoginVisible] = useState(false); // For login modal visibility
  const [serviceQuery, setServiceQuery] = useState(""); // Service search query
  const [isServiceFocused, setIsServiceFocused] = useState(false); // For search input focus
  const [cities, setCities] = useState([]); // City search results
  const timeoutRef = useRef(null); // Ref for input debounce

  useEffect(() => {
    // Save selected city to session storage
    sessionStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setLoginVisible(true);
    } else {
      setProfileMenuVisible(!isProfileMenuVisible);
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLocationClick = () => {
    setIsDropdownVisible((prev) => !prev); // Toggle location dropdown
  };

  const handleLocationSelect = (newLocation) => {
    setSelectedCity(newLocation);
    setLocationQuery(newLocation);
    setIsDropdownVisible(false);

    // Update location in context if needed
    fetchCityName().then((cityName) => {
      updateUserLocation(cityName.coordinates[1], cityName.coordinates[0]); // Fetch city coordinates and update
    });
  };

  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchCityName(latitude, longitude).then((cityName) => {
            setSelectedCity(cityName);
            setLocationQuery(cityName);
            updateUserLocation(latitude, longitude);
            sessionStorage.setItem("selectedCity", cityName);
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not fetch current location. Please try again.");
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleInputChange = (e) => {
    setLocationQuery(e.target.value);
    if (e.target.value.length > 2) {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  };

  const handleLocationInputBlur = () => {
    timeoutRef.current = setTimeout(() => {
      if (!locationQuery) {
        setLocationQuery(selectedCity || "");
      }
    }, 2000);
  };

  const handleSearchClick = () => {
    // Logic to handle search (open search modal or navigate)
    setIsServiceFocused(true);
  };

  const handleLogout = () => {
    logout();
    setProfileMenuVisible(false);
  };

  return (
    <div className="mobile-header-container">
      <div className="mobile-header">
        {/* Location Dropdown */}
        <div className="mobile-header-location" onClick={handleLocationClick}>
          <img src={locationIcon} alt="Location Icon" className="icon" />
          <span>{locationQuery}</span>
          <FontAwesomeIcon icon={faChevronDown} className="icon" />
          {isDropdownVisible && (
            <div className="location-dropdown">
              <CitySearchComponent
                query={locationQuery}
                onSelect={handleLocationSelect}
                onClose={() => setIsDropdownVisible(false)}
                cities={cities}
              />
              <div
                className="current-location"
                onClick={handleCurrentLocationClick}
              >
                Use Current Location
              </div>
            </div>
          )}
        </div>

        {/* Icons: Search, Cart, Profile */}
        <div className="mobile-header-icons">
          <img
            src={searchIcon}
            alt="Search Icon"
            className="icon"
            onClick={handleSearchClick}
          />
          <div className="cart-icon-container" onClick={handleCartClick}>
            <img src={minicart} alt="Cart Icon" className="icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>
          <img
            src={profileIcon}
            alt="Profile Icon"
            className="icon"
            onClick={handleProfileClick}
          />
        </div>

        {/* Profile Menu */}
        {isProfileMenuVisible && (
          <div className="profile-menu">
            <div onClick={() => navigate("/userprofile")}>My Account</div>
            <div onClick={() => navigate("/addresses")}>My Addresses</div>
            <div onClick={() => navigate("/bookings")}>My Bookings</div>
            <div onClick={() => navigate("/packages")}>My Packages</div>
            <div onClick={handleLogout}>Logout</div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {isLoginVisible && (
        <div className="modalOverlay" onClick={() => setLoginVisible(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setLoginVisible(false)}
            >
              &times;
            </button>
            <LoginComponent onLoginSuccess={() => setLoginVisible(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;
