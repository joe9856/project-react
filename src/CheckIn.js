// CheckIn.js
import React, { useState } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CheckIn = ({ cid }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(0); // สถานะเริ่มต้น: ยังไม่เริ่มเช็คชื่อ
  const [message, setMessage] = useState('');

  // ฟังก์ชันสำหรับการเช็คชื่อ
  const handleCheckIn = async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      setMessage('กรุณาล็อกอินก่อน');
      return;
    }

    try {
      // ตรวจสอบห้องเรียน
      const classroomRef = doc(db, 'classroom', cid);
      const classroomSnapshot = await getDoc(classroomRef);

      if (!classroomSnapshot.exists()) {
        setMessage('ไม่พบห้องเรียน');
        return;
      }

      const classroomData = classroomSnapshot.data();
      const cno = 1; // ใช้ลำดับการเช็คชื่อ หรือสามารถให้ผู้ใช้เลือกได้

      const checkinRef = doc(db, 'classroom', cid, 'checkin', cno.toString());
      const checkinSnapshot = await getDoc(checkinRef);

      if (checkinSnapshot.exists() && checkinSnapshot.data().code === code) {
        // ถ้ารหัสเช็คชื่อถูกต้อง, บันทึกข้อมูลนักเรียน
        const studentRef = doc(db, 'classroom', cid, 'checkin', cno.toString(), 'students', user.uid);
        await setDoc(studentRef, {
          stdid: user.uid,
          name: user.displayName || '',
          remark: 'เข้าร่วมเรียบร้อยแล้ว',
          date: new Date().toISOString(),
        });

        setMessage('เช็คชื่อสำเร็จ');
      } else {
        setMessage('รหัสเช็คชื่อไม่ถูกต้อง');
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">เช็คชื่อห้องเรียน</h2>
      <form onSubmit={handleCheckIn}>
        <div className="mb-3">
          <label htmlFor="code" className="form-label">รหัสเช็คชื่อ</label>
          <input
            type="text"
            id="code"
            className="form-control"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">เช็คชื่อ</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default CheckIn;
