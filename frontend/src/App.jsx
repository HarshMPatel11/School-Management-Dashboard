import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { getDefaultRouteForRole } from "./utils/roles";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Students from "./pages/Students";
import NewStudent from "./pages/NewStudent";
import StudentIdCards from "./pages/StudentIdCards";
import PromoteStudents from "./pages/PromoteStudents";
import AdmissionLetter from "./pages/AdmissionLetter";
import StudentsManageLogin from "./pages/StudentsManageLogin";
import Fees from "./pages/Fees";
import CollectFees from "./pages/CollectFees";
import FeesPaidSlip from "./pages/FeesPaidSlip";
import PaySalary from "./pages/PaySalary";
import SalaryPaidSlip from "./pages/SalaryPaidSlip";
import AllClasses from "./pages/AllClasses";
import NewClass from "./pages/NewClass";
import ClassesWithSubjects from "./pages/ClassesWithSubjects";
import AssignSubjects from "./pages/AssignSubjects";
import AllEmployees from "./pages/AllEmployees";
import NewEmployee from "./pages/NewEmployee";
import EmployeeJobLetter from "./pages/EmployeeJobLetter";
import EmployeesManageLogin from "./pages/EmployeesManageLogin";
import StudentsAttendance from "./pages/StudentsAttendance";
import EmployeesAttendance from "./pages/EmployeesAttendance";
import ClassWiseReport from "./pages/ClassWiseReport";
import StudentsAttendanceReport from "./pages/StudentsAttendanceReport";
import EmployeesAttendanceReport from "./pages/EmployeesAttendanceReport";
import InstituteProfile from "./pages/InstituteProfile";
import FeesParticular from "./pages/FeesParticular";
import AccountsForFeesInvoice from "./pages/AccountsForFeesInvoice";
import RulesAndRegulation from "./pages/RulesAndRegulation";
import MarksGrading from "./pages/MarksGrading";
import AccountSetting from "./pages/AccountSetting";
import CreateExam from "./pages/CreateExam";
import ExamMarks from "./pages/ExamMarks";
import ExamResultCard from "./pages/ExamResultCard";
import ClassTestMarks from "./pages/ClassTestMarks";
import ClassTestResults from "./pages/ClassTestResults";
import Homework from "./pages/Homework";
import ReportCardReport from "./pages/ReportCardReport";
import StudentsInfoReport from "./pages/StudentsInfoReport";
import ParentsInfoReport from "./pages/ParentsInfoReport";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAdmissionLetter from "./pages/StudentAdmissionLetter";
import StudentFeeReceipt from "./pages/StudentFeeReceipt";
import StudentReportCard from "./pages/StudentReportCard";
import StudentTestResults from "./pages/StudentTestResults";
import StudentExamResults from "./pages/StudentExamResults";
import StudentAccountSettings from "./pages/StudentAccountSettings";

function RoleHomeRedirect() {
  const { user } = useAuth();

  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

function SettingsHomeRedirect() {
  const { user } = useAuth();
  const settingsPath =
    user?.role === "admin"
      ? "/settings/institute-profile"
      : user?.role === "student"
        ? "/student/account-settings"
        : "/settings/account-setting";

  return <Navigate to={settingsPath} replace />;
}

function App() {
  const withRoles = (element, roles = []) => (
    <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<RoleHomeRedirect />} />
                <Route path="/dashboard" element={withRoles(<Dashboard />, ["admin", "employee"])} />
                <Route path="/student/dashboard" element={withRoles(<StudentDashboard />, ["student"])} />
                <Route path="/student/admission-letter" element={withRoles(<StudentAdmissionLetter />, ["student"])} />
                <Route path="/student/fees" element={withRoles(<StudentFeeReceipt />, ["student"])} />
                <Route path="/student/report-card" element={withRoles(<StudentReportCard />, ["student"])} />
                <Route path="/student/test-results" element={withRoles(<StudentTestResults />, ["student"])} />
                <Route path="/student/exam-results" element={withRoles(<StudentExamResults />, ["student"])} />
                <Route path="/student/account-settings" element={withRoles(<StudentAccountSettings />, ["student"])} />
                <Route path="/students" element={withRoles(<Students />, ["admin", "employee"])} />
                <Route path="/students/new" element={withRoles(<NewStudent />, ["admin"])} />
                <Route path="/students/edit/:id" element={withRoles(<NewStudent />, ["admin"])} />
                <Route path="/students/admission-letter" element={withRoles(<AdmissionLetter />, ["admin", "employee"])} />
                <Route path="/students/admission-letter/:id" element={withRoles(<AdmissionLetter />, ["admin", "employee"])} />
                <Route path="/students/id-cards" element={withRoles(<StudentIdCards />, ["admin", "employee"])} />
                <Route path="/students/manage-login" element={withRoles(<StudentsManageLogin />, ["admin"])} />
                <Route path="/students/promote" element={withRoles(<PromoteStudents />, ["admin"])} />
                {/* Attendance sub-routes */}
                <Route path="/attendance" element={<Navigate to="/attendance/students" replace />} />
                <Route path="/attendance/students" element={withRoles(<StudentsAttendance />, ["admin", "employee"])} />
                <Route path="/attendance/employees" element={withRoles(<EmployeesAttendance />, ["admin"])} />
                <Route path="/attendance/class-report" element={withRoles(<ClassWiseReport />, ["admin", "employee"])} />
                <Route path="/attendance/student-report" element={withRoles(<StudentsAttendanceReport />, ["admin", "employee"])} />
                <Route path="/attendance/employee-report" element={withRoles(<EmployeesAttendanceReport />, ["admin"])} />
                <Route path="/fees" element={withRoles(<Fees />, ["admin", "employee"])} />
                <Route path="/fees/collect" element={withRoles(<CollectFees />, ["admin", "employee"])} />
                <Route path="/fees/paid-slip" element={withRoles(<FeesPaidSlip />, ["admin", "employee"])} />
                <Route path="/salary/pay" element={withRoles(<PaySalary />, ["admin"])} />
                <Route path="/salary/paid-slip" element={withRoles(<SalaryPaidSlip />, ["admin"])} />
                <Route path="/classes" element={withRoles(<AllClasses />, ["admin", "employee"])} />
                <Route path="/classes/new" element={withRoles(<NewClass />, ["admin"])} />
                <Route path="/classes/edit/:id" element={withRoles(<NewClass />, ["admin"])} />
                <Route path="/subjects/classes-with-subjects" element={withRoles(<ClassesWithSubjects />, ["admin", "employee"])} />
                <Route path="/subjects/assign-subjects" element={withRoles(<AssignSubjects />, ["admin", "employee"])} />
                <Route path="/exams/create" element={withRoles(<CreateExam />, ["admin"])} />
                <Route path="/exams/marks" element={withRoles(<ExamMarks />, ["admin"])} />
                <Route path="/exams/result-card" element={withRoles(<ExamResultCard />, ["admin"])} />
                <Route path="/class-tests/marks" element={withRoles(<ClassTestMarks />, ["admin"])} />
                <Route path="/class-tests/results" element={withRoles(<ClassTestResults />, ["admin"])} />
                <Route path="/homework" element={withRoles(<Homework />, ["admin", "employee"])} />
                <Route path="/reports/report-card" element={withRoles(<ReportCardReport />, ["admin"])} />
                <Route path="/reports/students-info" element={withRoles(<StudentsInfoReport />, ["admin"])} />
                <Route path="/reports/parents-info" element={withRoles(<ParentsInfoReport />, ["admin"])} />
                <Route path="/employees" element={withRoles(<AllEmployees />, ["admin"])} />
                <Route path="/employees/new" element={withRoles(<NewEmployee />, ["admin"])} />
                <Route path="/employees/edit/:id" element={withRoles(<NewEmployee />, ["admin"])} />
                <Route path="/employees/job-letter" element={withRoles(<EmployeeJobLetter />, ["admin"])} />
                <Route path="/employees/job-letter/:id" element={withRoles(<EmployeeJobLetter />, ["admin"])} />
                <Route path="/employees/manage-login" element={withRoles(<EmployeesManageLogin />, ["admin"])} />
                {/* Settings sub-routes */}
                <Route path="/settings" element={<SettingsHomeRedirect />} />
                <Route path="/settings/institute-profile" element={withRoles(<InstituteProfile />, ["admin"])} />
                <Route path="/settings/fees-particular" element={withRoles(<FeesParticular />, ["admin"])} />
                <Route path="/settings/accounts-for-fees-invoice" element={withRoles(<AccountsForFeesInvoice />, ["admin"])} />
                <Route path="/settings/rules-and-regulation" element={withRoles(<RulesAndRegulation />, ["admin", "employee", "student"])} />
                <Route path="/settings/marks-grading" element={withRoles(<MarksGrading />, ["admin"])} />
                <Route path="/settings/account-setting" element={withRoles(<AccountSetting />, ["admin", "employee"])} />
                <Route path="*" element={<RoleHomeRedirect />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

export default App;
