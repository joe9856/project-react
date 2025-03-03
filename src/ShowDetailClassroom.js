import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";
import { collection, doc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const ShowDetailClassroom = () => {
  const { cid } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinCode, setCheckinCode] = useState("");

  useEffect(() => {
    if (!cid) return;

    const fetchClassroomData = async () => {
      try {
        const classroomRef = doc(db, "classroom", cid);
        const classroomSnap = await getDoc(classroomRef);

        if (classroomSnap.exists()) {
          setClassroom(classroomSnap.data());
        }

        const studentsRef = collection(db, "classroom", cid, "students");
        const studentsSnap = await getDocs(studentsRef);
        const studentsList = studentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsList);

        const checkinRef = collection(db, "classroom", cid, "checkin");
        const checkinSnap = await getDocs(checkinRef);
        if (!checkinSnap.empty) {
          const lastCheckin = checkinSnap.docs[checkinSnap.docs.length - 1];
          const lastCheckinCode = await getDoc(doc(db, `classroom/${cid}/checkin/${lastCheckin.id}`));

          if (lastCheckinCode.exists()) {
            setCheckinCode(lastCheckinCode.data().code);
          }
        }
      } catch (error) {
        console.error("Error fetching classroom data:", error.message);
      }
    };

    fetchClassroomData();
  }, [cid]);

  // 🔹 ฟังก์ชันอัปเดตสถานะนักเรียน
  const handleVerifyStudent = async (studentId) => {
    try {
      const studentRef = doc(db, "classroom", cid, "students", studentId);
      await updateDoc(studentRef, { status: 1 });

      // อัปเดตค่าใน State เพื่อแสดงผลทันที
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId ? { ...student, status: 1 } : student
        )
      );
    } catch (error) {
      console.error("Error updating student status:", error.message);
    }
  };

  

  if (!cid) {
    return <p className="text-danger text-center">Invalid Classroom ID. Please check your Classroom ID.</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold text-primary">📝 รายละเอียดห้องเรียน</h2>
  
      {classroom && (
        <div className="card shadow-lg mb-4 border-0">
          <div className="card-body p-4">
            <h3 className="text-center text-dark fw-bold">{classroom.info?.name}</h3>
            <p className="text-muted text-center fs-5">ห้องเรียน: {classroom.info?.code}</p>
  
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
              <div
                className="rounded shadow-lg"
                style={{
                  backgroundImage: `url(${classroom.info?.photo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "300px",
                  width: "60%",
                  borderRadius: "20px",
                }}
              />
              <div className="ms-md-4 p-3 bg-white rounded shadow-lg" style={{ border: "4px solid #007bff" }}>
                <QRCodeCanvas value={cid} size={200} fgColor="#000000" bgColor="#ffffff" />
              </div>
            </div>
          </div>
        </div>
      )}
  
      <div className="card shadow-lg border-0">
        <div className="card-body">
          <h4 className="text-center mb-3 fw-bold text-dark">📋 รายชื่อนักเรียน</h4>
          {students.length > 0 ? (
            <table className="table table-hover text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>รหัสนักเรียน</th>
                  <th>ชื่อ</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="fw-bold">{index + 1}</td>
                    <td>{student.stdid}</td>
                    <td>{student.name}</td>
                    <td>
                      {student.status === 1 ? (
                        <span className="badge bg-success px-3 py-2 fs-6">✅ ตรวจสอบแล้ว</span>
                      ) : (
                        <span className="badge bg-warning text-dark px-3 py-2 fs-6">⏳ รอตรวจสอบ</span>
                      )}
                    </td>
                    <td>
                      {student.status === 0 && (
                        <button
                          className="btn btn-outline-success btn-sm fw-bold px-3"
                          onClick={() => handleVerifyStudent(student.id)}
                        >
                          ✔️ ตรวจสอบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted fs-5">ไม่มีข้อมูลนักเรียน</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default ShowDetailClassroom;
