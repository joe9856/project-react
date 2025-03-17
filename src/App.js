import './App.css';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import EditProfile from './EditProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home';
import ClassroomList from './ClassroomList';
import Navbar from './Navbar';
import Register from './Register';
import AddClassroom from './AddClassroom';
import AddStudent from './AddStudent';
import CreateCheckIn from './CreateCheckIn';
import ShowCheckIn from './ShowCheckIn';
import ShowCheckInStudents from './ShowCheckInStudents';
import ClassroomManagement from './ClassroomManagement';
import ShowDetailClassroom from './ShowDetailClassroom';
import CheckInManagement from './CheckInManagement';
import CreateQuestion from './CreateQuestion';
import QuestionAnswers from './QuestionAnswers';
import EditClassroom from './EditClassroom';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/classrooms" element={<ClassroomList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/addclassroom" element={<AddClassroom />} />
        <Route path="/addstudent/:cid" element={<AddStudent />} />
        <Route path="/createcheckin/:cid" element={<CreateCheckIn />} />
        <Route path="/showcheckin/:cid" element={<ShowCheckIn />} />
        <Route path="/showcheckinstudents/:cid/checkin/:cno" element={<ShowCheckInStudents />} />
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