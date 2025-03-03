import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardMedia, Grid, Typography, Box, CircularProgress, Button } from "@mui/material";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/login");
      }
    });

    const fetchClassrooms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "classroom"));
        const classroomsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClassrooms(classroomsData);
      } catch (error) {
        console.error("Error getting documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleGoToAddClassroom = () => {
    navigate('/addclassroom');
  };

  const handleGoToAddStudent = (classroomId) => {
    navigate(`/addstudent/${classroomId}`);
  };

  const handleGoToCreateCheckInTeacher = (classroomId) => {
    navigate(`/createcheckin/${classroomId}`); // เชื่อมโยงไปยังหน้าการเช็คชื่อ
  };

  const handleShowCheckInTeacher = (classroomId) => {
    navigate(`/showcheckin/${classroomId}`); // เชื่อมโยงไปยังหน้าการเช็คชื่อ
  };

  const handleShowDetail = (classroomId) => {
    navigate(`/showdetail/${classroomId}`); // เชื่อมโยงไปยังหน้าการเช็คชื่อ
  };

  // สมมติให้มีค่า cno แบบ static หรือมาจากการเลือกของผู้ใช้
const goToCreateQuestion = (cid, cno) => {
  navigate(`/question/${cid}/checkin/${cno}`);
};
  

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      
      <Box
        sx={{
          border: "2px solid #1976d2", // กรอบสีฟ้า
          borderRadius: "12px", // มุมโค้งมน
          padding: "8px", // ระยะห่างภายในกรอบ
          boxShadow: 2, // เงา
          maxWidth: "40%", // กำหนดความกว้างสูงสุด
          margin: "0 auto", // จัดตำแหน่งกลาง
          textAlign: "center", // จัดข้อความให้อยู่กลาง
        }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontSize: "30px" }}>
          ยินดีต้อนรับ, {user ? user.displayName : "ผู้ใช้"}
        </Typography>
      </Box>

  
      <Box sx={{ border: "2px solidrgb(226, 226, 226)", borderRadius: "8px", padding: "8px", maxWidth: "300px", margin: "20px 0", boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom align="center" color="textPrimary">
          ข้อมูลห้องเรียนทั้งหมด
        </Typography>
      </Box>
  
      {/* ปุ่มเพิ่มวิชา */}
      <Box sx={{ textAlign: "center", marginBottom: 4 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleGoToAddClassroom}
          sx={{
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: 2,
            boxShadow: 2,
            "&:hover": { backgroundColor: "#388e3c" }, // สีเขียวเข้มเมื่อ hover
          }}
        >
          + เพิ่มวิชา
        </Button>
      </Box>
  
      {classrooms.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {classrooms.map((classroom) => (
            <Grid item xs={12} sm={6} md={3} key={classroom.id}>
              <Card
                sx={{
                  maxWidth: 345,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  alt={classroom.info?.name}
                  height="140"
                  image={classroom.info?.photo || "https://via.placeholder.com/150"}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                    {classroom.info?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                    รหัสวิชา: {classroom.info?.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ห้องเรียน: {classroom.info?.room}
                  </Typography>
  
                  {/* ปุ่มทั้งหมดถูกจัดเรียงให้สวยขึ้น */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, marginTop: 2 }}>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => handleShowDetail(classroom.id)}
                      sx={{
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#0288d1" },
                      }}
                    >
                      ℹ️ ดูรายละเอียดวิชา
                    </Button>
  
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => goToCreateQuestion(classroom.id, 1)}
                      sx={{
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#6d1b7b" },
                      }}
                    >
                      ✍️ เพิ่มคำถาม
                    </Button>
  
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleGoToCreateCheckInTeacher(classroom.id)}
                      sx={{
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#f57c00" },
                      }}
                    >
                      ✅ สร้างเช็คชื่อ
                    </Button>
  
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleShowCheckInTeacher(classroom.id)}
                      sx={{
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#d32f2f" },
                      }}
                    >
                      📊 ดูผลการเช็คชื่อ
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", marginTop: 4 }}>
          <Typography variant="h6" color="text.secondary">
            ไม่พบข้อมูลห้องเรียน
          </Typography>
        </Box>
      )}
    </div>
  );
  
}

export default Home;
