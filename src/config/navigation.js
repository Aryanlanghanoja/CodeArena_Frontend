// Navigation configuration with role-based visibility
export const navigationConfig = [
  // Dashboard - All roles
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'HomeIcon',
    visibleRoles: ['admin', 'teacher', 'student'],
    description: 'Overview and statistics'
  },

  // Admin-specific navigation
  {
    id: 'admin-users',
    label: 'Manage Users',
    path: '/admin/users',
    icon: 'UsersIcon',
    visibleRoles: ['admin'],
    description: 'User management and role assignment'
  },
  {
    id: 'admin-classes',
    label: 'All Classes',
    path: '/admin/classes',
    icon: 'ClassIcon',
    visibleRoles: ['admin'],
    description: 'View and manage all classes'
  },
  {
    id: 'admin-exams',
    label: 'All Exams',
    path: '/admin/exams',
    icon: 'ExamIcon',
    visibleRoles: ['admin'],
    description: 'Monitor all exams across the platform'
  },
  {
    id: 'admin-system',
    label: 'System Health',
    path: '/admin/system',
    icon: 'SettingsIcon',
    visibleRoles: ['admin'],
    description: 'System monitoring and health checks'
  },
  {
    id: 'admin-settings',
    label: 'Platform Settings',
    path: '/admin/settings',
    icon: 'CogIcon',
    visibleRoles: ['admin'],
    description: 'Global platform configuration'
  },

  // Teacher-specific navigation
  {
    id: 'teacher-classes',
    label: 'My Classes',
    path: '/teacher/classes',
    icon: 'ClassIcon',
    visibleRoles: ['teacher'],
    description: 'Manage your classes and students'
  },
  {
    id: 'teacher-questions',
    label: 'Question Bank',
    path: '/teacher/questions',
    icon: 'QuestionIcon',
    visibleRoles: ['teacher'],
    description: 'Create and manage questions'
  },
  {
    id: 'teacher-exams',
    label: 'My Exams',
    path: '/teacher/exams',
    icon: 'ExamIcon',
    visibleRoles: ['teacher'],
    description: 'Create and manage exams'
  },
  {
    id: 'teacher-learning-paths',
    label: 'Learning Paths',
    path: '/teacher/learning-paths',
    icon: 'PathIcon',
    visibleRoles: ['teacher'],
    description: 'Create structured learning content'
  },
  {
    id: 'teacher-leaderboard',
    label: 'Leaderboards',
    path: '/teacher/leaderboard',
    icon: 'TrophyIcon',
    visibleRoles: ['teacher'],
    description: 'View student performance and rankings'
  },

  // Student-specific navigation
  {
    id: 'student-classes',
    label: 'My Classes',
    path: '/student/classes',
    icon: 'ClassIcon',
    visibleRoles: ['student'],
    description: 'View your enrolled classes'
  },
  {
    id: 'student-exams',
    label: 'My Exams',
    path: '/student/exams',
    icon: 'ExamIcon',
    visibleRoles: ['student'],
    description: 'Take exams and view results'
  },
  {
    id: 'student-practice',
    label: 'Practice Problems',
    path: '/student/practice',
    icon: 'CodeIcon',
    visibleRoles: ['student'],
    description: 'Solve coding problems'
  },
  {
    id: 'student-learning',
    label: 'Learning Paths',
    path: '/student/learning-paths',
    icon: 'PathIcon',
    visibleRoles: ['student'],
    description: 'Follow structured learning paths'
  },
  {
    id: 'student-progress',
    label: 'My Progress',
    path: '/student/progress',
    icon: 'ChartIcon',
    visibleRoles: ['student'],
    description: 'Track your learning progress'
  },

  // Common navigation for all roles
  {
    id: 'contests',
    label: 'Contests',
    path: '/contests',
    icon: 'TrophyIcon',
    visibleRoles: ['admin', 'teacher', 'student'],
    description: 'Participate in coding contests'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: 'LeaderboardIcon',
    visibleRoles: ['admin', 'teacher', 'student'],
    description: 'Global rankings and achievements'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: 'UserIcon',
    visibleRoles: ['admin', 'teacher', 'student'],
    description: 'Manage your profile and settings'
  }
];

// Helper function to get navigation items for a specific role
export const getNavigationForRole = (role) => {
  return navigationConfig.filter(item => item.visibleRoles.includes(role));
};

// Helper function to check if a user can access a specific route
export const canAccessRoute = (userRole, routePath) => {
  const route = navigationConfig.find(item => item.path === routePath);
  return route ? route.visibleRoles.includes(userRole) : false;
};
