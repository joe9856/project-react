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
  

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        ยินดีต้อนรับ, {user ? user.displayName : "ผู้ใช้"}
      </Typography>

      <Typography variant="h6" gutterBottom>
        ข้อมูลห้องเรียนทั้งหมด
      </Typography>

      <button type="button" onClick={handleGoToAddClassroom} className="btn btn-outline-secondary w-20">
        เพิ่มวิชา
      </button>

      {classrooms.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {classrooms.map((classroom) => (
            <Grid item xs={12} sm={6} md={4} key={classroom.id}>
              <Card
                sx={{
                  maxWidth: 345,
                  boxShadow: 3,
                  borderRadius: 2,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
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

                  {/* เพิ่มปุ่ม "เพิ่มนักเรียน" */}
                  <Box sx={{ marginTop: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleGoToAddStudent(classroom.id)}
                    >
                      เพิ่มนักเรียน
                    </Button>
                  </Box>
                  {/* เพิ่มปุ่ม "เช็คชื่อ" */}
                  <Box sx={{ marginTop: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleGoToCreateCheckInTeacher(classroom.id)} // ใช้ชื่อฟังก์ชันใหม่
                  >
                    สร้างเช็คชื่อ
                  </Button>
                  </Box>

                  {/* เพิ่มปุ่ม "เช็คชื่อ" */}
                  <Box sx={{ marginTop: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleShowCheckInTeacher(classroom.id)} // ใช้ชื่อฟังก์ชันใหม่
                  >
                    ดูผลการเช็คชื่อ
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
