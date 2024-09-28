import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import "./Bookings.css";
import jobValue from "../../../assets/images/job-value.png";
import OnlinePayment from "../../../assets/images/online-payment.png";

const Bookings = () => {
  const { userId: authUserId } = useAuth();
  const userId = authUserId || sessionStorage.getItem("userId");
  const navigate = useNavigate(); // Initialize useNavigate

  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    console.log(userId, "userid in bookings");

    const fetchUsername = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(
          `${AZURE_BASE_URL}/v1.0/users/userAuth/${userId}`,
        );
        const data = await response.json();
        setUsername(data.name);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    const fetchOrders = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(
          `${AZURE_BASE_URL}/v1.0/users/order/${userId}`,
        );
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : [data]); // Ensure data is always an array
        console.log(data, "orders in booking page");
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (userId) {
      fetchUsername();
      fetchOrders();
    } else {
      console.error("No userId found");
    }
  }, [userId]);

  const handleBookingClick = (booking) => {
    // Navigate to BookingDetails component and pass the booking data using state
    navigate(`/booking-details/${booking._id}`, { state: { booking } });
  };

  const formatDate = (day, month) => {
    if (!day || !month) return "Invalid Date";
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="bookings-container">
      <h1 className="bookings-title">My Bookings</h1>
      <div className="order-cards-container">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div
              className="order-card"
              key={order._id}
              onClick={() => handleBookingClick(order)} // Navigate to booking details on click
            >
              <div className="order-card-header">
                <h1 id="booking-name">{username || "Username"}</h1>
                <h2 id="selected-time">
                  {order.items?.[0]?.selectedTime || "Time"}
                </h2>
              </div>
              <div className="order-card-body">
                <div className="pricing-details">
                  <p id="jobs-pricing">
                    <img src={jobValue} alt="Job Value Icon" className="icon" />
                    Job value: ₹ {order.items?.[0]?.price || "N/A"}
                  </p>
                  <p>
                    <img
                      src={OnlinePayment}
                      alt="Online Payment Icon"
                      className="icon"
                    />
                    Online Payments: ₹ {order.paymentId ? 0 : "N/A"}
                  </p>
                </div>
                <div className="booking-date">
                  <p id="booking-day">
                    {formatDate(
                      order.items?.[0]?.selectedDate,
                      order.items?.[0]?.selectedMonth,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Bookings;
