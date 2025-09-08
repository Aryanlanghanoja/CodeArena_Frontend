import React, { useState, useEffect } from 'react';
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
import LearningPathList from './components/learning-paths/LearningPathList';
import LearningPathDetail from './components/learning-paths/LearningPathDetail';
import CreateLearningPath from './components/learning-paths/CreateLearningPath';
import ModuleDetail from './components/learning-paths/ModuleDetail';
import AddQuestionsToModule from './components/learning-paths/AddQuestionsToModule';
import LearningPathTest from './components/learning-paths/LearningPathTest';
import ModuleDebug from './components/learning-paths/ModuleDebug';
import CreateModule from './components/learning-paths/CreateModule';
import ReorderModules from './components/learning-paths/ReorderModules';
import questionsService from './services/questionsService';
import { Button } from './components/ui/button';

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
import ClassDetailsPage from './components/teacher/ClassDetailsPage';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Smart back navigation based on URL parameters or referrer
  const handleSmartBack = () => {
    // Check URL search parameters for back navigation info
    const searchParams = new URLSearchParams(location.search);
    const backTo = searchParams.get('backTo');
    const pathId = searchParams.get('pathId');
    const moduleId = searchParams.get('moduleId');
    
    // If we have explicit back navigation parameters
    if (backTo === 'learning-path' && pathId) {
      if (moduleId) {
        navigate(`/learning-paths/${pathId}/modules/${moduleId}`);
        return;
      } else {
        navigate(`/learning-paths/${pathId}`);
        return;
      }
    }
    
    // Fallback: Check if user came from a learning path using referrer
    const referrer = document.referrer;
    if (referrer && referrer.includes('/learning-paths')) {
      // Extract learning path and module info from referrer
      const learningPathMatch = referrer.match(/\/learning-paths\/(\d+)/);
      const moduleMatch = referrer.match(/\/modules\/(\d+)/);
      
      if (learningPathMatch && moduleMatch) {
        const pathId = learningPathMatch[1];
        const moduleId = moduleMatch[1];
        navigate(`/learning-paths/${pathId}/modules/${moduleId}`);
        return;
      } else if (learningPathMatch) {
        const pathId = learningPathMatch[1];
        navigate(`/learning-paths/${pathId}`);
        return;
      } else {
        navigate('/learning-paths');
        return;
      }
    }
    
    // Default back to problems list
    onBackToProblemList();
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await questionsService.getQuestion(problemId);
        
        if (result.success) {
          // Transform database question to match ProblemSolvingPage expected structure
          const dbQuestion = result.data;
          const transformedProblem = {
            id: dbQuestion.question_id,
            question_id: dbQuestion.question_id,
            title: dbQuestion.question_title,
            description: dbQuestion.description,
            difficulty: dbQuestion.difficulty,
            topic: dbQuestion.tags || 'General',
            company: dbQuestion.company_tags || 'General',
            constraints: dbQuestion.constraints ? [dbQuestion.constraints] : ['No specific constraints'],
            examples: [], // Will be populated from testcases if needed
            starterCode: {
              javascript: '// Write your solution here\nfunction solution() {\n    // Your code goes here\n}',
              python: '# Write your solution here\ndef solution():\n    # Your code goes here\n    pass',
              cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code goes here\n    return 0;\n}'
            }
          };
          setProblem(transformedProblem);
        } else {
          setError('Problem not found');
        }
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Problem not found'}</p>
          <Button onClick={handleSmartBack} variant="outline">
            {getBackButtonText()}
          </Button>
        </div>
      </div>
    );
  }

  // Determine back button text based on context
  const getBackButtonText = () => {
    const searchParams = new URLSearchParams(location.search);
    const backTo = searchParams.get('backTo');
    
    if (backTo === 'learning-path') {
      return 'Back to Learning Path';
    }
    return 'Back to Problems';
  };

  return <ProblemSolvingPage problem={problem} onBackToProblemList={handleSmartBack} backButtonText={getBackButtonText()} />;
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
        <Route 
          path="/learning-paths/create" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
              <CreateLearningPath />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:id" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher', 'student']}>
              <LearningPathDetail />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:id/edit" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
              <CreateLearningPath />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:pathId/modules/create" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
              <CreateModule />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:pathId/modules/reorder" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
              <ReorderModules />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:pathId/modules/:moduleId" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher', 'student']}>
              <ModuleDetail />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/learning-paths/:pathId/modules/:moduleId/add-questions" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
              <AddQuestionsToModule />
            </RoleBasedRoute>
          } 
        />
        
        {/* Test Route for Learning Paths */}
        <Route 
          path="/learning-paths/test" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher', 'student']}>
              <LearningPathTest />
            </RoleBasedRoute>
          } 
        />
        
        {/* Debug Route for Module Issues */}
        <Route 
          path="/learning-paths/:pathId/modules/:moduleId/debug" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'teacher', 'student']}>
              <ModuleDebug />
            </RoleBasedRoute>
          } 
        />
        
        {/* Role-specific Learning Path Routes */}
        <Route 
          path="/learning-paths" 
          element={
            <RoleBasedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <LearningPathList onPathSelect={handlePathSelect} />
            </RoleBasedRoute>
          } 
        />
        
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
          path="/teacher/classes/:classId" 
          element={
            <RoleBasedRoute allowedRoles={['teacher']}>
              <ClassDetailsPage />
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