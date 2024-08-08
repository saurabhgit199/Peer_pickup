import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-config";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "firebase/firestore";
import "../styles/Chat.css";
import "../styles/RequestForm.css";

export const Chat = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [expandedMessageId, setExpandedMessageId] = useState(null); // For expanding message details
  const [requestFormData, setRequestFormData] = useState({
    heading: "",
    items: [],
    logisticsFees: "",
    pickupLocation: "",
    dropLocation: ""
  });
  const [itemInput, setItemInput] = useState(""); // State for the new item input
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [room]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
    });

    setNewMessage("");
  };

  const handleRequestFormSubmit = async (event) => {
    event.preventDefault();

    if (requestFormData.heading === "") return;
    await addDoc(messagesRef, {
      text: `I Want: ${requestFormData.heading}`,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
      requestDetails: requestFormData // Add the request form data to the message
    });

    // Reset form data
    setRequestFormData({
      heading: "",
      items: [],
      logisticsFees: "",
      pickupLocation: "",
      dropLocation: ""
    });
    setItemInput(""); // Reset item input
    setShowRequestForm(false);
  };

  const handleFulfill = async (messageId) => {
    const messageRef = doc(db, "messages", messageId);
    await updateDoc(messageRef, {
      fulfilled: true
    });
  };

  const handleViewDetails = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId); // Toggle the expanded state
  };

  const handleRequestButtonClick = () => {
    setShowRequestForm(true);
    setSelectedMessageId(null);
  };

  const handleICanGetClick = () => {
    setNewMessage(""); // Clear the message input to avoid any unwanted text
  };

  const handleAddItem = () => {
    if (itemInput) {
      setRequestFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, itemInput]
      }));
      setItemInput(""); // Clear input field after adding
    }
  };

  const handleItemInputChange = (event) => {
    setItemInput(event.target.value);
  };

  return (
    <div className="chat-app">
      <div className="header">
        <h1>Welcome to: {room.toUpperCase()}</h1>
      </div>
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.fulfilled ? 'fulfilled' : (message.text.startsWith('I Want') ? 'i-want' : 'i-can-get')}`}
            onClick={() => {
              if (message.text.startsWith('I Want')) {
                setSelectedMessageId(message.id);
              }
            }}
          >
            <span className="user">{message.user}:</span>
            <div className="message-text">{message.text}</div>
            {message.text.startsWith('I Want') && !message.fulfilled && (
              <div className="message-actions">
                <button
                  className="fulfill-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from triggering the message click event
                    handleFulfill(message.id);
                  }}
                >
                  Fulfill
                </button>
                <button
                  className="view-details-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from triggering the message click event
                    handleViewDetails(message.id);
                  }}
                >
                  {expandedMessageId === message.id ? "Hide Details" : "View Details"}
                </button>
              </div>
            )}
            {expandedMessageId === message.id && message.requestDetails && (
              <div className="message-details">
                <p><strong>Heading:</strong> {message.requestDetails.heading}</p>
                <p><strong>Items:</strong> {message.requestDetails.items.join(", ")}</p>
                <p><strong>Logistics Fees:</strong> {message.requestDetails.logisticsFees}</p>
                <p><strong>Pickup Location:</strong> {message.requestDetails.pickupLocation}</p>
                <p><strong>Drop Location:</strong> {message.requestDetails.dropLocation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="new-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="new-message-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
        <button
          type="button"
          className="request-button"
          onClick={handleRequestButtonClick}
        >
          I Want
        </button>
        <button
          type="button"
          className="i-can-get-button"
          onClick={handleICanGetClick}
        >
          I Can Get
        </button>
      </form>
      {showRequestForm && (
        <div className="request-form">
          <h2>Request Details</h2>
          <form onSubmit={handleRequestFormSubmit}>
            <label>
              What do you want:
              <input
                type="text"
                value={requestFormData.heading}
                onChange={(e) => setRequestFormData({ ...requestFormData, heading: e.target.value })}
                placeholder="What do you want?"
              />
            </label>
            <label>
              List of items required:
              <input
                type="text"
                value={itemInput}
                onChange={handleItemInputChange}
                placeholder="Add an item"
              />
              <button type="button" onClick={handleAddItem}>
                Add Item
              </button>
              <ul>
                {requestFormData.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </label>
            <label>
              Logistics fees offered:
              <input
                type="text"
                value={requestFormData.logisticsFees}
                onChange={(e) => setRequestFormData({ ...requestFormData, logisticsFees: e.target.value })}
              />
            </label>
            <label>
              Pickup location:
              <input
                type="text"
                value={requestFormData.pickupLocation}
                onChange={(e) => setRequestFormData({ ...requestFormData, pickupLocation: e.target.value })}
              />
            </label>
            <label>
              Drop location:
              <input
                type="text"
                value={requestFormData.dropLocation}
                onChange={(e) => setRequestFormData({ ...requestFormData, dropLocation: e.target.value })}
              />
            </label>
            <button type="submit" className="submit-button">Submit</button>
            <button type="button" className="close-button" onClick={() => setShowRequestForm(false)}>Close</button>
          </form>
        </div>
      )}
    </div>
  );
};
