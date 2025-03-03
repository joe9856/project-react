import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase'; // Assume your firebase setup is done correctly
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore'; // add getDoc for fetching single doc
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateCheckIn = () => {
    const { cid } = useParams();  // Get classroom ID from URL
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');
    const [cno, setCno] = useState(1);
    const [classroomName, setClassroomName] = useState('');

    useEffect(() => {
        const fetchCno = async () => {
            try {
                const checkInRef = collection(db, `classroom/${cid}/checkin`);
                const querySnapshot = await getDocs(checkInRef);
                setCno(querySnapshot.size + 1);
            } catch (error) {
                console.error("Error fetching cno: ", error);
            }
        };
        fetchCno();
    }, [cid]);

    useEffect(() => {
        const fetchClassroomName = async () => {
            try {
                const classroomDocRef = doc(db, `classroom/${cid}`);
                const classroomDocSnapshot = await getDoc(classroomDocRef);
                if (classroomDocSnapshot.exists()) {
                    const data = classroomDocSnapshot.data();
                    setClassroomName(data.info?.name || ''); // Adjust path as necessary
                }
            } catch (error) {
                console.error('Error fetching classroom name:', error);
            }
        };
        fetchClassroomName();
    }, [cid]);

    const handleSubmit = async () => {
        try {
            const checkInRef = doc(db, `classroom/${cid}/checkin`, `${cno}`);
            const now = new Date();
            now.setHours(now.getHours() + 7);
            const localISOTime = now.toISOString().slice(0, 16).replace('T', ' ');
            await setDoc(checkInRef, {
                code,
                localISOTime,
                status,
            });
            navigate(`/classroommanagement/${cid}`);
        } catch (e) {
            console.error('Error adding document: ', e);
        }
    };

    return (
        <Box className="container mt-5" display="flex" justifyContent="center">
          <Card sx={{ width: 700, minHeight: 600, boxShadow: 4, borderRadius: 4, p: 3 }}>
            <CardContent>
              <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                📌 สร้างการเช็คชื่อสำหรับห้องเรียน{" "}
                <span style={{ color: "#1976d2" }}>{classroomName ? classroomName : "Loading..."}</span>
              </Typography>
      
              <TextField
                label="รหัสเช็คชื่อ"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{ sx: { fontSize: 20, p: 1.5 } }}
                InputLabelProps={{ sx: { fontSize: 18 } }}
              />
      
              <TextField
                label="วันเวลา"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true, sx: { fontSize: 18 } }}
                InputProps={{ sx: { fontSize: 20, p: 1.5 } }}
              />
      
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="status-label" sx={{ fontSize: 18 }}>สถานะการเช็คชื่อ</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="สถานะการเช็คชื่อ"
                  sx={{ fontSize: 20, p: 1.5 }}
                >
                  <MenuItem value={0}>⏳ ยังไม่เริ่ม</MenuItem>
                  <MenuItem value={1}>✅ กำลังเช็คชื่อ</MenuItem>
                  <MenuItem value={2}>✔️ เสร็จแล้ว</MenuItem>
                </Select>
              </FormControl>
      
              <Box mt={3} display="flex" justifyContent="center">
                <Button variant="contained" color="primary" size="large" onClick={handleSubmit} sx={{ fontSize: 20, borderRadius: 4, p: 2, width: "100%" }}>
                  💾 บันทึกการเช็คชื่อ
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
};

export default CreateCheckIn;