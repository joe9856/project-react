import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(""); // เพิ่มช่องให้ใส่ URL รูปภาพ
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 1. สมัครสมาชิก
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. อัปเดตโปรไฟล์ (ชื่อและรูปภาพ)
      await updateProfile(user, {
        displayName: displayName || "New User",
        photoURL: photoURL || "https://via.placeholder.com/150", // ใช้ค่าจากผู้ใช้ ถ้าไม่ใส่ใช้ค่าดีฟอลต์
      });

      // 3. บันทึกข้อมูลลง Firestore
      const userRef = doc(db, "Users", user.uid);
      const userData = {
        uid: user.uid,
        displayName: displayName || "New User",
        email: user.email,
        photoURL: photoURL || "https://via.placeholder.com/150",
        createdAt: new Date(),
      };

      await setDoc(userRef, userData);

      // 4. ไปที่หน้า Home
      navigate("/home");

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-3">Register</h3>
        {error && <p className="text-danger text-center">{error}</p>}
        
        <div className="mb-3">
          <label htmlFor="displayName" className="form-label">Display Name</label>
          <input
            type="text"
            className="form-control"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="photoURL" className="form-label">Profile Picture URL</label>
          <input
            type="text"
            className="form-control"
            id="photoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button onClick={handleRegister} className="btn btn-primary w-100 mb-3">
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
