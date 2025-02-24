import React, { useState } from 'react';
import { db, auth } from './firebase';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const AddClassroom = () => {
  const [subjectData, setSubjectData] = useState({
    code: '',
    name: '',
    photo: '',
    room: '',
  });

  const navigate = useNavigate(); // ใช้สำหรับเปลี่ยนหน้า

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSubject = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนสร้างห้องเรียน!');
        return;
      }

      // ✅ สร้างห้องเรียนใหม่
      const classroomRef = await addDoc(collection(db, 'classroom'), {
        owner: user.uid,
      });

      const cid = classroomRef.id;
      console.log("Classroom created with ID:", cid);

      // ✅ อัปเดตข้อมูลห้องเรียน
      const classroomDocRef = doc(db, 'classroom', cid);
      await setDoc(classroomDocRef, {
        info: subjectData,
      }, { merge: true });

      // ✅ เพิ่มสถานะอาจารย์ใน /users/{uid}/classroom/{cid}
      const userClassroomRef = doc(db, 'Users', user.uid, 'classroom', cid);
      await setDoc(userClassroomRef, {
        status: 1,  // อาจารย์สามารถดูและแก้ไขห้องเรียนได้
      }, { merge: true });

      alert('สร้างห้องเรียนสำเร็จ!');
      // navigate(`/classroom/${cid}`); // นำผู้ใช้ไปยังหน้าห้องเรียน
      navigate("/home");
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error.message);
      alert('ไม่สามารถสร้างห้องเรียนได้!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addSubject();
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">เพิ่มวิชาใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">รหัสวิชา</label>
          <input
            type="text"
            name="code"
            className="form-control"
            value={subjectData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">ชื่อวิชา</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={subjectData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">URL รูปภาพ</label>
          <input
            type="url"
            name="photo"
            className="form-control"
            value={subjectData.photo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">ห้องเรียน</label>
          <input
            type="text"
            name="room"
            className="form-control"
            value={subjectData.room}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          เพิ่มวิชา
        </button>
      </form>
    </div>
  );
};

export default AddClassroom;
