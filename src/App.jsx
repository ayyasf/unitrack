
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Student from './pages/Student/Student';
import Doctor from './pages/Doctor/Doctor';
import LogIn from './pages/LogIn/LogIn';
import Implementation from './pages/Implementation/Implementation';
import ActivitingTheDoctorAccount from './pages/ActivitingTheDoctorAccount/ActivitingThe DoctorAccount';
import ProjectIdeasForm from './pages/ProjectIdeasForm/ProjectIdeasForm';
import ProjectIdeaApproval from './pages/ProjectIdeaApproval/ProjectIdeaApproval';

import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import StudentDashbord from './pages/StudentDashbord/StudentDashbord';
import SelectTheDoctor from './pages/SelectTheDoctor/SelectTheDoctor';
import LeaderDashboard from './pages/LeaderDashboard/LeaderDashboard';
import CreatGroupAndJoiningTheGroup from './pages/Creating/Creating';
import JoiningToTheGroup from './pages/JoiningToTheGroup/JoiningToTheGroup';
import Creating from './pages/Creating/Creating';
import JoinGroupOrCreat from './component/JoinGroupOrCreat/JoinGroupOrCreat';
import StageSubmissions from './pages/StageSubmission/StageSubmission';





export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/student" element={<Student />} />
      <Route path="/doctor" element={<Doctor />} />
      <Route path="/implementation" element={<Implementation />} />
      <Route path="/activating" element={<ActivitingTheDoctorAccount />} />
      <Route path="/projectIdeas" element={<ProjectIdeasForm />} />
      <Route path="/projectIdeasapproval" element={<ProjectIdeaApproval />} />
      <Route path="/doctorDashboard" element={<DoctorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/studentDashbord" element={<StudentDashbord />} />
      <Route path="/selectdoctor" element={<SelectTheDoctor />} />
      <Route path="/leader" element={<LeaderDashboard />} />
      <Route path="/creatgroup" element={<Creating />} />
      <Route path="/joingrouporcreat" element={<JoiningToTheGroup />} />
      <Route path="/submitStage/:stageId"  element={<StageSubmissions />} />
    




    </Routes>
  )
}








