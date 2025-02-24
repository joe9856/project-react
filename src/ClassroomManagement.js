import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { QRCodeCanvas } from 'qrcode.react';
import { collection, doc, getDocs, setDoc, addDoc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClassroomManagement = () => {
  const { cid } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinNumber, setCheckinNumber] = useState(1);

  useEffect(() => {
    if (!cid) {
      console.error("Invalid classroom ID");
      return;
    }

    const fetchClassroomData = async () => {
      try {
        const classroomRef = doc(db, 'classroom', cid);
        const classroomSnap = await getDoc(classroomRef);

        if (classroomSnap.exists()) {
          setClassroom(classroomSnap.data());
        } else {
          console.log("No such classroom!");
        }

        const studentsRef = collection(db, 'classroom', cid, 'students');
        const studentsSnap = await getDocs(studentsRef);
        const studentsList = studentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsList);
      } catch (error) {
        console.error('Error fetching classroom data:', error.message);
      }
    };

    fetchClassroomData();
  }, [cid]);

  if (!cid) {
    return <p className="text-danger text-center">Invalid Classroom ID. Please check your Classroom ID.</p>;
  }

  const createCheckin = async () => {
    try {
      const checkinRef = await addDoc(collection(db, 'classroom', cid, 'checkin'), {
        cno: checkinNumber,
      });

      const studentsRef = collection(db, 'classroom', cid, 'students');
      const studentsSnap = await getDocs(studentsRef);
      studentsSnap.forEach(async (studentDoc) => {
        await setDoc(doc(db, 'classroom', cid, 'checkin', checkinRef.id, 'scores', studentDoc.id), {
          status: 0,
        });
      });

      console.log('Checkin created and students added successfully!');
      setCheckinNumber(checkinNumber + 1);
    } catch (error) {
      console.error('Error creating checkin:', error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📝 การจัดการห้องเรียน</h2>
      
      {classroom && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h3 className="text-primary text-center">{classroom.info?.name}</h3>
            <p className="text-muted text-center">รหัสห้อง: {classroom.info?.code}</p>
  
            {/* แสดงรูปภาพทางซ้าย & QR Code ทางขวา */}
            <div className="d-flex align-items-center justify-content-center">
              {/* รูปห้องเรียน */}
              <div
                className="rounded p-5"
                style={{
                  backgroundImage: `url(${classroom.info?.photo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '300px',
                  width: '40%',
                  borderRadius: '40px',
                }}
              />
              
              {/* QR Code */}
              <div className="ms-4 p-3 bg-white rounded" style={{ border: '4px solid black' }}>
                <QRCodeCanvas value={cid} size={200} fgColor="#000000" bgColor="#ffffff" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <button className="btn btn-success px-4 py-2" onClick={createCheckin}>
          ➕ เพิ่มการเช็คชื่อ
        </button>
      </div>
  
      <h4 className="text-center">📋 รายชื่อนักเรียนที่ลงทะเบียน</h4>
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>ลำดับ</th>
              <th>รหัสนักเรียน</th>
              <th>ชื่อ</th>
              <th>รูปภาพ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>
                  <img
                    src={student.photo || 'default-avatar.png'}
                    alt={student.name}
                    className="rounded-circle border"
                    style={{ width: '40px', height: '40px' }}
                  />
                </td>
                <td>
                  <span className={student.status === 1 ? "badge bg-success" : "badge bg-danger"}>
                    {student.status === 1 ? '✔ Verified' : '❌ Not Verified'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default ClassroomManagement;
