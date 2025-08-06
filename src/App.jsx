import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
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
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemListPage onProblemSelect={handleProblemSelect} />} />
        <Route path="/contests" element={<ContestsPage onContestSelect={handleContestSelect} />} />
        <Route path="/contests/:contestId" element={<ContestDetailsRoute onBackToContests={handleBackToContests} onProblemSelect={handleProblemSelect} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/exam" element={<ExamPage onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/courses" element={<CoursesPage onCourseSelect={handleCourseSelect} onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/courses/:courseId" element={<CoursesPage onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/learning-paths" element={<LearningPathsPage onPathSelect={handlePathSelect} onBackToDashboard={handleBackToDashboard} />} />
        <Route path="/learning-paths/:pathId" element={<LearningPathsPage onBackToDashboard={handleBackToDashboard} />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </DashboardLayout>
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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;