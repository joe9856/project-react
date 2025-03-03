import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; 

const EditProfile = ({ userData, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    email: userData?.email || '',
    photoURL: userData?.photoURL || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // เพิ่มสถานะสำหรับการอัปเดต
  const navigate = useNavigate();

  // ตรวจสอบสถานะผู้ใช้และเปลี่ยนเส้นทางหากผู้ใช้ไม่ได้ล็อกอิน
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // ตรวจสอบว่าผู้ใช้ไม่สามารถเข้าสู่หน้า Login หากกำลังบันทึกข้อมูล
      if (!user && !isUpdating) {
        navigate('/login'); // หากไม่มีผู้ใช้ล็อกอิน เปลี่ยนเส้นทางไปหน้า login
      }
    });

    return () => unsubscribe(); // ลบการสมัครสมาชิกเมื่อคอมโพเนนต์ถูกทำลาย
  }, [navigate, isUpdating]); // เพิ่ม isUpdating เพื่อป้องกันการเปลี่ยนเส้นทางระหว่างการอัปเดต

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsUpdating(true); // ตั้งค่าเป็น true เพื่อป้องกันการตรวจสอบสถานะผู้ใช้

    try {
      await handleSave({
        displayName: formData.displayName,
        email: formData.email,
        photoURL: formData.photoURL,
      });
  
      // ✅ หลังจากอัปเดตแล้วเปลี่ยนเส้นทางไปที่หน้า Profile หรือหน้า Home
      navigate('/home'); // หรือเปลี่ยนเป็น '/home' ตามที่ต้องการ
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
      setIsUpdating(false); // รีเซ็ตสถานะเมื่อการอัปเดตเสร็จสิ้น
    }
  };

  const handleCancel = () => {
    navigate('/home'); // เปลี่ยนเส้นทางไปหน้า Home ทันที
  };

  const handleSave = async (updatedData) => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // ✅ อัปเดตข้อมูลใน Firebase Authentication
      await updateProfile(user, {
        displayName: updatedData.displayName,
        photoURL: updatedData.photoURL,
      });
  
      // ✅ อัปเดตข้อมูลใน Firestore (ถ้าคุณเก็บข้อมูลผู้ใช้ใน Firestore)
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, updatedData);
  
      alert("อัปเดตข้อมูลเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">แก้ไขข้อมูลส่วนตัว</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">ชื่อที่แสดง</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control bg-light"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">URL รูปโปรไฟล์</label>
            <input
              type="url"
              name="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="button" onClick={handleCancel} className="btn btn-outline-secondary w-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-50">
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
