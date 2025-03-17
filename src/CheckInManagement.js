import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { db, auth } from "./firebase"; // Import การเชื่อมต่อกับ Firestore
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  setDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
const CheckInManagement = () => {
  const { cid, cno } = useParams();
  const [students, setStudents] = useState([]);
  const [checkinData, setCheckinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็นอาจารย์เจ้าของห้องหรือไม่
  useEffect(() => {
    let unsubscribeStudents = null;
    let unsubscribeCheckinData = null;
  
    const checkPermission = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
  
        // ตรวจสอบว่าเป็นอาจารย์เจ้าของห้องหรือไม่
        const classroomRef = doc(db, "classroom", cid);
        const classroomDoc = await getDoc(classroomRef);
  
        if (classroomDoc.exists() && classroomDoc.data().teacherId === user.uid) {
          setIsTeacher(true);
        }
      }
  
      unsubscribeCheckinData = loadCheckinData();
    };
  
    checkPermission();
  
    // ทำความสะอาด subscription เมื่อ component unmount
    return () => {
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeCheckinData) unsubscribeCheckinData();
    };
  }, [cid]);

 // โหลดข้อมูลการเช็คชื่อและข้อมูลนักเรียน
const loadCheckinData = () => {
  try {
    setLoading(true);

    // ดึงข้อมูลการเช็คชื่อแบบ realtime
    const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    const unsubscribeCheckin = onSnapshot(checkinRef, async (checkinDoc) => {
      if (checkinDoc.exists()) {
        const data = checkinDoc.data();

        // ถ้าไม่มีวันที่ให้สร้างขึ้นใหม่
        if (!data.date) {
          console.warn("No date data found, using current timestamp instead");
          const now = new Date();

          // แปลงวันเวลาปัจจุบันเป็นรูปแบบไทย
          const nowDate = now.getDate().toString().padStart(2, "0");
          const nowMonth = (now.getMonth() + 1).toString().padStart(2, "0");
          const nowYear = now.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
          const nowHour = now.getHours().toString().padStart(2, "0");
          const nowMinute = now.getMinutes().toString().padStart(2, "0");
          const nowSecond = now.getSeconds().toString().padStart(2, "0");

          const nowThaiFormat = `${nowDate}/${nowMonth}/${nowYear} ${nowHour}:${nowMinute}:${nowSecond}`;

          // เพิ่มข้อมูลวันที่ลงในตัวแปร data
          data.date = nowThaiFormat;

          // อัปเดตข้อมูลลง Firestore (เพื่อบันทึกวันที่ที่สร้างขึ้นใหม่)
          updateDoc(checkinRef, { date: nowThaiFormat }).catch((err) => {
            console.error("Error updating date:", err);
          });
        }

        setCheckinData(data);

        // แปลงเวลาเริ่มต้นเช็คชื่อเป็น Date object
        let checkInStartTime;
        if (data.date) {
          const [datePart, timePart] = data.date.split(" ");
          const [day, month, buddhistYear] = datePart.split("/");
          const gregorianYear = parseInt(buddhistYear) - 543;

          const [hours, minutes, seconds] = timePart.split(":");
          checkInStartTime = new Date(
            gregorianYear,
            month - 1,
            day,
            hours,
            minutes,
            seconds
          );
        } else {
          checkInStartTime = new Date();
        }

        // กำหนดเวลาที่ถือว่ามาสาย (เริ่มต้น + 15 นาที)
        const lateThreshold = new Date(
          checkInStartTime.getTime() + 15 * 60 * 1000
        );

        // ดึงข้อมูลนักเรียนและคะแนนแบบ realtime
        const classroomStudents = await loadClassroomStudents();

        // ใช้ onSnapshot สำหรับข้อมูลคะแนน
        const scoresRef = collection(
          db,
          `classroom/${cid}/checkin/${cno}/scores`
        );
        const unsubscribeScores = onSnapshot(scoresRef, (snapshot) => {
          const scoresData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // รวมข้อมูลและตรวจสอบสถานะมาสาย
          const allStudents = classroomStudents.map((student) => {
            const score = scoresData.find((s) => s.id === student.id);

            // ถ้ามีข้อมูลคะแนนและเวลาเช็คชื่อ ให้ตรวจสอบว่ามาสายหรือไม่
            if (score && score.date && score.date !== "ยังไม่เช็คชื่อ") {
              // แปลงเวลาเช็คชื่อเป็น Date object
              const [datePart, timePart] = score.date.split(" ");
              const [day, month, buddhistYear] = datePart.split("/");
              const gregorianYear = parseInt(buddhistYear) - 543;

              const [hours, minutes, seconds] = timePart.split(":");
              const checkInTime = new Date(
                gregorianYear,
                month - 1,
                day,
                hours,
                minutes,
                seconds
              );

              // ตรวจสอบว่ามาสายหรือไม่
              const isLate = checkInTime > lateThreshold;

              // อัปเดตสถานะและคะแนน (ถ้าเป็นอาจารย์ไม่อัปเดต เพื่อให้อาจารย์สามารถแก้ไขได้)
              if (!isTeacher && score.status === 1 && isLate) {
                // อัปเดตสถานะเป็นมาสาย
                updateStudentStatus(student.id, 2);

                // อัปเดตข้อมูลเพื่อแสดงผล
                return {
                  ...student,
                  name: student.name || student.displayName || "ไม่มีข้อมูลชื่อ",
                  date: score.date || "ยังไม่เช็คชื่อ",
                  status: 2, // มาสาย
                  score: 0.5,
                };
              }
            }

            return {
              ...student,
              name: student.name || student.displayName || "ไม่มีข้อมูลชื่อ",
              date: score?.date || "ยังไม่เช็คชื่อ",
              status: score?.status || 0, // 0 หมายถึงไม่มา
              score: score?.score || 0,
            };
          });

          setStudents(allStudents);
          setLoading(false);
        });

        // เก็บ unsubscribe function เพื่อทำความสะอาด
        return () => {
          unsubscribeScores();
        };
      } else {
        setLoading(false);
      }
    });

    // เก็บ unsubscribe function เพื่อทำความสะอาด
    return () => {
      unsubscribeCheckin();
    };
  } catch (error) {
    console.error("Error loading data:", error);
    setLoading(false);
  }
};

  // ฟังก์ชันตรวจสอบว่าเช็คชื่อสายหรือไม่
  const isLateCheckIn = (checkInTimeStr, lateThresholdDate) => {
    try {
      // แปลง string วันที่ไทย (28/02/2568 18:20:14) เป็น Date object
      const [datePart, timePart] = checkInTimeStr.split(" ");
      const [day, month, buddhistYear] = datePart.split("/");
      const gregorianYear = parseInt(buddhistYear) - 543;

      const [hours, minutes, seconds] = timePart.split(":");
      const checkInDate = new Date(
        gregorianYear,
        month - 1,
        day,
        hours,
        minutes,
        seconds
      );

      return checkInDate > lateThresholdDate;
    } catch (error) {
      console.error("Error comparing check-in times:", error);
      return false;
    }
  };

  // แปลงวันที่ไทย (28/02/2568 18:20:14) เป็น Date object
  const parseThaiDateString = (dateStr) => {
    try {
      const [datePart, timePart] = dateStr.split(" ");
      const [day, month, buddhistYear] = datePart.split("/");
      const gregorianYear = parseInt(buddhistYear) - 543;

      const [hours, minutes, seconds] = timePart.split(":");
      return new Date(gregorianYear, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error("Error parsing Thai date string:", error, dateStr);
      return null;
    }
  };

  // ฟังก์ชันสำหรับการเช็คอิน (สำหรับนักเรียน)
  // ฟังก์ชันสำหรับการเช็คอิน (สำหรับนักเรียน)
  const handleCheckin = async () => {
    if (!currentUser || !checkinData) return;

    try {
      const now = new Date(); // เวลาปัจจุบัน (ตอนที่นักเรียนเช็คชื่อ)

      // ดึงข้อมูลนักเรียนจาก user collection
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // แปลงวันที่จาก string เป็น Date object (เวลาที่เริ่มต้นเช็คชื่อ)
      let checkinTime;
      if (checkinData.date) {
        checkinTime = parseThaiDateString(checkinData.date);
      } else {
        checkinTime = now;
      }

      // คำนวณเวลาที่ถือว่ามาสาย (เริ่มต้นเช็คชื่อ + 15 นาที)
      const lateThreshold = new Date(checkinTime.getTime() + 15 * 60 * 1000);

      // ตรวจสอบสถานะการเข้าเรียน (ปกติหรือมาสาย)
      const status = now > lateThreshold ? 2 : 1; // 2 คือมาสาย, 1 คือมาปกติ

      console.log("เช็คชื่อเวลา:", now);
      console.log("เริ่มเช็คชื่อ:", checkinTime);
      console.log("เวลาหมดเขต:", lateThreshold);
      console.log("สถานะ:", status === 1 ? "มาปกติ" : "มาสาย");

      // แปลงวันเวลาปัจจุบันเป็นรูปแบบไทย
      const nowDate = now.getDate().toString().padStart(2, "0");
      const nowMonth = (now.getMonth() + 1).toString().padStart(2, "0");
      const nowYear = now.getFullYear() + 543;
      const nowHour = now.getHours().toString().padStart(2, "0");
      const nowMinute = now.getMinutes().toString().padStart(2, "0");
      const nowSecond = now.getSeconds().toString().padStart(2, "0");

      const nowThaiFormat = `${nowDate}/${nowMonth}/${nowYear} ${nowHour}:${nowMinute}:${nowSecond}`;

      // บันทึกข้อมูลการเช็คอิน
      const scoreRef = doc(
        db,
        `classroom/${cid}/checkin/${cno}/scores`,
        currentUser.uid
      );
      await setDoc(scoreRef, {
        date: nowThaiFormat,
        name: userData?.displayName || currentUser.email,
        uid: currentUser.uid,
        remark: userData?.remark || "",
        score: status === 1 ? 1 : 0.5, // มาปกติได้ 1 คะแนน, มาสายได้ 0.5 คะแนน
        status: status,
      });

      console.log("checkinData:", checkinData);
      console.log(
        "calculateLateTime:",
        checkinData && checkinData.date
          ? calculateLateTime(checkinData.date)
          : "ไม่มีข้อมูล"
      );

      // โหลดข้อมูลใหม่
      loadCheckinData();
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  // ฟังก์ชันสำหรับอาจารย์ในการอัปเดตสถานะนักเรียน
  // ฟังก์ชันสำหรับอัปเดตสถานะนักเรียน (ใช้ได้ทั้งอาจารย์และระบบ)
  const updateStudentStatus = async (studentId, newStatus) => {
    try {
      // ถ้าไม่ใช่อาจารย์และไม่ได้เรียกจากระบบ ให้ออกจากฟังก์ชัน
      if (!isTeacher && studentId !== currentUser?.uid) return;

      const scoreRef = doc(
        db,
        `classroom/${cid}/checkin/${cno}/scores`,
        studentId
      );
      const scoreDoc = await getDoc(scoreRef);

      if (scoreDoc.exists()) {
        await updateDoc(scoreRef, {
          status: newStatus,
          score: newStatus === 1 ? 1 : newStatus === 2 ? 0.5 : 0,
        });
      } else {
        // ถ้ายังไม่มีข้อมูลให้สร้างใหม่
        const now = new Date();
        const nowDate = now.getDate().toString().padStart(2, "0");
        const nowMonth = (now.getMonth() + 1).toString().padStart(2, "0");
        const nowYear = now.getFullYear() + 543;
        const nowHour = now.getHours().toString().padStart(2, "0");
        const nowMinute = now.getMinutes().toString().padStart(2, "0");
        const nowSecond = now.getSeconds().toString().padStart(2, "0");

        const nowThaiFormat = `${nowDate}/${nowMonth}/${nowYear} ${nowHour}:${nowMinute}:${nowSecond}`;

        await setDoc(scoreRef, {
          date: nowThaiFormat,
          status: newStatus,
          score: newStatus === 1 ? 1 : newStatus === 2 ? 0.5 : 0,
          uid: studentId,
        });
      }

      // โหลดข้อมูลใหม่
      loadCheckinData();
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  // เพิ่มฟังก์ชัน calculateLateTime ตรงส่วนต้นของ component
  const calculateLateTime = (dateString) => {
    try {
      // แปลง string วันที่ไทย (28/02/2568 18:20:14) เป็น Date object
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, buddhistYear] = datePart.split("/");
      const gregorianYear = parseInt(buddhistYear) - 543; // แปลงปี พ.ศ. เป็น ค.ศ.

      const [hours, minutes, seconds] = timePart.split(":");

      // สร้าง Date object
      const originalDate = new Date(
        gregorianYear,
        month - 1,
        day,
        hours,
        minutes,
        seconds
      );

      // เพิ่ม 15 นาที
      const lateTime = new Date(originalDate.getTime() + 15 * 60 * 1000);

      // แปลงกลับเป็นรูปแบบเดิม
      const buddhistLateYear = lateTime.getFullYear() + 543;
      const formattedDate =
        `${String(lateTime.getDate()).padStart(2, "0")}/${String(
          lateTime.getMonth() + 1
        ).padStart(2, "0")}/${buddhistLateYear} ` +
        `${String(lateTime.getHours()).padStart(2, "0")}:${String(
          lateTime.getMinutes()
        ).padStart(2, "0")}:${String(lateTime.getSeconds()).padStart(2, "0")}`;

      return formattedDate;
    } catch (error) {
      console.error("Error calculating late time:", error);
      return "ไม่สามารถคำนวณได้";
    }
  };

  // แสดงสถานะในรูปแบบที่อ่านง่าย
  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return <Chip label="ไม่มา" color="error" />;
      case 1:
        return <Chip label="มาเรียน" color="success" />;
      case 2:
        return <Chip label="มาสาย" color="warning" />;
      default:
        return <Chip label="ไม่ระบุ" color="default" />;
    }
  };
  // โหลดข้อมูลนักเรียนทั้งหมดใน classroom
const loadClassroomStudents = () => {
  return new Promise((resolve) => {
    const studentsRef = collection(db, `classroom/${cid}/students`);
    const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      resolve(students);
    });
    
    // เก็บฟังก์ชัน unsubscribe ไว้ใน useEffect เพื่อทำความสะอาด
    return unsubscribe;
  });
};

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // หากยังไม่มีข้อมูลการเช็คชื่อ
  if (!checkinData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          ไม่พบข้อมูลการเช็คชื่อ
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        การเช็คชื่อครั้งที่ {cno}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          สร้างเมื่อ:{" "}
          {checkinData && checkinData.date ? checkinData.date : "ไม่มีข้อมูล"}
        </Typography>
        <Typography variant="body1">
          เวลาที่หมดเขต (จะถือว่ามาสาย):{" "}
          {checkinData && checkinData.date
            ? calculateLateTime(checkinData.date)
            : "ไม่มีข้อมูล"}
        </Typography>
      </Box>

      {/* ตารางแสดงข้อมูลนักเรียน */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ลำดับ</TableCell>
              <TableCell>รหัสนักศึกษา</TableCell>
              <TableCell>ชื่อ-นามสกุล</TableCell>
              <TableCell>เวลาเช็คชื่อ</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>คะแนน</TableCell>
              {isTeacher && <TableCell>การจัดการ</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.date}</TableCell>
                  <TableCell>{renderStatus(student.status)}</TableCell>
                  <TableCell>{student.score}</TableCell>
                  {isTeacher && (
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => updateStudentStatus(student.id, 1)}
                        >
                          มาเรียน
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => updateStudentStatus(student.id, 2)}
                        >
                          มาสาย
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => updateStudentStatus(student.id, 0)}
                        >
                          ไม่มา
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isTeacher ? 7 : 6} align="center">
                  ยังไม่มีนักเรียนเช็คชื่อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CheckInManagement;
