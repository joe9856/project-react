import React, { useState } from "react";
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Login with Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google Login Success!");
    } catch (error) {
      console.error(error);
    }
  };

  const sendOTP = async () => {
    try {
      if (!phone.match(/^\+[1-9]\d{6,14}$/)) {
        alert("Invalid phone number format! Use E.164 format (e.g., +66912345678)");
        return;
      }
  
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              sendOTP(); // Callback เรียกซ้ำถ้าผ่าน reCAPTCHA
            },
          },
          auth
        );
      }
  
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      alert("OTP Sent!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    }
  };
  
  
  

  const verifyOTP = async () => {
    try {
      if (!confirmationResult) {
        alert("Please request an OTP first!");
        return;
      }
  
      await confirmationResult.confirm(otp);
      alert("Phone Login Success!");
    } catch (error) {
      console.error(error);
      alert("Invalid OTP! Please try again.");
    }
  };
  

  return (
    <div>
      <h2>Login / Register</h2>

      {/* Google Login */}
      <button onClick={handleGoogleLogin}>Sign in with Google</button>

      <hr />

      {/* Phone Authentication */}
      <input type="text" placeholder="+66 912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={sendOTP}>Send OTP</button>

      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOTP}>Verify OTP</button>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Auth;
