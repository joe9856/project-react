import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase'; // เชื่อมต่อกับ Firestore
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ShowCheckIn = () => {
    const { cid } = useParams();  // รับ classroom ID จาก URL
    const navigate = useNavigate();

    const [checkIns, setCheckIns] = useState([]);

    // ดึงข้อมูลการเช็คชื่อจาก Firestore
    const fetchCheckIns = async () => {
        const checkInRef = collection(db, `classroom/${cid}/checkin`);
        const checkInSnap = await getDocs(checkInRef);
        const checkInList = checkInSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCheckIns(checkInList);
    };

    // ฟังก์ชันเพื่ออัปเดตสถานะการเช็คชื่อเป็น "เสร็จแล้ว"
    const endCheckIn = async (checkInId) => {
        const checkInRef = doc(db, `classroom/${cid}/checkin`, checkInId);
        await updateDoc(checkInRef, {
            status: 2, // เปลี่ยนสถานะเป็น "เสร็จแล้ว"
        });
        fetchCheckIns(); // รีเฟรชข้อมูลหลังจากการอัปเดต
    };

    // ใช้ useEffect เพื่อดึงข้อมูลเมื่อคอมโพเนนต์ถูกเรนเดอร์
    useEffect(() => {
        fetchCheckIns();
    }, [cid]);

    return (
        <Box className="container mt-5">
            <Typography variant="h4" className="text-center mb-4">รายการการเช็คชื่อสำหรับห้องเรียน {cid}</Typography>
            
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>รหัสเช็คชื่อ</TableCell>
                            <TableCell>วันเวลา</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>การกระทำ</TableCell> {/* เพิ่มคอลัมน์การกระทำ */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checkIns.map((checkIn) => (
                            <TableRow key={checkIn.id}>
                                <TableCell>{checkIn.code}</TableCell>
                                <TableCell>{new Date(checkIn.date).toLocaleString()}</TableCell>
                                <TableCell>
                                    {checkIn.status === 0 && 'ยังไม่เริ่ม'}
                                    {checkIn.status === 1 && 'กำลังเช็คชื่อ'}
                                    {checkIn.status === 2 && 'เสร็จแล้ว'}
                                </TableCell>
                                <TableCell>
                                    {checkIn.status === 1 && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => endCheckIn(checkIn.id)} // เรียกใช้ฟังก์ชัน endCheckIn
                                        >
                                            เสร็จสิ้นการเช็คชื่อ
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box className="mt-4" textAlign="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/createcheckin/${cid}`)}
                >
                    สร้างการเช็คชื่อ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/showcheckinstudents/${cid}`)} // ลิงค์ไปยังหน้ารายชื่อนักเรียน
                    style={{ marginLeft: '10px' }}
                >
                    ดูรายชื่อนักเรียนที่เข้ามาเช็คชื่อ
                </Button>
            </Box>
        </Box>
    );
};

export default ShowCheckIn;



// การอธิบาย:
// ฟังก์ชัน endCheckIn: ฟังก์ชันนี้จะอัปเดตสถานะของการเช็คชื่อใน Firestore โดยใช้ updateDoc
//  เพื่อเปลี่ยนสถานะการเช็คชื่อจาก "กำลังเช็คชื่อ" (สถานะ 1) เป็น "เสร็จแล้ว" (สถานะ 2).