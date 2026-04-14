import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
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

function App() {
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/new" element={<NewStudent />} />
                <Route path="/students/edit/:id" element={<NewStudent />} />
                <Route path="/students/admission-letter" element={<AdmissionLetter />} />
                <Route path="/students/admission-letter/:id" element={<AdmissionLetter />} />
                <Route path="/students/id-cards" element={<StudentIdCards />} />
                <Route path="/students/manage-login" element={<StudentsManageLogin />} />
                <Route path="/students/promote" element={<PromoteStudents />} />
                {/* Attendance sub-routes */}
                <Route path="/attendance" element={<Navigate to="/attendance/students" replace />} />
                <Route path="/attendance/students" element={<StudentsAttendance />} />
                <Route path="/attendance/employees" element={<EmployeesAttendance />} />
                <Route path="/attendance/class-report" element={<ClassWiseReport />} />
                <Route path="/attendance/student-report" element={<StudentsAttendanceReport />} />
                <Route path="/attendance/employee-report" element={<EmployeesAttendanceReport />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/fees/collect" element={<CollectFees />} />
                <Route path="/fees/paid-slip" element={<FeesPaidSlip />} />
                <Route path="/salary/pay" element={<PaySalary />} />
                <Route path="/salary/paid-slip" element={<SalaryPaidSlip />} />
                <Route path="/classes" element={<AllClasses />} />
                <Route path="/classes/new" element={<NewClass />} />
                <Route path="/classes/edit/:id" element={<NewClass />} />
                <Route path="/subjects/classes-with-subjects" element={<ClassesWithSubjects />} />
                <Route path="/subjects/assign-subjects" element={<AssignSubjects />} />
                <Route path="/employees" element={<AllEmployees />} />
                <Route path="/employees/new" element={<NewEmployee />} />
                <Route path="/employees/edit/:id" element={<NewEmployee />} />
                <Route path="/employees/job-letter" element={<EmployeeJobLetter />} />
                <Route path="/employees/job-letter/:id" element={<EmployeeJobLetter />} />
                <Route path="/employees/manage-login" element={<EmployeesManageLogin />} />
                {/* Settings sub-routes */}
                <Route path="/settings" element={<Navigate to="/settings/institute-profile" replace />} />
                <Route path="/settings/institute-profile" element={<InstituteProfile />} />
                <Route path="/settings/fees-particular" element={<FeesParticular />} />
                <Route path="/settings/accounts-for-fees-invoice" element={<AccountsForFeesInvoice />} />
                <Route path="/settings/rules-and-regulation" element={<RulesAndRegulation />} />
                <Route path="/settings/marks-grading" element={<MarksGrading />} />
                <Route path="/settings/account-setting" element={<AccountSetting />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

export default App;
