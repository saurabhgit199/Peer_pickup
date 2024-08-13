import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-config";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import "../styles/PrivateChat.css";

export const PrivateChat = ({ requestId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = collection(db, "privateChats");

  useEffect(() => {
    const q = query(
      chatRef,
      where("requestId", "==", requestId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [requestId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;

    await addDoc(chatRef, {
      text: newMessage,
      createdAt: new Date(),
      user: auth.currentUser.displayName,
      requestId,
    });

    setNewMessage("");
  };

  return (
    <div className="private-chat">
      <div className="private-chat-header">
        <h2>Private Chat</h2>
        <button className="close-chat" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="private-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`private-chat-message ${
              message.user === auth.currentUser.displayName ? "sent" : "received"
            }`}
          >
            <strong>{message.user}:</strong> {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="private-chat-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="private-chat-input"
          placeholder="Type your message..."
        />
        <button type="submit" className="private-chat-send-button">
          Send
        </button>
      </form>
    </div>
  );
};
