import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import EditProfile from './EditProfile'; // นำเข้า EditProfile คอมโพเนนต์
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./Home";
import ClassroomList from "./ClassroomList";
import Navbar from "./Navbar";  // นำเข้า Navbar
import Register from './Register'; // นำเข้า Register
import AddClassroom from "./AddClassroom";
import AddStudent from './AddStudent';  // หากไฟล์ AddStudent.js อยู่ในโฟลเดอร์เดียวกัน
import CreateCheckIn from './CreateCheckIn';
import ShowCheckIn from './ShowCheckIn';
import ShowCheckInStudents from './ShowCheckInStudents'; // นำเข้า ShowCheckInStudents
import ClassroomManagement from './ClassroomManagement';  // นำเข้า ClassroomManagement    
function App() {
  return (
    <Router>
      <Navbar /> {/* แสดง Navbar */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/classrooms" element={<ClassroomList />} />
        <Route path="/register" element={<Register />} /> {/* เพิ่มเส้นทางสำหรับ Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/addclassroom" element={<AddClassroom />} />
        <Route path="/addstudent/:cid" element={<AddStudent />} />  {/* เพิ่มเส้นทางสำหรับ AddStudent */}
        <Route path="/createcheckin/:cid" element={<CreateCheckIn />} /> 
        <Route path="/showcheckin/:cid" element={<ShowCheckIn />} />
        <Route path="/showcheckinstudents/:cid" element={<ShowCheckInStudents />} /> {/* หน้า ShowCheckInStudents */}
        <Route path="/classroommanagement/:cid" element={<ClassroomManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
