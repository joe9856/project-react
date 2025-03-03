import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const ClassroomManagement = () => {
  const { cid } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinNumber, setCheckinNumber] = useState(1);
  const [checkinCode, setCheckinCode] = useState(""); // เก็บค่า code จาก Firestore
  const navigate = useNavigate();

  useEffect(() => {
    if (!cid) {
      console.error("Invalid classroom ID");
      return;
    }

    const fetchClassroomData = async () => {
      try {
        // ดึงข้อมูลห้องเรียน
        const classroomRef = doc(db, "classroom", cid);
        const classroomSnap = await getDoc(classroomRef);

        if (classroomSnap.exists()) {
          setClassroom(classroomSnap.data());
        } else {
          console.log("No such classroom!");
        }

        // ดึงข้อมูล Check-in ล่าสุด
        const checkinRef = collection(db, "classroom", cid, "checkin");
        const checkinSnap = await getDocs(checkinRef);

        if (!checkinSnap.empty) {
          const lastCheckin = checkinSnap.docs[checkinSnap.docs.length - 1]; // ดึงข้อมูลรอบล่าสุด
          const lastCheckinData = await getDoc(
            doc(db, `classroom/${cid}/checkin/${lastCheckin.id}`)
          );

          if (lastCheckinData.exists()) {
            setCheckinCode(lastCheckinData.data().code);
            setCheckinNumber(parseInt(lastCheckin.id)); // ตั้งค่าหมายเลขการเช็คชื่อ
          }
        }

        // ดึงข้อมูลนักเรียนที่เช็คชื่อแล้ว
        const studentsRef = collection(
          db,
          `classroom/${cid}/checkin/${checkinNumber}/students`
        );
        const studentsSnap = await getDocs(studentsRef);
        const studentsList = studentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching classroom data:", error.message);
      }
    };

    fetchClassroomData();
  }, [cid, checkinNumber]);

   
  const goToCreateQuestion = (cid, checkinNumber) => {
    navigate(`/question/${cid}/checkin/${checkinNumber}`);
  };
  

  if (!cid) {
    return (
      <p className="text-danger text-center">
        Invalid Classroom ID. Please check your Classroom ID.
      </p>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-primary">📝 การจัดการห้องเรียน</h2>
  
      {classroom && (
        <div className="card shadow-lg mb-4">
          <div className="card-body">
            <h3 className="text-primary text-center">{classroom.info?.name}</h3>
            <p className="text-muted text-center">ห้องเรียน: {classroom.info?.code}</p>
  
            <div className="d-flex align-items-center justify-content-center">
              <div
                className="rounded p-5"
                style={{
                  backgroundImage: `url(${classroom.info?.photo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "300px",
                  width: "40%",
                  borderRadius: "15px",
                }}
              />
              <div
                className="ms-4 p-3 bg-white rounded shadow"
                style={{ border: "4px solid #1976d2" }}
              >
                <QRCodeCanvas
                  value={checkinCode}
                  size={200}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* 🔹 แสดงรหัส Check-in ล่าสุด 🔹 */}
      {checkinCode && (
        <div className="alert alert-info text-center shadow-sm" style={{ backgroundColor: '#ffff', border: '1px solid #1976d2' }}>
          <h5 className="text-dark">
            <span role="img" aria-label="key">🔑</span> รหัสเช็คชื่อ: <strong>{checkinCode}</strong>
          </h5>
        </div>
      )}

      {checkinNumber && (
        <div className="alert alert-info text-center shadow-sm" style={{ backgroundColor: '#ffff', border: '1px solid #28a745' }}>
          <h5 className="text-dark">
            <span role="img" aria-label="key">🔑</span> รหัสเช็คชื่อ: <strong>{checkinNumber}</strong>
          </h5>
        </div>
      )}

  
      {/* ปุ่มเพิ่มคำถาม */}
      <div className="text-center mb-4">
        <button
          className="btn btn-primary btn-lg px-5 py-3 shadow"
          onClick={() => goToCreateQuestion(cid, checkinNumber)}
          style={{ backgroundColor: '#1976d2', borderColor: '#1976d2' }}
        >
          ✏️ เพิ่มคำถามสำหรับห้องเรียน
        </button>
      </div>
  
      {/* ปุ่มเพิ่มการเช็คชื่อ */}
      <div className="text-center mb-4">
        <button 
          className="btn btn-success btn-lg px-5 py-3 shadow" 
          style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
        >
          + เพิ่มการเช็คชื่อ
        </button>
      </div>
  
      <h4 className="text-center mb-4">📋 รายชื่อนักเรียนที่เช็คชื่อ</h4>
  
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>ลำดับ</th>
              <th>รหัสนักเรียน</th>
              <th>ชื่อ</th>
              <th>วันเวลาที่เช็คชื่อ</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.stdid}</td>
                  <td>{student.name}</td>
                  <td>{student.date}</td>
                  <td>{student.remark || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  ยังไม่มีนักเรียนที่เช็คชื่อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default ClassroomManagement;
