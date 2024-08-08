// src/components/RequestForm.js
import React, { useState } from 'react';
import { db, auth } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/RequestForm.css';

const RequestForm = ({ onClose, room }) => {
  const [heading, setHeading] = useState('');
  const [items, setItems] = useState(['']);
  const [logisticsFees, setLogisticsFees] = useState('');

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (heading === '' || items.some(item => item.trim() === '') || logisticsFees === '') {
      alert('Please fill out all fields.');
      return;
    }

    await addDoc(collection(db, 'requests'), {
      heading,
      items,
      logisticsFees,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
    });

    onClose();
  };

  return (
    <div className="request-form">
      <h2>Request Details</h2>
      <form onSubmit={handleSubmit}>
        <label>
          What do you want?
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="What do you want"
            required
          />
        </label>
        <div className="items-list">
          {items.map((item, index) => (
            <label key={index}>
              Item {index + 1}:
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder="Item description"
                required
              />
            </label>
          ))}
          <button type="button" onClick={handleAddItem}>
            Add Another Item
          </button>
        </div>
        <label>
          Logistics Fees:
          <input
            type="text"
            value={logisticsFees}
            onChange={(e) => setLogisticsFees(e.target.value)}
            placeholder="Logistics fees"
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
