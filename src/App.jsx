import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './components/DashboardPage';
import ProblemListPage from './components/ProblemListPage';
import ContestsPage from './components/ContestsPage';
import ContestDetailsPage from './components/ContestDetailsPage';
import ProblemSolvingPage from './components/ProblemSolvingPage';
import ProfilePage from './components/ProfilePage';
import ExamPage from './components/ExamPage';
import CoursesPage from './components/CoursesPage';
import LearningPathsPage from './components/LearningPathsPage';

// Import new role-based components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Admin components
import AdminUsersPage from './components/admin/AdminUsersPage';
import AdminClassesPage from './components/admin/AdminClassesPage';
import AdminSystemHealthPage from './components/admin/AdminSystemHealthPage';

// Teacher components
import TeacherClassesPage from './components/teacher/TeacherClassesPage';
import TeacherQuestionBankPage from './components/teacher/TeacherQuestionBankPage';
import TeacherExamsPage from './components/teacher/TeacherExamsPage';

// Question Bank Routes
import { TeacherQuestionBankRoutes, AdminQuestionBankRoutes, StudentPracticeRoutes } from './routes/questionRoutes.jsx';

// Student components
import StudentClassesPage from './components/student/StudentClassesPage';
import StudentExamsPage from './components/student/StudentExamsPage';
import StudentQuestionSolver from './components/student/StudentQuestionSolver';

import { mockProblems, mockContests } from './data/mockData';

const ContestDetailsRoute = ({ onBackToContests, onProblemSelect }) => {
  const { contestId } = useParams();
  const contest = mockContests.find(c => String(c.id) === String(contestId));
  if (!contest) {
    return <div className="p-8 text-center text-muted-foreground">Contest not found.</div>;
  }
  return <ContestDetailsPage contest={contest} onBackToContests={onBackToContests} onProblemSelect={onProblemSelect} />;
};

const queryClient = new QueryClient();

const ProblemSolvingRoute = ({ onBackToProblemList }) => {
  const { problemId } = useParams();
  const problem = mockProblems.find(p => String(p.id) === String(problemId));
  if (!problem) {
    return <div className="p-8 text-center text-muted-foreground">Problem not found.</div>;
  }
  return <ProblemSolvingPage problem={problem} onBackToProblemList={onBackToProblemList} />;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CodeArena...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Navigation handlers
  const handleCourseSelect = (courseId) => {
    navigate(`/courses/${courseId}`);
  };
  const handlePathSelect = (pathId) => {
    navigate(`/learning-paths/${pathId}`);
  };
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  const handleProblemSelect = (problem) => {
    navigate(`/problems/${problem.id}`);
  };
  const handleContestSelect = (contest) => {
    navigate(`/contests/${contest.id}`);
  };
  const handleBackToProblemList = () => {
    navigate('/problems');
  };
  const handleBackToContests = () => {
    navigate('/contests');
  };

  // Layout logic for full screen problem-solving
  if (location.pathname.startsWith('/problems/')) {
    return (
      <Routes>
        <Route
          path="/problems/:problemId"
          element={
            <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
              <ProblemSolvingRoute onBackToProblemList={handleBackToProblemList} />
            </div>
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Full-screen routes (outside dashboard layout) */}
      <Route 
        path="/student/practice/:questionId" 
        element={
          <RoleBasedRoute allowedRoles={['student']}>
            <StudentQuestionSolver />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/student/practice/:questionId/solve" 
        element={
          <RoleBasedRoute allowedRoles={['student']}>
            <StudentQuestionSolver />
          </RoleBasedRoute>
        } 
      />
      
      {/* Dashboard routes (inside dashboard layout) */}
      <Route path="/*" element={
        <DashboardLayout>
          <Routes>
        {/* Main Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Legacy Routes */}
        <Route path="/problems" element={<ProblemListPage onProblemSelect={handleProblemSelect} />} />
        <Route path="/contests" element={<ContestsPage onContestSelect={handleContestSelect} />} />
        <Route path="/contests/:contestId" element={<ContestDetailsRoute onBackToContests={handleBackToContests} onProblemSelect={handleProblemSelect} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/exam" element={<ExamPage onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/courses" element={<CoursesPage onCourseSelect={handleCourseSelect} onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/courses/:courseId" element={<CoursesPage onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/learning-paths" element={<LearningPathsPage onPathSelect={handlePathSelect} onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/learning-paths/:pathId" element={<LearningPathsPage onBackToDashboard={handleBackToDashboard} />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/users" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/admin/classes" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminClassesPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/admin/system-health" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminSystemHealthPage />
            </RoleBasedRoute>
          } 
        />
        
        {/* Teacher Routes */}
        <Route 
          path="/teacher/classes" 
          element={
            <RoleBasedRoute allowedRoles={['teacher']}>
              <TeacherClassesPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/teacher/exams" 
          element={
            <RoleBasedRoute allowedRoles={['teacher']}>
              <TeacherExamsPage />
            </RoleBasedRoute>
          } 
        />
        
        {/* Question Bank Routes */}
        <Route 
          path="/teacher/questions/*" 
          element={
            <RoleBasedRoute allowedRoles={['teacher']}>
              <TeacherQuestionBankRoutes />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/admin/questions/*" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminQuestionBankRoutes />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/student/practice" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <StudentPracticeRoutes />
            </RoleBasedRoute>
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/student/classes" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <StudentClassesPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/student/exams" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <StudentExamsPage />
            </RoleBasedRoute>
          } 
        />
        
            {/* Default route */}
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </DashboardLayout>
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<AppContent />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;