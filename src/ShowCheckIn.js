import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase'; // เชื่อมต่อกับ Firestore
import { collection, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { Paper, Chip } from '@mui/material';


const ShowCheckIn = () => {
    const { cid } = useParams();  // รับ classroom ID จาก URL
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [checkIns, setCheckIns] = useState([]);
    const [checkInCounts, setCheckInCounts] = useState({});
    const [classroomName, setClassroomName] = useState(''); // เพิ่มสถานะเพื่อเก็บชื่อห้องเรียน

    // ฟังก์ชันดึงข้อมูลชื่อห้องเรียนจาก Firestore
    const fetchClassroomName = async () => {
        try {
            const classroomDocRef = doc(db, `classroom/${cid}`);
            const classroomDocSnapshot = await getDoc(classroomDocRef);
            if (classroomDocSnapshot.exists()) {
                const data = classroomDocSnapshot.data();
                setClassroomName(data.info?.name || ''); // ปรับให้ตรงกับโครงสร้างของ Firestore
            }
        } catch (error) {
            console.error('Error fetching classroom name:', error);
        }
    };

    // ฟังก์ชันดึงข้อมูลการเช็คชื่อจาก Firestore
    const fetchCheckIns = async () => {
        const checkInRef = collection(db, `classroom/${cid}/checkin`);
        const checkInSnap = await getDocs(checkInRef);
        const checkInList = checkInSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCheckIns(checkInList);

        const countPromises = checkInList.map(async (checkIn) => {
            const studentRef = collection(db, `classroom/${cid}/checkin/${checkIn.id}/students`);
            const studentSnap = await getDocs(studentRef);
            return { [checkIn.id]: studentSnap.size };
        });

        const countResults = await Promise.all(countPromises);
        const counts = Object.assign({}, ...countResults);
        setCheckInCounts(counts);
    };

    useEffect(() => {
        fetchCheckIns();
        fetchClassroomName(); // เรียกใช้ fetchClassroomName เพื่อดึงข้อมูลชื่อห้องเรียน
    }, [cid]);

    const endCheckIn = async (checkInId, cid) => {
        if (!checkInId || !cid) {
            console.error("Error: checkInId หรือ cid เป็นค่าว่าง", { checkInId, cid });
            alert("ไม่สามารถสิ้นสุดการเช็คชื่อได้ เนื่องจากข้อมูลไม่ครบถ้วน");
            return;
        }

        setIsProcessing(true);

        try {
            const studentsRef = collection(db, `classroom/${cid}/checkin/${checkInId}/students`);
            const studentsSnapshot = await getDocs(studentsRef);

            const studentsList = studentsSnapshot.docs.map(doc => {
                const data = doc.data();
                const stdid = doc.id;
                return { ...data, stdid };
            });

            const now = new Date();
            const nowThaiFormat = formatThaiDateTime(now);

            function formatThaiDateTime(date) {
                if (!date || !(date instanceof Date)) {
                    return "";
                }
                
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear() + 543;
                const hour = date.getHours().toString().padStart(2, '0');
                const minute = date.getMinutes().toString().padStart(2, '0');
                const second = date.getSeconds().toString().padStart(2, '0');
                
                return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
            }

            for (const student of studentsList) {
                const studentScoreRef = doc(db, `classroom/${cid}/checkin/${checkInId}/scores/${student.stdid}`);
                
                let studentDate = nowThaiFormat;
                
                if (student.timestamp && typeof student.timestamp.toDate === 'function') {
                    studentDate = formatThaiDateTime(student.timestamp.toDate());
                } else if (student.timestamp instanceof Date) {
                    studentDate = formatThaiDateTime(student.timestamp);
                } else if (student.date) {
                    studentDate = student.date;
                }
                
                await setDoc(studentScoreRef, {
                    name: student.name,
                    stdid: student.stdid,
                    date: studentDate,
                    status: 1,
                    score: 1,
                    remark: student.remark || ''
                });
            }
            
            const checkInRef = doc(db, `classroom/${cid}/checkin`, checkInId);
            await updateDoc(checkInRef, {
                status: 2,
            });
    
            alert('การเช็คชื่อเสร็จสิ้นเรียบร้อยแล้ว');
            
            fetchCheckIns();
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการจบการเช็คชื่อ:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };
    // เพิ่มฟังก์ชันนี้ใน ShowCheckIn
    const viewAnswers = (checkInId) => {
        // นำทางไปยังหน้าแสดงคำตอบพร้อมส่งค่า checkInId และ cid
        navigate(`/classroom/${cid}/checkin/${checkInId}/answers`);
    };

    return (
        <Box className="container mt-5">
            <Typography variant="h4" className="text-center mb-4">รายการการเช็คชื่อสำหรับห้องเรียน {classroomName ? classroomName : 'Loading...'}</Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2, p: 2, borderRadius: 2, boxShadow: 3 }}>
    <Table>
        <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>รหัสเช็คชื่อ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>วันเวลา</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>สถานะ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>จำนวนคนที่เช็คชื่อ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>การกระทำ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>รายชื่อ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>คะแนน</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>คำตอบ-คำถาม</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {checkIns.map((checkIn) => (
                <TableRow key={checkIn.id} hover>
                    <TableCell>{checkIn.code}</TableCell>
                    <TableCell>{new Date(checkIn.date).toLocaleString()}</TableCell>
                    <TableCell>
                        {checkIn.status === 0 && <Chip label="ยังไม่เริ่ม" color="default" />}
                        {checkIn.status === 1 && <Chip label="กำลังเช็คชื่อ" color="warning" />}
                        {checkIn.status === 2 && <Chip label="เสร็จแล้ว" color="success" />}
                    </TableCell>
                    <TableCell>
                        {checkIn.status === 2 && (
                            <Typography variant="body1" fontWeight="bold">{checkInCounts[checkIn.id]} คน</Typography>
                        )}
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            {checkIn.status === 1 && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => endCheckIn(checkIn.id, cid)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'กำลังประมวลผล...' : 'เสร็จสิ้นการเช็คชื่อ'}
                                </Button>
                            )}
                           
                    
                        </Box>
                    </TableCell>
                    <TableCell>
                    <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/showcheckinstudents/${cid}/checkin/${checkIn.id}`)}
                            >
                                ดูรายชื่อ
                            </Button>

                    </TableCell>
                    <TableCell>
                    <Button
                                variant="contained"
                                color="warning"
                                onClick={() => navigate(`/checkinmanagement/${cid}/checkin/${checkIn.id}`)}
                            >
                                ดูคะแนน
                            </Button>
                    </TableCell>
                    <TableCell>
                    <Button 
                        variant="contained"
                        className="btn btn-primary"
                        color="info"
                        onClick={() => viewAnswers(checkIn.id)}
                    >
                        <i className="fas fa-comments me-1"></i> ดูคำถาม-คำตอบ
                    </Button>
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
            </Box>
        </Box>
    );
};

export default ShowCheckIn;
