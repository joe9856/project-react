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
import ShowDetailClassroom from './ShowDetailClassroom'; 
import CheckInManagement from './CheckInManagement'; 
import CreateQuestion from './CreateQuestion'; 
import QuestionAnswers from './QuestionAnswers'; // ปรับเส้นทางตามโครงสร้างไฟล์ของคุณ
import EditClassroom from './EditClassroom'; 

// เพิ่มในส่วนของการกำหนดเส


function App() {
  return (
    <Router basename="/project-react">
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
        <Route path="/showcheckinstudents/:cid/checkin/:cno" element={<ShowCheckInStudents />} /> {/* แก้ไขเป็น element */}
        <Route path="/classroommanagement/:cid" element={<ClassroomManagement />} />
        <Route path="/showdetail/:cid" element={<ShowDetailClassroom />} />
        <Route path="/checkinmanagement/:cid/checkin/:cno" element={<CheckInManagement />} />
        <Route path="/question/:cid/checkin/:cno" element={<CreateQuestion />} />
        <Route path="/questionAnswers/:cid/checkin/:checkInId/answers" element={<QuestionAnswers />} />
        <Route path="/classroom/:cid/edit" element={<EditClassroom />} />

      
      </Routes>
    </Router>
  );
}

export default App;
