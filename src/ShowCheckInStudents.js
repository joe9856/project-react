import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from './firebase'; // เชื่อมต่อกับ Firestore
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const ShowCheckInStudents = () => {
    const { cid, cno } = useParams();  // รับ classroom ID และ checkin number จาก URL
    const [students, setStudents] = useState([]);

    // ดึงข้อมูลนักเรียนที่เช็คชื่อจาก Firestore
    const fetchStudents = async () => {
        const checkinRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
        const checkinSnap = await getDocs(checkinRef);

        const studentsList = [];
        for (const docSnapshot of checkinSnap.docs) {
            const studentData = docSnapshot.data();
            const studentDocRef = doc(db, `classroom/${cid}/students`, docSnapshot.id);
            const studentDoc = await getDoc(studentDocRef);
            if (studentDoc.exists()) {
                const student = studentDoc.data();
                studentsList.push({
                    id: docSnapshot.id,
                    std_id: student.std_id,
                    name: student.name,
                    photo: student.photo,  // รูปภาพของนักเรียน (ถ้ามี)
                    status: studentData.status,  // สถานะการเช็คชื่อ
                });
            }
        }
        setStudents(studentsList);
    };

    // ใช้ useEffect เพื่อดึงข้อมูลเมื่อคอมโพเนนต์ถูกเรนเดอร์
    useEffect(() => {
        fetchStudents();
    }, [cid, cno]);

    return (
        <Box className="container mt-5">
            <Typography variant="h4" className="text-center mb-4">รายชื่อนักเรียนที่เข้ามาเช็คชื่อในห้องเรียน {cid}</Typography>
            
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ลำดับ</TableCell>
                            <TableCell>รหัสนักเรียน</TableCell>
                            <TableCell>ชื่อนักเรียน</TableCell>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>สถานะการเช็คชื่อ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.std_id}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>
                                    {student.photo ? (
                                        <img src={student.photo} alt={student.name} width="50" height="50" />
                                    ) : (
                                        <span>ไม่มีรูปภาพ</span>
                                    )}
                                </TableCell>
                                <TableCell>{student.status === 1 ? 'เช็คชื่อแล้ว' : 'ยังไม่ได้เช็คชื่อ'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box className="mt-4" textAlign="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.history.back()} // กลับไปยังหน้าก่อนหน้า
                >
                    กลับ
                </Button>
            </Box>
        </Box>
    );
};

export default ShowCheckInStudents;
