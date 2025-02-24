import React, { useState } from 'react';
import { Button, TextField, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase'; // สมมุติว่าคุณได้ตั้งค่าการเชื่อมต่อกับ Firestore แล้ว
import { collection, addDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';


const CreateCheckIn = () => {
    const { cid } = useParams();  // รับ classroom ID จาก URL
    const navigate = useNavigate();
    
    // สร้าง state สำหรับการจัดการฟอร์ม
    const [code, setCode] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState(''); // เปลี่ยนจาก 0 เป็นค่าว่างเพื่อรองรับ dropdown
    
    // ฟังก์ชันสำหรับบันทึกข้อมูลการเช็คชื่อลง Firestore
    const handleSubmit = async () => {
      try {
        // สร้างเอกสารใหม่ในคอลเล็กชัน checkin ของห้องเรียน
        const checkInRef = collection(db, `classroom/${cid}/checkin`);
        await addDoc(checkInRef, {
          code,
          date,
          status,
        });
         
        // หลังจากบันทึกเสร็จแล้ว นำผู้ใช้กลับไปที่หน้า ClassroomManagement
        navigate(`/classroommanagement/${cid}`);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    };
    
  
    return (
      <Box className="container mt-5">
        <h2 className="text-center mb-4">สร้างการเช็คชื่อสำหรับห้องเรียน {cid}</h2>
  
        {/* ฟอร์มกรอกข้อมูลการเช็คชื่อ */}
        <div className="mb-3">
          <TextField
            label="รหัสเช็คชื่อ"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            margin="normal"
            className="form-control"
          />
        </div>
        
        <div className="mb-3">
          <TextField
            label="วันเวลา"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            className="form-control"
          />
        </div>
        
        <div className="mb-3">
          {/* Dropdown สำหรับเลือกสถานะการเช็คชื่อ */}
          <FormControl fullWidth margin="normal" className="form-control">
            <InputLabel id="status-label">สถานะการเช็คชื่อ</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="สถานะการเช็คชื่อ"
            >
              <MenuItem value={0}>ยังไม่เริ่ม</MenuItem>
              <MenuItem value={1}>กำลังเช็คชื่อ</MenuItem>
              <MenuItem value={2}>เสร็จแล้ว</MenuItem>
            </Select>
          </FormControl>
        </div>
  
        {/* ปุ่มบันทึกข้อมูล */}
        <div className="d-grid gap-2">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            บันทึกการเช็คชื่อ
          </Button>
        </div>
      </Box>
    );
};

export default CreateCheckIn;
