import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";

import "./Services.css";
import ScrollableTabs from "./ScrollableTabs";
import offerbadge from "../../assets/images/offer.svg";
import membershipbadge from "../../assets/images/premium.svg";
import { CategoryContext } from "../../context/CategoryContext";
import dropdown from "../../assets/images/service-dropdown.svg";
import CartSummary from "../../components/cart/CartSummary";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import LoginComponent from "../../components/LoginComponent";
import IEpopup from "./IEpopup";
import { useLocationPrice } from "../../context/LocationPriceContext";

const Services = () => {
  const {
    categoryData = [],
    selectedCategoryId,
    locationSubCat = [], // List of subcategories
    locationServices = [],
    locationCustom = [],
    selectedSubCategoryId,
    setSelectedSubCategoryId,
    error,
  } = useContext(CategoryContext);

  const { customPriceData } = useLocationPrice();
  const { handleCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();

  const [descriptionVisibility, setDescriptionVisibility] = useState({});
  const [isLoginVisible, setLoginVisible] = useState(false);
  const [variantName, setVariantName] = useState(""); // Track selected variant
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [matchedData, setMatchedData] = useState([]);
  const [forceRender, setForceRender] = useState(0); // State to trigger re-mount
  const [variantNameinres, setVariantNameinres] = useState("");
  const [actualPrice, setActualPrice] = useState("N/A");
  const [offerPrice, setOfferPrice] = useState("N/A");
  const [membershipPrice, setMembershipPrice] = useState("");

  const initialCategoryRef = useRef(null);

  // pricing functionality

  useEffect(() => {
    if (locationCustom.length > 0) {
      const service = locationCustom[0]; // Assuming you want the first service
      const variant = service.service.subCategoryId?.variantName || "None";
      const price = service.customPrice?.price?.[variant] || null;
      const offer = service.customPrice?.offerPrice?.[variant] || null;
      const membershipprice = price ? price * 0.9 : null;

      // Update state only if valid values are found
      setVariantNameinres(variant);
      setActualPrice(price !== undefined ? price : "N/A"); // Set to "N/A" if no valid price
      setOfferPrice(offer !== undefined ? offer : null);
      setMembershipPrice(membershipprice);
    } else if (locationServices.length > 0) {
      const service = locationServices[0]; // Assuming you want the first service
      const variant = service.service.subCategoryId?.variantName || "None";
      const price = service.districtPrice?.price?.[variant] || null;
      const offer = service.districtPrice?.offerPrice?.[variant] || null;
      const membershipprice = price ? price * 0.9 : null;

      // Update state only if valid values are found
      setVariantNameinres(variant);
      setActualPrice(price !== undefined ? price : "N/A"); // Set to "N/A" if no valid price
      setOfferPrice(offer !== undefined ? offer : null); // Set to null if no valid offer price
      setMembershipPrice(membershipprice);
    } else {
      console.log("no price data foound");
    }
  }, [locationServices, locationCustom]);

  // custom price functionality

  useEffect(() => {
    console.log(locationCustom, "locationCustom in service page");
  }, [locationCustom]);

  // Force a component re-render when district or custom price data changes
  // useEffect(() => {
  //   console.log("Price data or services changed. Forcing re-render.");
  //   setForceRender((prev) => prev + 1);
  // }, [districtPriceData, customPriceData, locationServices]);

  // Match services with pricing data based on district or custom pricing
  // useEffect(() => {
  //   console.log("Matching services with pricing data");
  //   if (locationServices.length > 0 && (districtPriceData || customPriceData)) {
  //     const matched = locationServices.filter(
  //       (service) =>
  //         districtPriceData.some(
  //           (price) =>
  //             price.servicename === service.name &&
  //             price.subcategory === service.subCategoryId?.name,
  //         ) ||
  //         customPriceData.some(
  //           (price) =>
  //             price.servicename === service.name &&
  //             price.subcategory === service.subCategoryId?.name,
  //         ),
  //     );
  //     console.log("Matched services: ", matched);
  //     setMatchedData(matched); // Store matched data in state
  //   } else {
  //     console.log("No matched services.");
  //     setMatchedData([]); // Reset if no matching services
  //   }
  // }, [districtPriceData, customPriceData, locationServices]);

  // Handle UI variants and set the default variant when category changes
  useEffect(() => {
    console.log("Category or variant changed");
    if (categoryData.length > 0 && selectedCategoryId) {
      const initialCategory = categoryData.find(
        (item) => item._id === selectedCategoryId,
      );
      initialCategoryRef.current = initialCategory;

      if (initialCategory) {
        const validVariants = initialCategory.uiVariant?.filter(
          (variant) => variant.toLowerCase() !== "none",
        );

        if (validVariants?.length > 0) {
          console.log("Setting initial variant: ", validVariants[0]);
          setVariantName(validVariants[0]); // Set first valid variant
        } else {
          console.log("No valid variants found");
          setVariantName(""); // Default to empty if no valid variants
        }
      } else {
        console.warn(`No category found with ID: ${selectedCategoryId}`);
      }
    } else {
      console.warn("No category data available or the list is empty.");
    }
  }, [categoryData, selectedCategoryId]);

  // Filter subcategories based on the selected category and variant
  const filteredSubCategories = useMemo(() => {
    console.log("Filtering subcategories based on variant and category");
    if (!locationSubCat || variantName === "") return locationSubCat;

    return locationSubCat.filter(
      (subCat) =>
        subCat.variantName === variantName &&
        subCat.categoryId === selectedCategoryId,
    );
  }, [locationSubCat, variantName, selectedCategoryId]);

  // Automatically select the first subcategory when variant or subcategories change
  useEffect(() => {
    console.log("Selecting default subcategory");
    if (filteredSubCategories.length > 0) {
      setSelectedSubCategoryId(filteredSubCategories[0]._id);
    } else {
      setSelectedSubCategoryId(null); // No subcategories available
    }
  }, [filteredSubCategories, setSelectedSubCategoryId]);

  // Toggle description visibility for services
  const toggleDescription = (serviceId) => {
    console.log("Toggling description for service: ", serviceId);
    setDescriptionVisibility((prevState) => ({
      ...prevState,
      [serviceId]: !prevState[serviceId],
    }));
  };

  // Handle Add to Cart functionality with login check
  const handleAddToCart = (serviceId, categoryId, subCategoryId) => {
    console.log("Handling Add to Cart for service: ", serviceId);
    if (!isAuthenticated) {
      setLoginVisible(true);
      return;
    }
    handleCart(serviceId, categoryId, subCategoryId);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setLoginVisible(false);
  };

  // Handle variant selection
  const handleVariant = (variantname) => {
    console.log("Handling variant selection: ", variantname);
    setVariantName(variantname);
  };

  // Open the service detail popup
  const handleKnowMoreClick = (serviceId) => {
    console.log("Opening service details for: ", serviceId);
    setSelectedServiceId(serviceId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    console.log("Closing service details popup");
    setIsPopupOpen(false);
    setSelectedServiceId(null);
  };

  // Display matched services or error message inside "services-display" div
  const displayServices = (matchedData) => {
    console.log(matchedData, "Displaying services in service page function");
    if (
      !selectedSubCategoryId ||
      !Array.isArray(matchedData) ||
      locationServices.length === 0
    ) {
      console.log("No matching services found");
      return (
        <div className="services-display">
          <h5>No matching services found for this .</h5>
        </div>
      );
    }

    return matchedData.map((service) => {
      const isExpanded = descriptionVisibility[service._id];

      return (
        <div key={service.service._id} className="sub-category-service-item">
          <div className="ser-content">
            <h2>{service.service.name}</h2>
            <div className="price-section">
              <p className={`ser-price ${offerPrice ? "strikethrough" : ""}`}>
                &#8377; {actualPrice}
              </p>
              {offerPrice && (
                <p className="offer-price">
                  <img src={offerbadge} alt="offerbadge" />
                  {offerPrice}
                </p>
              )}
              <p className="membership-price">
                <img src={membershipbadge} alt="offerbadge" />
                {membershipPrice}
              </p>
            </div>

            <div className="dashed"></div>
            <p className="description">
              {service.service.description.slice(0, 150)}...
            </p>
          </div>
          <div className="ser-img">
            <div className="ser-image-con">
              <img className="image" src={service.service.image} />
            </div>
          </div>
          <div
            className="know-more"
            onClick={() => handleKnowMoreClick(service.service._id)} // Use an arrow function to pass the correct function
          >
            Know More
          </div>

          <div className="button-add">
            <button
              className="add-button"
              onClick={() =>
                handleAddToCart(
                  service.service._id,
                  service.service.categoryId._id,
                  service.service.subCategoryId._id,
                )
              }
            >
              ADD
            </button>
          </div>
        </div>
      );
    });
  };

  // Filter category data to render UI variant buttons
  const filteredCategoryData = useMemo(() => {
    console.log("Filtering category data");
    return categoryData.filter((item) => item._id === selectedCategoryId);
  }, [categoryData, selectedCategoryId]);

  return (
    <div className="services" key={forceRender}>
      {/* Ensure ScrollableTabs always renders, even if services are not found */}
      <ScrollableTabs />

      <div>
        {filteredCategoryData.map((uiItem) => {
          const validVariants = uiItem.uiVariant?.filter(
            (variant) => variant.toLowerCase() !== "none",
          );

          return (
            <div
              key={uiItem._id}
              className="variant"
              style={{
                visibility: validVariants?.length > 0 ? "visible" : "hidden",
              }}
            >
              {validVariants.length > 0 &&
                validVariants.map((variant, index) => (
                  <div
                    key={index}
                    className={`ui-variant-item ${
                      variant === variantName ? "active" : ""
                    }`}
                    onClick={() => handleVariant(variant)}
                  >
                    {variant}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div className="services-cart-display">
        <div className="subcat-services-display">
          <div className="sub-category-display">
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((subCat) => (
                <div
                  key={subCat._id}
                  className={`sub-category-item ${
                    selectedSubCategoryId === subCat._id ? "active" : ""
                  }`}
                  onClick={() => setSelectedSubCategoryId(subCat._id)}
                >
                  <div
                    className={`subcat-icon-container ${
                      selectedSubCategoryId === subCat._id ? "active" : ""
                    }`}
                  >
                    <img
                      src={subCat.imageKey}
                      alt={subCat.name}
                      className="tab-image"
                    />
                  </div>
                  <p
                    className={
                      selectedSubCategoryId === subCat._id ? "active" : ""
                    }
                  >
                    {subCat.name}
                  </p>
                </div>
              ))
            ) : (
              <p>No subcategories available for this filter.</p>
            )}
          </div>
          <div className="services-display">
            {displayServices(locationServices)}
          </div>
        </div>
        <div className="cart">
          <CartSummary />
        </div>
      </div>

      <IEpopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        serviceId={selectedServiceId}
      />

      {isLoginVisible &&
        document.getElementById("modal-root") &&
        ReactDOM.createPortal(
          <div className="modalOverlay" onClick={closeModal}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
              <LoginComponent onLoginSuccess={closeModal} />
            </div>
          </div>,
          document.getElementById("modal-root"),
        )}
    </div>
  );
};

export default Services;
