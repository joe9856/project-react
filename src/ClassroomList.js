import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

function ClassroomList() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user logged in");
        setLoading(false);
        return;
      }

      const uid = user.uid;
      const userClassroomRef = doc(db, `users/${uid}/classroom/classroom_id`); // Replace with actual CID

      try {
        const docSnap = await getDoc(userClassroomRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserStatus(userData.status);
        } else {
          console.error("User status not found");
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchUserStatus();
  }, []);

  useEffect(() => {
    if (userStatus === 1) {
      const q = query(collection(db, "classroom"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const classroomsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClassrooms(classroomsData);
        setLoading(false);
      }, (error) => {
          console.error("Error getting documents in real-time:", error);
          setLoading(false); 
      });
      
      // Clean up subscription on unmount
      return () => unsubscribe();
    } else {
      setLoading(false); 
    }
  }, [userStatus]);

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
        รายการห้องเรียนทั้งหมด
      </Typography>

      {userStatus !== 1 ? (
        <Box sx={{ textAlign: "center", marginTop: 4 }}>
          <Typography variant="h6" color="text.secondary">
            คุณไม่มีสิทธิ์เข้าถึงห้องเรียน
          </Typography>
        </Box>
      ) : classrooms.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {classrooms.map((classroom) => (
            <Grid item xs={12} sm={6} md={4} key={classroom.id}>
              <Card
                sx={{
                  maxWidth: 345,
                  boxShadow: 3,
                  borderRadius: 2,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardMedia
                  component="img"
                  alt={classroom.info?.name}
                  height="140"
                  image={
                    classroom.info?.photo || "https://via.placeholder.com/150"
                  }
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {classroom.info?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    รหัสวิชา: {classroom.info?.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ห้องเรียน: {classroom.info?.room}
                  </Typography>

                  <Box sx={{ marginTop: 2 }}>
                    <Link
                      to={`/addstudent/${classroom.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="contained" color="primary">
                        เพิ่มนักเรียน
                      </Button>
                    </Link>
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

export default ClassroomList;