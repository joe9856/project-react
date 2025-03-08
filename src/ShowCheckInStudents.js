import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

const ShowCheckInStudents = () => {
    const { cid, cno } = useParams();  
    console.log('Classroom ID:', cid); 
    console.log('Check-in ID:', cno); 
    const [students, setStudents] = useState([]);  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ฟังก์ชันดึงข้อมูลนักเรียนที่เช็คชื่อในแต่ละรอบในแบบเรียลไทม์
    useEffect(() => {
        const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
        
        const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
            if (!snapshot.empty) {
                const studentsList = snapshot.docs.map(doc => doc.data());
                setStudents(studentsList);
                setError(null);
            } else {
                setStudents([]);
                setError('ไม่พบข้อมูลนักเรียนในรอบนี้');
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching students data:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน');
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [cid, cno]);

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
                <Typography variant="body1" align="center" color="error">{error}</Typography>
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
                    <Typography variant="body1" align="center">ไม่พบข้อมูลนักเรียนในรอบนี้</Typography>
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