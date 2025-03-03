import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from './firebase'; // Import การเชื่อมต่อกับ Firestore
import { collection, getDocs } from 'firebase/firestore';

const ShowCheckInStudents = () => {
    const { cid, cno } = useParams();  // ดึง classroom ID และ checkin ID จาก URL params
    console.log('Classroom ID:', cid); // ตรวจสอบค่า cid
    console.log('Check-in ID:', cno); // ตรวจสอบค่า cno
    const [students, setStudents] = useState([]);  // เปลี่ยนเป็น array เพื่อเก็บข้อมูลนักเรียนหลายคน
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // เพิ่มสถานะสำหรับการจัดการข้อผิดพลาด

    // ฟังก์ชันดึงข้อมูลนักเรียนที่เช็คชื่อในแต่ละรอบ
    const fetchCheckInStudents = async () => {
        try {
            // ดึงข้อมูลจาก collection ของ students ที่เช็คชื่อในรอบนี้
            const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
            const studentSnap = await getDocs(studentsRef);

            // ตรวจสอบว่าได้ข้อมูลมาหรือไม่
            if (!studentSnap.empty) {
                // แปลงข้อมูลที่ได้เป็น array
                const studentsList = studentSnap.docs.map(doc => doc.data());
                setStudents(studentsList);
                setError(null);  // ล้างข้อผิดพลาดหากดึงข้อมูลสำเร็จ
            } else {
                setStudents([]);  // หากไม่มีข้อมูลนักเรียน
                setError('ไม่พบข้อมูลนักเรียนในรอบนี้');
            }
            
        } catch (error) {
            console.error('Error fetching students data:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckInStudents();
    }, [cid, cno]);  // เพิ่ม cid และ cno ใน dependencies ของ useEffect

    return (
        <Box mt={5} p={2}>
            <Typography variant="h4" textAlign="center" mb={4}>
                รายชื่อนักเรียนที่เช็คชื่อในห้องเรียน {cid}
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography variant="body1" align="center" color="error">{error}</Typography> // แสดงข้อผิดพลาดหากมี
            ) : (
                students.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ลำดับการเช็คชื่อ</TableCell>
                                    <TableCell>รหัสนักเรียน</TableCell>
                                    <TableCell>ชื่อนักเรียน</TableCell>
                                    <TableCell>เวลาที่เข้ามาเช็คชื่อ</TableCell>
                                    
                                </TableRow>
                            </TableHead>    
                            <TableBody>
                                {students.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell> 
                                        <TableCell>{student.stdid}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" align="center">ไม่พบข้อมูลนักเรียนในรอบนี้</Typography>  // กรณีที่ไม่มีนักเรียน
                )
            )}
            <Box mt={4} textAlign="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.history.back()}
                >
                    กลับ
                </Button>
            </Box>
        </Box>
    );
};

export default ShowCheckInStudents;
