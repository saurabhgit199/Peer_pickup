// src/components/Chat.js
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
  doc,
} from "firebase/firestore";
import "../styles/Chat.css";
import RequestForm from "./RequestForm";

export const Chat = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [category, setCategory] = useState("I Want");
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
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
      category,
      fulfilled: false,
    });

    setNewMessage("");
    setCategory("I Want");
  };

  const handleMarkAsFulfilled = async (messageId) => {
    const messageDoc = doc(db, "messages", messageId);
    await updateDoc(messageDoc, {
      fulfilled: true,
    });
  };

  const handleHighlightMessage = (messageId) => {
    setHighlightedMessageId(messageId);
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
            className={`message ${message.category.toLowerCase().replace(/ /g, "-")} ${message.fulfilled ? "fulfilled" : ""} ${highlightedMessageId === message.id ? "highlighted" : ""}`}
            onClick={() => {
              if (message.category === "I Want" && !message.fulfilled && auth.currentUser) {
                handleMarkAsFulfilled(message.id);
              } else {
                handleHighlightMessage(message.id);
              }
            }}
          >
            <span className="user">{message.user}:</span> {message.text}
            {message.category === "I Want" && !message.fulfilled && (
              <button
                className="fulfill-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsFulfilled(message.id);
                }}
              >
                Fulfill
              </button>
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
        <div className="message-buttons">
          <button
            type="button"
            className="message-button i-want"
            onClick={() => setShowRequestForm(true)}
          >
            I Want
          </button>
          <button
            type="button"
            className="message-button i-can-get"
            onClick={() => setCategory("I Can Get")}
          >
            I Can Get
          </button>
          <button
            type="submit"
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
      {showRequestForm && (
        <RequestForm 
          onClose={() => setShowRequestForm(false)} 
          room={room} 
        />
      )}
    </div>
  );
};
