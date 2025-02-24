import React from "react";
import { db } from "./firebase"; // ✅ นำเข้า db ให้ถูกต้อง
import { doc, setDoc, collection } from "firebase/firestore";

const AddUser = () => {
  const addUserData = async () => {
    const userId = "user123";
    const classroomId = "class456";

    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        name: "John Doe",
        email: "johndoe@example.com",
        photo: "https://example.com/photo.jpg"
      });

      const classroomRef = doc(collection(userRef, "classroom"), classroomId);
      await setDoc(classroomRef, {
        status: 1 // 1 = อาจารย์, 2 = นักเรียน
      });

      console.log("✅ เพิ่มข้อมูลเรียบร้อย!");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
    }
  };

  return (
    <div>
      <h2>เพิ่มข้อมูลผู้ใช้</h2>
      <button onClick={addUserData}>เพิ่มข้อมูล</button>
    </div>
  );
};

export default AddUser;
