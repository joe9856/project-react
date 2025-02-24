import { useNavigate } from "react-router-dom";
import ClassroomInfo from "./ClassroomInfo";

function Profile() {
  const navigate = useNavigate();
  
  return (
    <div>
      {userDetails ? (
        <>
          <img src={userDetails.photo} width={"40%"} style={{ borderRadius: "50%" }} />
          <h3>Welcome {userDetails.firstName} 🙏🙏</h3>
          <p>Email: {userDetails.email}</p>
          <button onClick={() => navigate("/edit-profile")}>Edit Profile</button> {/* ปุ่มไปหน้าแก้ไข */}
        </>
      ) : (
        <p>Loading...</p>
      )}

      <ClassroomInfo/>
    </div>
  );
}
