// Question Bank Routes Configuration
// Add these routes to your main App.jsx or router configuration

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components
import AdminQuestionBank from '../components/admin/AdminQuestionBank';
import TeacherQuestionBank from '../components/teacher/TeacherQuestionBank';
import StudentPractice from '../components/student/StudentPractice';
import QuestionDetail from '../components/shared/QuestionDetail';
import TestcaseManagement from '../components/teacher/TestcaseManagement';
import CreateQuestionPage from '../components/teacher/CreateQuestionPage';
import EditQuestionPage from '../components/teacher/EditQuestionPage';
import ProblemSolvingPage from '../components/ProblemSolvingPage';

// Teacher Question Bank Routes Component
export const TeacherQuestionBankRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<TeacherQuestionBank />} />
      <Route path="create" element={<CreateQuestionPage />} />
      <Route path=":questionId" element={<QuestionDetail userRole="teacher" />} />
      <Route path=":questionId/edit" element={<EditQuestionPage />} />
      <Route path=":questionId/testcases" element={<TestcaseManagement />} />
    </Routes>
  );
};

// Admin Question Bank Routes Component
export const AdminQuestionBankRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AdminQuestionBank />} />
      <Route path=":questionId" element={<QuestionDetail userRole="admin" />} />
    </Routes>
  );
};

// Student Practice Routes Component
export const StudentPracticeRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<StudentPractice />} />
    </Routes>
  );
};

// Legacy Question Bank Routes Component (for backward compatibility)
export const QuestionBankRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/questions" element={<AdminQuestionBank />} />
      <Route path="/admin/questions/:questionId" element={<QuestionDetail userRole="admin" />} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/questions" element={<TeacherQuestionBank />} />
      <Route path="/teacher/questions/create" element={<CreateQuestionPage />} />
      <Route path="/teacher/questions/:questionId" element={<QuestionDetail userRole="teacher" />} />
      <Route path="/teacher/questions/:questionId/edit" element={<div>Question Edit Form (To be implemented)</div>} />
      <Route path="/teacher/questions/:questionId/testcases" element={<TestcaseManagement />} />
      
      {/* Student Routes */}
      <Route path="/student/practice" element={<StudentPractice />} />
      <Route path="/student/practice/:questionId" element={<QuestionDetail userRole="student" />} />
      <Route path="/student/practice/:questionId/solve" element={<div>Code Editor (To be implemented)</div>} />
    </Routes>
  );
};

// Route paths for easy reference
export const QUESTION_ROUTES = {
  // Admin routes
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_QUESTION_DETAIL: (id) => `/admin/questions/${id}`,
  
  // Teacher routes
  TEACHER_QUESTIONS: '/teacher/questions',
  TEACHER_CREATE_QUESTION: '/teacher/questions/create',
  TEACHER_QUESTION_DETAIL: (id) => `/teacher/questions/${id}`,
  TEACHER_QUESTION_EDIT: (id) => `/teacher/questions/${id}/edit`,
  TEACHER_TESTCASES: (id) => `/teacher/questions/${id}/testcases`,
  
  // Student routes
  STUDENT_PRACTICE: '/student/practice',
  STUDENT_QUESTION_DETAIL: (id) => `/student/practice/${id}`,
  STUDENT_QUESTION_SOLVE: (id) => `/student/practice/${id}/solve`,
};

// Navigation helper functions
export const navigateToQuestion = (questionId, userRole) => {
  const routes = {
    admin: QUESTION_ROUTES.ADMIN_QUESTION_DETAIL(questionId),
    teacher: QUESTION_ROUTES.TEACHER_QUESTION_DETAIL(questionId),
    student: QUESTION_ROUTES.STUDENT_QUESTION_DETAIL(questionId),
  };
  return routes[userRole] || routes.student;
};

export const navigateToTestcases = (questionId) => {
  return QUESTION_ROUTES.TEACHER_TESTCASES(questionId);
};

export const navigateToQuestionList = (userRole) => {
  const routes = {
    admin: QUESTION_ROUTES.ADMIN_QUESTIONS,
    teacher: QUESTION_ROUTES.TEACHER_QUESTIONS,
    student: QUESTION_ROUTES.STUDENT_PRACTICE,
  };
  return routes[userRole] || routes.student;
};

export default QuestionBankRoutes;
