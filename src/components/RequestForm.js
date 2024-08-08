// src/components/RequestForm.js
import React, { useState } from "react";
import { db } from "../firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import "../styles/RequestForm.css";

const RequestForm = ({ onClose, room, messageId }) => {
  const [heading, setHeading] = useState("");
  const [items, setItems] = useState([""]);
  const [logistics, setLogistics] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, ""]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Update the message with request details
    const messageRef = doc(db, "messages", messageId);
    await updateDoc(messageRef, {
      heading,
      items,
      logistics,
      pickupLocation,
      dropLocation,
      fulfilled: true, // Mark as fulfilled
    });

    onClose(); // Close the form
  };

  return (
    <div className="request-form">
      <h2>Request Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Heading:
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="What do you want?"
            required
          />
        </label>
        <div className="items-list">
          <label>Items:</label>
          {items.map((item, index) => (
            <label key={index}>
              Item {index + 1}:
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                required
              />
            </label>
          ))}
          <button type="button" onClick={handleAddItem}>Add Item</button>
        </div>
        <label>
          Logistics Fees Offered:
          <input
            type="text"
            value={logistics}
            onChange={(e) => setLogistics(e.target.value)}
            required
          />
        </label>
        <label>
          Pickup Location:
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </label>
        <label>
          Drop Location:
          <input
            type="text"
            value={dropLocation}
            onChange={(e) => setDropLocation(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit Request</button>
        <button type="button" className="close-button" onClick={onClose}>Close</button>
      </form>
    </div>
  );
};

export default RequestForm;
