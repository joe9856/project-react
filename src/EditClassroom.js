import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc,getDocs, updateDoc,collection } from 'firebase/firestore';
import { db } from './firebase'; // นำเข้า Firestore instance

const EditClassroom = () => {
  const { cid } = useParams(); // ดึง `cid` จาก URL
  console.log('cid:', cid);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    photo: '',
    room: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ดึงข้อมูลห้องเรียนจาก Firestore
  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!cid) {
        console.log('ไม่พบรหัสห้องเรียน');
        alert('ไม่พบรหัสห้องเรียน');
        navigate('/home');
        return;
      }
    
      try {
        // เช็ค path ที่กำลังดึงข้อมูล
        console.log('กำลังดึงข้อมูลห้องเรียนจาก: ', `classroom/${cid}`);
        
        // ใช้ doc() เพื่อดึงข้อมูลของ classroom document
        const classroomRef = doc(db, 'classroom', cid);
    
        const docSnap = await getDoc(classroomRef);
    
        if (docSnap.exists()) {
          // ดึงข้อมูลจาก field 'info' ซึ่งเป็น object ที่มีข้อมูลต่างๆ เช่น code, name, photo, room
          const classroomData = docSnap.data().info; // เข้าถึง field 'info' ที่อยู่ใน classroom document
          setFormData({
            code: classroomData.code,
            name: classroomData.name,
            photo: classroomData.photo,
            room: classroomData.room
          });
        } else {
          console.log('ไม่พบข้อมูลห้องเรียน');
          alert('ไม่พบข้อมูลห้องเรียน');
          navigate('/home');
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียน: ", error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    };
  
    fetchClassroomData();
  }, [cid]);

  
  
  

  // จัดการการเปลี่ยนแปลงของฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // จัดการการส่งข้อมูลเพื่อบันทึกการอัปเดต
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!cid) {
      console.log('ไม่พบรหัสห้องเรียน');
      alert('ไม่พบรหัสห้องเรียน');
      navigate('/home');
      return;
    }
  
    try {
      // เช็ค path ที่กำลังดึงข้อมูล
      console.log('กำลังอัปเดตข้อมูลห้องเรียนใน: ', `classroom/${cid}`);
  
      // อ้างอิงไปยัง document ของ classroom
      const classroomRef = doc(db, 'classroom', cid);
  
      // การอัปเดต field 'info' ภายใน document ของ classroom
      await updateDoc(classroomRef, {
        'info.code': formData.code,
        'info.name': formData.name,
        'info.photo': formData.photo,
        'info.room': formData.room
      });
  
      console.log('อัปเดตข้อมูลห้องเรียนสำเร็จ');
      alert('อัปเดตข้อมูลห้องเรียนสำเร็จ');
      navigate('/home');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลห้องเรียน: ', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  };

  // ยกเลิกและกลับไปที่หน้า classroom
  const handleCancel = () => {
    navigate(`/home`); // เปลี่ยนเส้นทางกลับไปที่หน้า Classroom
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">แก้ไขข้อมูลห้องเรียน</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">รหัสวิชา</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">ชื่อวิชา</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">URL รูปภาพ</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">ชื่อห้องเรียน</label>
            <input
              type="text"
              name="room"
              value={formData.room}
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

export default EditClassroom;
