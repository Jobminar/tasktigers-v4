import React, { useState, useContext } from "react";
import coolieLogo from "../../assets/images/coolie-logo.png";
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import { CartContext } from "../../context/CartContext"; // Import CartContext
import { OrdersContext } from "../../context/OrdersContext"; // Import OrdersContext
import PropTypes from "prop-types";
import "./Checkout.css";

const Checkout = ({ onFinalize }) => {
  const { user } = useAuth(); // Get user data from AuthContext
  const { totalItems, totalPrice } = useContext(CartContext); // Get total items and total price from CartContext
  const { createOrder } = useContext(OrdersContext); // Get createOrder from OrdersContext
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const RazorKey = import.meta.env.VITE_RZP_KEY_ID;

  const handleCouponApply = () => {
    console.log("Coupon Applied:", couponCode);
    // Here you could handle coupon validation or adjustments to final price
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderId) => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsLoading(false);
      return;
    }

    const phoneNumber = user?.phone || sessionStorage.getItem("phone") || "";

    const options = {
      key: RazorKey,
      amount: totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "Coolie NO-1",
      description: "Test Transaction",
      image: coolieLogo, // Replace with your logo URL
      order_id: orderId, // Include the order ID
      handler: function (response) {
        console.log("Payment successful", response);
        // Log the payment details
        console.log("Payment ID:", response.razorpay_payment_id);
        console.log("Order ID:", response.razorpay_order_id);
        console.log("Signature:", response.razorpay_signature);
        createOrder(response.razorpay_payment_id); // Call createOrder with the payment ID
        onFinalize(); // Trigger finalization steps
        setIsLoading(false); // Stop loading state
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: phoneNumber, // Set phone number
      },
      notes: {
        address: user?.address || "",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleConfirmPayment = async () => {
    console.log("Initiating Razorpay Payment");
    setIsLoading(true); // Start loading state
    try {
      const orderId = await createOrder(totalPrice); // Create an order and get the order ID
      if (orderId) {
        await handleRazorpayPayment(orderId); // Open Razorpay with the received order ID
      } else {
        alert("Failed to create order.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to create order.");
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="coupon-section">
        <h4>Use a Coupon Code while payment</h4>
        <div className="coupon-code">
          <input
            type="text"
            placeholder="USE CODE 1234567"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button className="apply-coupon-btn" onClick={handleCouponApply}>
            APPLY
          </button>
        </div>
      </div>
      <div className="checkout-summary">
        <div className="checkout-total-info">
          <h5>{totalItems} Items</h5>
          <p>₹{totalPrice.toFixed(2)}</p>
        </div>
        <div className="checkout-total-button">
          <button
            className="confirm-payment-btn"
            onClick={handleConfirmPayment}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Processing..." : "CONFIRM PAYMENT"}
          </button>
        </div>
      </div>
    </div>
  );
};

Checkout.propTypes = {
  onFinalize: PropTypes.func.isRequired, // Validate that onFinalize is a required function
};

export default Checkout;
