import React from "react";
import { useLocation } from "react-router-dom";
import "./BookingDetails.css"; // Assuming you have a CSS file for styling

const BookingDetails = () => {
  const location = useLocation();
  const { booking } = location.state || {};

  if (!booking) {
    return <p>No booking details found.</p>;
  }

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Calculate the total value
  const totalValue = booking.items.reduce((total, item) => {
    return total + (item.serviceId?.price || 0);
  }, 0);

  return (
    <div className="booking-details-container">
      {/* Header */}
      <div className="booking-header">
        <h1>{booking.userId?.name}</h1>
        <button className="help-button">HELP</button>
      </div>
      <p className="booking-time">
        {formatDate(booking.items[0]?.scheduledDate)}
      </p>

      {/* Customer Details */}
      <div className="customer-details">
        <h2>Customer Details</h2>
        <div className="location-card">
          <h3 id="booking-detail-location">Location</h3>
          <p>{`${booking.addressId?.address}, ${booking.addressId?.landmark}, ${booking.addressId?.city}, ${booking.addressId?.state} - ${booking.addressId?.pincode}`}</p>
          <div className="job-timings">
            <p>Job Start: {formatDate(booking.items[0]?.scheduledDate)}</p>
            <p>Job End: {formatDate(booking.items[0]?.scheduledDate)}</p>{" "}
            {/* Adjust if you have separate end date */}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h2>Summary</h2>
        <div className="summary-container">
          {booking.items.map((item, index) => (
            <div className="summary-item" key={index}>
              <div className="item-description">
                <p>
                  {item.quantity} X {item.serviceId?.name}
                </p>
                <p>{item.serviceId?.name}</p>
              </div>
              <p className="booking-item-price">
                ₹ {item.serviceId?.price || "N/A"}
              </p>
            </div>
          ))}
          <div className="other-charges">
            <p>Convenience Fee</p>
            <p>₹ {booking.convenienceFee || "N/A"}</p>
          </div>
          <div className="total-value">
            <p>Total Value</p>
            <p>₹ {totalValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
