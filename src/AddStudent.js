import React, { useState } from 'react';
import { useParams } from 'react-router-dom';  // นำเข้า useParams
import { db, auth } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const AddStudent = () => {
  const { cid } = useParams();  // ดึงค่า cid จาก URL path
  const [studentData, setStudentData] = useState({
    stdid: '',  // รหัสนักเรียน
    name: '',    // ชื่อนักเรียน
    status: 0,   // สถานะ (0 ยังไม่ตรวจสอบ, 1 ตรวจสอบแล้ว)
  });

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ฟังก์ชันเพิ่มนักเรียน
  const addStudent = async (cid, studentData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not logged in!');
        return;
      }

      // ตรวจสอบว่า UID ของผู้ใช้ตรงกับ owner ของห้องเรียนหรือไม่
      const classroomRef = doc(db, 'classroom', cid);
      const classroomSnapshot = await getDoc(classroomRef);

      if (!classroomSnapshot.exists()) {
        console.error('Classroom not found!');
        return;
      }

      const classroomData = classroomSnapshot.data();
      if (!classroomData || !classroomData.owner) {
        console.error('Classroom data or owner is missing!');
        return;
      }

      if (classroomData.owner !== user.uid) {
        console.error('User is not the owner of the classroom!');
        return;
      }

      // เพิ่มข้อมูลนักเรียนลงใน /classroom/{cid}/students/{sid}/stdid
      const studentRef = doc(db, 'classroom', cid, 'students', user.uid);  // ใช้ user.uid เป็น sid
      await setDoc(studentRef, { 
        stdid: studentData.stdid, 
        name: studentData.name || '',  // ถ้าไม่มี name จะเป็นค่าว่าง
        status: 0 
      });

      console.log('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addStudent(cid, studentData); // เรียกใช้ฟังก์ชันที่เพิ่มนักเรียน
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">เพิ่มข้อมูลนักเรียน</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="stdid" className="form-label">รหัสนักเรียน</label>
          <input
            type="text"
            id="stdid"
            name="stdid"
            className="form-control"
            value={studentData.stdid}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">ชื่อนักเรียน</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={studentData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="status" className="form-label">สถานะ</label>
          <select
            id="status"
            name="status"
            className="form-control"
            value={studentData.status}
            onChange={handleChange}
            required
          >
            <option value={0}>ยังไม่ตรวจสอบ</option>
            <option value={1}>ตรวจสอบแล้ว</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">เพิ่มนักเรียน</button>
      </form>
    </div>
  );
};

export default AddStudent;
