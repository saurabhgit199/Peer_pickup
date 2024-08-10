// src/App.js
import React, { useState, useEffect } from "react";
import { Chat } from "./components/Chat";
import { Auth } from "./components/Auth.js";
import { AppWrapper } from "./components/AppWrapper";
import Cookies from "universal-cookie";
import { db, auth } from "./firebase-config";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import "./styles/Auth.css";

const cookies = new Cookies();

function ChatApp() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [isInChat, setIsInChat] = useState(false);
  const [room, setRoom] = useState("");
  const [joinedRooms, setJoinedRooms] = useState([]);

  useEffect(() => {
    if (isAuth) {
      const fetchJoinedRooms = async () => {
        const user = auth.currentUser;
        if (user) {
          const roomsRef = collection(db, "users", user.uid, "rooms");
          const q = query(roomsRef);
          const querySnapshot = await getDocs(q);
          const rooms = querySnapshot.docs.map(doc => doc.data().name);
          setJoinedRooms(rooms);
        }
      };
      fetchJoinedRooms();
    }
  }, [isAuth]);

  const handleJoinRoom = async () => {
    if (room) {
      const user = auth.currentUser;
      if (user) {
        const roomsRef = collection(db, "users", user.uid, "rooms");
        await addDoc(roomsRef, { name: room });

        // Update local state
        setJoinedRooms([...joinedRooms, room]);
        setIsInChat(true);
      }
    }
  };

  const handleRoomClick = (roomName) => {
    setRoom(roomName);
    setIsInChat(true);
  };

  if (!isAuth) {
    return (
      <AppWrapper isAuth={isAuth} setIsAuth={setIsAuth} setIsInChat={setIsInChat}>
        <Auth setIsAuth={setIsAuth} />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper isAuth={isAuth} setIsAuth={setIsAuth} setIsInChat={setIsInChat}>
      {!isInChat ? (
        <div className="room">
          <label>Type room name:</label>
          <input onChange={(e) => setRoom(e.target.value)} />
          <button onClick={handleJoinRoom}>Enter Chat</button>
          <div className="joined-rooms">
            {joinedRooms.length > 0 && (
              <div>
                <h2>Joined Rooms:</h2>
                <ul>
                  {joinedRooms.map((r, index) => (
                    <li key={index}>
                      {r}
                      <button onClick={() => handleRoomClick(r)}>Enter Room</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Chat room={room} />
      )}
    </AppWrapper>
  );
}

export default ChatApp;
