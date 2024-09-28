// File: HelpPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HelpPage.css"; // Assume we will create this CSS file for styling

const HelpPage = ({ bookings, helpTopics }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="help-page-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        &#x2190;
      </button>

      {/* Header */}
      <h1 className="help-title">How can we help you?</h1>

      {/* Recent Bookings Section */}
      <div className="recent-bookings-section">
        <h2 className="section-title">Recent bookings</h2>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div className="booking-item" key={index}>
              <div className="booking-icon">
                {/* Add icons based on booking category */}
                <img
                  src={`/icons/${booking.category}.png`}
                  alt={`${booking.category} icon`}
                />
              </div>
              <div className="booking-info">
                <p className="booking-title">{booking.category}</p>
                <p className="booking-date">{formatDate(booking.date)}</p>
              </div>
              <div className="booking-arrow">&#x2192;</div>
            </div>
          ))
        ) : (
          <p>No recent bookings</p>
        )}
        <a href="/booking-history" className="booking-history-link">
          Booking History
        </a>
      </div>

      {/* Help Topics Section */}
      <div className="help-topics-section">
        <h2 className="section-title">All topics</h2>
        {helpTopics.map((topic, index) => (
          <div className="help-topic-item" key={index}>
            <div className="topic-icon">
              <img
                src={`/icons/${topic.icon}.png`}
                alt={`${topic.name} icon`}
              />
            </div>
            <div className="topic-name">{topic.name}</div>
            <div className="topic-arrow">&#x2192;</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
