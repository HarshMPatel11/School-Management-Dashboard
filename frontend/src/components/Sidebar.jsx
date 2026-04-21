import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11.3V16c0 .7 2.7 2 6 2s6-1.3 6-2v-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 9.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13h6v7H4v-7Zm10-9h6v16h-6V4ZM4 4h6v5H4V4Zm10 10h6v6h-6v-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l8 5v4c0 6-8 8-8 8s-8-2-8-8V7l8-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6M12 16v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4v3M16 4v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.3 14.2 1.9 1.8 3.5-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a3 3 0 0 0 3-3h12a3 3 0 0 0 3 3v10a3 3 0 0 0-3 3H6a3 3 0 0 0-3-3V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.5v7M14.2 10.4c0-.8-1-1.4-2.2-1.4s-2.2.6-2.2 1.4 1 1.4 2.2 1.4 2.2.6 2.2 1.4-1 1.4-2.2 1.4-2.2-.6-2.2-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SalaryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8M10 9.5h4M10 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClassesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 5h18M3 10h18M3 15h12M3 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="13" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5a2 2 0 0 1 2-2h12v17l-5-2-5 2V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EmployeesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="15" y="8" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 14 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.07 4.93a10 10 0 0 0-14.14 0m14.14 14.14a10 10 0 0 1-14.14 0M4.93 4.93a10 10 0 0 1 14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const { user } = useAuth();
  const role = user?.role || "";
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isStudent = role === "student";
  const canAccessOperations = isAdmin || isEmployee;
  const location = useLocation();
  const isStudentsActive = location.pathname.startsWith("/students");
  const isAttendanceActive = location.pathname.startsWith("/attendance");
  const isClassesActive = location.pathname.startsWith("/classes");
  const isSubjectsActive = location.pathname.startsWith("/subjects");
  const isEmployeesActive = location.pathname.startsWith("/employees");
  const isFeesActive = location.pathname.startsWith("/fees");
  const isSalaryActive = location.pathname.startsWith("/salary");
  const isExamsActive = location.pathname.startsWith("/exams");
  const isClassTestsActive = location.pathname.startsWith("/class-tests");
  const isHomeworkActive = location.pathname.startsWith("/homework");
  const isReportsActive = location.pathname.startsWith("/reports");
  const isGeneralSettingsActive = location.pathname.startsWith("/settings");
  const isStudentPortalActive = location.pathname.startsWith("/student");
  const [studentsOpen, setStudentsOpen] = useState(isStudentsActive);
  const [attendanceOpen, setAttendanceOpen] = useState(isAttendanceActive);
  const [classesOpen, setClassesOpen] = useState(isClassesActive);
  const [subjectsOpen, setSubjectsOpen] = useState(isSubjectsActive);
  const [employeesOpen, setEmployeesOpen] = useState(isEmployeesActive);
  const [feesOpen, setFeesOpen] = useState(isFeesActive);
  const [salaryOpen, setSalaryOpen] = useState(isSalaryActive);
  const [examsOpen, setExamsOpen] = useState(isExamsActive);
  const [classTestsOpen, setClassTestsOpen] = useState(isClassTestsActive);
  const [reportsOpen, setReportsOpen] = useState(isReportsActive);
  const [settingsOpen, setSettingsOpen] = useState(isGeneralSettingsActive);

  useEffect(() => {
    onCloseMobile();
  }, [location.pathname, onCloseMobile]);

  const navItems = canAccessOperations
    ? [{ path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> }]
    : [];

  if (isStudent) {
    const studentNavItems = [
      { path: "/student/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { path: "/student/admission-letter", label: "Admission Letter", icon: <StudentsIcon /> },
      { path: "/student/fees", label: "Paid Fee Receipt", icon: <FeesIcon /> },
      { path: "/student/report-card", label: "My Report Card", icon: <ExamIcon /> },
      { path: "/student/test-results", label: "Test Results", icon: <ExamIcon /> },
      { path: "/student/exam-results", label: "Exam Result", icon: <ExamIcon /> },
      { path: "/student/account-settings", label: "Account Settings", icon: <SettingsIcon /> },
    ];

    return (
      <>
        <button
          type="button"
          className={`sidebar-overlay ${isMobileOpen ? "visible" : ""}`}
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
        <aside className={`sidebar ${isMobileOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-header">
            <div className="brand-icon"><SchoolIcon /></div>
            <div className="brand">Student Portal</div>
          </div>
          <nav className="nav-links">
            {studentNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-link ${(isActive || (isStudentPortalActive && location.pathname === item.path)) ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay ${isMobileOpen ? "visible" : ""}`}
        aria-label="Close menu"
        onClick={onCloseMobile}
      />
      <aside className={`sidebar ${isMobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-icon"><SchoolIcon /></div>
          <div className="brand">CampusFlow</div>
        </div>
        <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        <div className={`nav-group ${isGeneralSettingsActive ? "nav-group--active" : ""}`}>
          <button
            className="nav-group-header"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
          >
            <span className="nav-icon"><SettingsIcon /></span>
            <span className="nav-label">{isStudent ? "My Account" : "General Settings"}</span>
            <span className="nav-group-toggle">{settingsOpen ? "-" : "+"}</span>
          </button>

          {settingsOpen && (
            <div className="nav-sub-links">
              {isAdmin && (
                <>
                  <NavLink
                    to="/settings/institute-profile"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Institute Profile
                  </NavLink>
                  <NavLink
                    to="/settings/fees-particular"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Fees Particular
                  </NavLink>
                  <NavLink
                    to="/settings/accounts-for-fees-invoice"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Accounts For Fees Invoice
                  </NavLink>
                  <NavLink
                    to="/settings/marks-grading"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Marks Grading
                  </NavLink>
                </>
              )}
              {!isStudent && (
                <NavLink
                  to="/settings/rules-and-regulation"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Rules & Regulation
                </NavLink>
              )}
              <NavLink
                to="/settings/account-setting"
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
              >
                Account Setting
              </NavLink>
            </div>
          )}
        </div>

        {canAccessOperations && (
          <div className={`nav-group ${isClassesActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setClassesOpen((prev) => !prev)}
              aria-expanded={classesOpen}
            >
              <span className="nav-icon"><ClassesIcon /></span>
              <span className="nav-label">Classes</span>
              <span className="nav-group-toggle">{classesOpen ? "-" : "+"}</span>
            </button>

            {classesOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/classes"
                  end
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  All Classes
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/classes/new"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    New Class
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}

        {canAccessOperations && (
          <div className={`nav-group ${isSubjectsActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setSubjectsOpen((prev) => !prev)}
              aria-expanded={subjectsOpen}
            >
              <span className="nav-icon"><SubjectsIcon /></span>
              <span className="nav-label">Subjects</span>
              <span className="nav-group-toggle">{subjectsOpen ? "-" : "+"}</span>
            </button>

            {subjectsOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/subjects/classes-with-subjects"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Classes With Subjects
                </NavLink>
                <NavLink
                  to="/subjects/assign-subjects"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Assign Subjects
                </NavLink>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`nav-group ${isExamsActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setExamsOpen((prev) => !prev)}
              aria-expanded={examsOpen}
            >
              <span className="nav-icon"><ExamIcon /></span>
              <span className="nav-label">Exams</span>
              <span className="nav-group-toggle">{examsOpen ? "-" : "+"}</span>
            </button>

            {examsOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/exams/create"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Create New Exam
                </NavLink>
                <NavLink
                  to="/exams/marks"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Add / Update Exam Marks
                </NavLink>
                <NavLink
                  to="/exams/result-card"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Result Card
                </NavLink>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`nav-group ${isReportsActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setReportsOpen((prev) => !prev)}
              aria-expanded={reportsOpen}
            >
              <span className="nav-icon"><ExamIcon /></span>
              <span className="nav-label">Reports</span>
              <span className="nav-group-toggle">{reportsOpen ? "-" : "+"}</span>
            </button>

            {reportsOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/reports/report-card"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Students report Card
                </NavLink>
                <NavLink
                  to="/reports/students-info"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Students info report
                </NavLink>
                <NavLink
                  to="/reports/parents-info"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Parents info report
                </NavLink>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`nav-group ${isClassTestsActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setClassTestsOpen((prev) => !prev)}
              aria-expanded={classTestsOpen}
            >
              <span className="nav-icon"><ExamIcon /></span>
              <span className="nav-label">Class Tests</span>
              <span className="nav-group-toggle">{classTestsOpen ? "-" : "+"}</span>
            </button>

            {classTestsOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/class-tests/marks"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Manage Test Marks
                </NavLink>
                <NavLink
                  to="/class-tests/results"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Test Result
                </NavLink>
              </div>
            )}
          </div>
        )}

        {canAccessOperations && (
          <NavLink
            to="/homework"
            onClick={onCloseMobile}
            className={({ isActive }) => `nav-link ${(isActive || isHomeworkActive) ? "active" : ""}`}
          >
            <span className="nav-icon"><SubjectsIcon /></span>
            <span className="nav-label">Homework</span>
          </NavLink>
        )}

        {canAccessOperations && (
          <div className={`nav-group ${isStudentsActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setStudentsOpen((prev) => !prev)}
              aria-expanded={studentsOpen}
            >
              <span className="nav-icon"><StudentsIcon /></span>
              <span className="nav-label">Students</span>
              <span className="nav-group-toggle">{studentsOpen ? "-" : "+"}</span>
            </button>

            {studentsOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/students"
                  end
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  All Students
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/students/new"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Add New
                  </NavLink>
                )}
                <NavLink
                  to="/students/id-cards"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Student ID Cards
                </NavLink>
                <NavLink
                  to="/students/admission-letter"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Admission Letter
                </NavLink>
                {isAdmin && (
                  <>
                    <NavLink
                      to="/students/promote"
                      onClick={onCloseMobile}
                      className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                    >
                      Promote Students
                    </NavLink>
                    <NavLink
                      to="/students/manage-login"
                      onClick={onCloseMobile}
                      className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                    >
                      Manage Login
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`nav-group ${isEmployeesActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setEmployeesOpen((prev) => !prev)}
              aria-expanded={employeesOpen}
            >
              <span className="nav-icon"><EmployeesIcon /></span>
              <span className="nav-label">Employees</span>
              <span className="nav-group-toggle">{employeesOpen ? "-" : "+"}</span>
            </button>

            {employeesOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/employees"
                  end
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  All Employees
                </NavLink>
                <NavLink
                  to="/employees/new"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Add New
                </NavLink>
                <NavLink
                  to="/employees/job-letter"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Job Letter
                </NavLink>
                <NavLink
                  to="/employees/manage-login"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Manage Login
                </NavLink>
              </div>
            )}
          </div>
        )}

        {canAccessOperations && (
          <div className={`nav-group ${isFeesActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setFeesOpen((prev) => !prev)}
              aria-expanded={feesOpen}
            >
              <span className="nav-icon"><FeesIcon /></span>
              <span className="nav-label">Fees</span>
              <span className="nav-group-toggle">{feesOpen ? "-" : "+"}</span>
            </button>

            {feesOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/fees"
                  end
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Generate Fees Invoice
                </NavLink>
                <NavLink
                  to="/fees/collect"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Collect Fees
                </NavLink>
                <NavLink
                  to="/fees/paid-slip"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Fees Paid Slip
                </NavLink>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`nav-group ${isSalaryActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setSalaryOpen((prev) => !prev)}
              aria-expanded={salaryOpen}
            >
              <span className="nav-icon"><SalaryIcon /></span>
              <span className="nav-label">Salary</span>
              <span className="nav-group-toggle">{salaryOpen ? "-" : "+"}</span>
            </button>

            {salaryOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/salary/pay"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Pay Salary
                </NavLink>
                <NavLink
                  to="/salary/paid-slip"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Salary Paid Slip
                </NavLink>
              </div>
            )}
          </div>
        )}

        {canAccessOperations && (
          <div className={`nav-group ${isAttendanceActive ? "nav-group--active" : ""}`}>
            <button
              className="nav-group-header"
              onClick={() => setAttendanceOpen((prev) => !prev)}
              aria-expanded={attendanceOpen}
            >
              <span className="nav-icon"><AttendanceIcon /></span>
              <span className="nav-label">Attendance</span>
              <span className="nav-group-toggle">{attendanceOpen ? "-" : "+"}</span>
            </button>

            {attendanceOpen && (
              <div className="nav-sub-links">
                <NavLink
                  to="/attendance/students"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Students Attendance
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/attendance/employees"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Employees Attendance
                  </NavLink>
                )}
                <NavLink
                  to="/attendance/class-report"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Class wise Report
                </NavLink>
                <NavLink
                  to="/attendance/student-report"
                  onClick={onCloseMobile}
                  className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                >
                  Students Attendance Report
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/attendance/employee-report"
                    onClick={onCloseMobile}
                    className={({ isActive }) => `nav-sub-link ${isActive ? "active" : ""}`}
                  >
                    Employees Attendance Report
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
