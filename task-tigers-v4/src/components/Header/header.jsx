import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Use authentication context
import { CartContext, CartProvider } from "../../context/CartContext"; // Use cart context
import { useLocationPrice } from "../../context/LocationPriceContext"; // Use location and price context
import MobileHeader from "./MobileHeader"; // Import the MobileHeader component
import "./header.css"; // Custom CSS
import playstore from "../../assets/images/play-store.svg";
import apple from "../../assets/images/apple.svg";
import logo from "../../assets/images/logo.png";
import help from "../../assets/images/help.png";
import translate from "../../assets/images/translate.png";
import profile from "../../assets/images/profile.png";
import location from "../../assets/images/location-marker.png";
import search from "../../assets/images/search.png";
import LoginComponent from "../LoginComponent";
import ChatbotComponent from "../Chat/ChatbotComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import CitySearchComponent from "./CitySearchComponent"; // City search component
import ServiceSearchComponent from "./ServiceSearchComponent"; // Service search component
import { confirmAlert } from "react-confirm-alert"; // Alert library for confirming actions
import { toast } from "react-hot-toast"; // Toast notifications
import "react-confirm-alert/src/react-confirm-alert.css"; // Confirm alert styles
import registerasaprofessional from "../../assets/images/registerprofessional.png";

// Custom hook for typewriter effect in the search bar placeholder
const useTypewriter = (texts, typing, speed = 100, pause = 2000) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typing) return;

    if (subIndex === texts[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), pause);
      return;
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      },
      deleting ? speed / 2 : speed,
    );

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, texts, speed, pause, typing]);

  return deleting
    ? texts[index].substring(0, subIndex)
    : texts[index].substring(0, subIndex);
};

const Header = ({ children }) => {
  const navigate = useNavigate(); // Initialize navigation
  const {
    isAuthenticated,
    userCity,
    fetchCityName,
    updateUserLocation,
    logout,
  } = useAuth();
  const { fetchGeocodeData } = useLocationPrice(); // Use location and price context to get geocode data
  const { totalItems, clearCart } = useContext(CartContext); // Cart context to get number of items in cart

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State to check if the device is mobile
  const [isLoginVisible, setLoginVisible] = useState(false); // Control login modal visibility
  const [isChatbotVisible, setIsChatbotVisible] = useState(false); // Control chatbot visibility
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false); // Toggle profile menu
  const [locationQuery, setLocationQuery] = useState(
    sessionStorage.getItem("selectedCity") || userCity || "",
  ); // Current city or selected city
  const [selectedCity, setSelectedCity] = useState(
    sessionStorage.getItem("selectedCity") || userCity || "",
  ); // State for selected city
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Dropdown for city search
  const [serviceQuery, setServiceQuery] = useState(""); // Service search query
  const [isTyping, setIsTyping] = useState(false); // Detect typing in service search
  const [isServiceFocused, setIsServiceFocused] = useState(false); // Focus state for service input
  const [cities, setCities] = useState([]); // City search results
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle mobile menu
  const timeoutRef = useRef(null); // Ref to control search input debounce

  useEffect(() => {
    // Handle window resize to detect mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Update location input when userCity changes
    if (userCity) {
      setLocationQuery(userCity);
      setSelectedCity(userCity);
    }
  }, [userCity]);

  useEffect(() => {
    // Save selected city to session storage when it changes
    sessionStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  // Placeholder texts for typewriter effect in service search
  const placeholders = [" Room cleaning", " Laundry", " Gardening"];
  const placeholder = useTypewriter(placeholders, isTyping); // Use typewriter effect for dynamic placeholder

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setLoginVisible(true);
    } else {
      setProfileMenuVisible((prev) => !prev);
      setIsMenuOpen((prev) => !prev);

      if (!isProfileMenuVisible) {
        toast.success("You can access your profile now!");
        setTimeout(() => {
          setProfileMenuVisible(false);
        }, 60000);
      }

      if (!isMenuOpen) {
        setTimeout(() => {
          setIsMenuOpen(false);
        }, 60000);
      }
    }
  };

  const closeModal = () => {
    setLoginVisible(false);
  };

  const toggleChatbot = () => {
    setIsChatbotVisible((prev) => !prev);
  };

  const handleBookServiceClick = () => {
    navigate("/services");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCitySelect = (city) => {
    confirmAlert({
      title: "Confirm Location Change",
      message: "Are you sure you want to change your location?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setSelectedCity(city.name);
            setLocationQuery(city.name);
            sessionStorage.setItem("selectedCity", city.name);
            clearCart();
            setIsDropdownVisible(false);
            updateUserLocation(city.coordinates[1], city.coordinates[0]);
            fetchGeocodeData(city.coordinates[1], city.coordinates[0]);
          },
        },
        {
          label: "No",
          onClick: () => setIsDropdownVisible(false),
        },
      ],
      closeOnClickOutside: false,
    });
  };

  const handleLocationInputFocus = () => {
    setLocationQuery("");
    setIsDropdownVisible(false);
  };

  const handleLocationInputBlur = () => {
    timeoutRef.current = setTimeout(() => {
      if (!locationQuery) {
        setLocationQuery(userCity || "");
      }
    }, 2000);
  };

  const handleInputChange = (e) => {
    setLocationQuery(e.target.value);
    if (e.target.value.length > 2) {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  };

  const handleLocationIconClick = () => {
    confirmAlert({
      title: "Use Current Location",
      message: "Do you want to use your current location?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  fetchCityName(latitude, longitude).then((cityName) => {
                    setSelectedCity(cityName);
                    setLocationQuery(cityName);
                    updateUserLocation(latitude, longitude);
                    fetchGeocodeData(latitude, longitude);
                    sessionStorage.setItem("selectedCity", cityName);
                  });
                },
                (error) => {
                  console.error("Error getting location:", error);
                  if (error.code === 1) {
                    alert(
                      "Location access is denied. Please allow location access in your browser settings.",
                    );
                  } else {
                    alert(
                      "An error occurred while fetching your location. Please try again.",
                    );
                  }
                },
              );
            } else {
              alert("Geolocation is not supported by this browser.");
            }
          },
        },
        { label: "No", onClick: () => {} },
      ],
      closeOnClickOutside: false,
    });
  };

  const handleServiceInputChange = (e) => {
    setServiceQuery(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleServiceSelect = (serviceName) => {
    setServiceQuery(serviceName);
    setIsTyping(false);
    navigate("/services");
  };

  // If the screen is mobile, render the MobileHeader component
  if (isMobile) {
    return <MobileHeader />;
  }

  // The rest of the header code for non-mobile screens
  return (
    <CartProvider showLogin={setLoginVisible}>
      <div className="main-h">
        {/* Top header with icons */}
        <div className="f-h">
          <div className="f-h-icons">
            <img src={apple} alt="apple-icon" />
            <img src={playstore} alt="play-store-icon" />
            <p>Download Mobile App</p>
          </div>
          <div className="r-a-p-main" onClick={() => navigate("/registerap")}>
            <img className="r-a-p-image" src={registerasaprofessional} />
            <p className="r-a-p">REGISTER AS A PROFESSIONAL</p>
          </div>

          <div className="f-h-last-icons">
            <img src={help} alt="help-icon" onClick={toggleChatbot} />
            <img src={translate} alt="translate-icon" />
            <div className="cart-icon-container" onClick={handleCartClick}>
              <FontAwesomeIcon
                icon={faCartShopping}
                style={{ fontSize: "1.4rem" }}
              />
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </div>
            <div>
              <img
                src={profile}
                alt="profile-icon"
                onClick={handleProfileClick}
              />
              {isProfileMenuVisible && (
                <div className="profileMenu">
                  <div onClick={() => navigate("/userprofile")}>Account</div>
                  <div onClick={() => navigate("/addresses")}>My Addresses</div>
                  <div onClick={() => navigate("/bookings")}>My Bookings</div>
                  <div onClick={() => navigate("/packages")}>My Packages</div>
                  <div onClick={() => logout()}>Log Out</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main header with logo and search bars */}
        <div className="s-h">
          <div className="s-h-logo">
            <img src={logo} alt="logo" onClick={handleLogoClick} />
          </div>
          <div className="s-h-s">
            <div className="location">
              <img
                src={location}
                alt="location-icon"
                onClick={handleLocationIconClick}
              />
              <div className="location-input-wrapper">
                <input
                  className="location-input"
                  value={locationQuery}
                  onChange={handleInputChange}
                  onFocus={handleLocationInputFocus}
                  onBlur={handleLocationInputBlur}
                />
                {locationQuery && isDropdownVisible && (
                  <div className="city-search-wrapper">
                    <CitySearchComponent
                      query={locationQuery}
                      onSelect={handleCitySelect}
                      onClose={() => setIsDropdownVisible(false)}
                      cities={cities}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="search-header">
              <img src={search} alt="search-icon" className="search-icon" />
              <div className="service-search-container">
                <input
                  placeholder={`search for a service ex:${placeholder}`}
                  value={serviceQuery}
                  onChange={handleServiceInputChange}
                  onFocus={() => setIsServiceFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsServiceFocused(false), 200)
                  }
                />
                {isServiceFocused && (
                  <div className="service-search-results">
                    <ServiceSearchComponent
                      searchQuery={serviceQuery}
                      onSelect={handleServiceSelect}
                    />
                  </div>
                )}
              </div>
            </div>
            <button className="books-button" onClick={handleBookServiceClick}>
              BOOK SERVICE
            </button>
          </div>
        </div>
      </div>

      {isLoginVisible && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <LoginComponent onLoginSuccess={() => setLoginVisible(false)} />
          </div>
        </div>
      )}
      {isChatbotVisible && <ChatbotComponent />}
      {children}
    </CartProvider>
  );
};

export default Header;
