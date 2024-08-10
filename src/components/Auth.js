import React from "react";
import { auth, provider } from "../firebase-config.js";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import "../styles/Auth.css";
import Cookies from "js-cookie";
import logoWhite from '../logo-white.png'; // Import the white logo

const cookies = Cookies;

export const Auth = ({ setIsAuth }) => {
  console.log("Auth component rendered");
  
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      setIsAuth(true);
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      cookies.set("auth-token", userCredential.user.refreshToken);
      setIsAuth(true);
    } catch (err) {
      console.error(err);
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      cookies.set("auth-token", userCredential.user.refreshToken);
      setIsAuth(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    signInWithEmail(email, password);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    registerWithEmail(email, password);
  };

  return (
    <div className="auth">
      {/* Image and title at the top */}
      <div className="logo-container">
        <div className="logo-title">Peer-Port</div>
        <img src={logoWhite} alt="Logo" className="logo" />
      </div>
      
      <p>Sign In With Google To Continue</p>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
      
      <form onSubmit={handleLogin}>
        <h3>Sign In</h3>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
      
      {/* Instructions section */}
      <div className="instructions-container">
        <h2 className="instructions-header">How to Use the App</h2>
        <ul className="instructions-list">
          <li>Enter your credentials and click <strong>"Sign in with Google"</strong>.</li>
          <li>Enter the locality name or institute name in the room to join your peer community.</li>
          <li>
            If you need to transport or get something delivered, or want to go to another area of your city, ask your peers by posting your request by clicking on the <strong>"I want"</strong> button in the room.
          </li>
          <li>Decide the amount of fees you can offer for the service.</li>
          <li>
            If you're visiting or passing by another location, check the requests to see if you can help.
          </li>
          <li>
            Click on the <strong>"Fulfill"</strong> button to offer your service and earn cash.
          </li>
          <li>
            Complete the delivery, receive the agreed-upon fee, and reduce the carbon footprint by using <strong>Peer-Port, the peer transport platform.</strong>
          </li>
        </ul>
      </div>
      {/* End of instructions section */}
    </div>
  );
};
