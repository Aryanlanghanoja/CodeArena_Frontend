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
    description: 'Manage your classes and students',
    // This allows access to all sub-routes like /teacher/classes/:classId
    exact: false
  },
  // Explicit route for class details
  {
    id: 'teacher-class-details',
    label: 'Class Details',
    path: '/teacher/classes/:classId',
    icon: 'ClassIcon',
    visibleRoles: ['teacher'],
    description: 'View and manage class details',
    // Don't show in navigation menu
    hidden: true
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
  return navigationConfig.filter(item => 
    item.visibleRoles.includes(role) && 
    !item.hidden // Exclude hidden routes from navigation
  );
};

// Helper function to check if a user can access a specific route
export const canAccessRoute = (userRole, routePath) => {
  console.log('\n=== Route Access Check ===');
  console.log('User Role:', userRole);
  console.log('Requested Path:', routePath);
  
  // Try to find a matching route
  const matchedRoute = navigationConfig.find(item => {
    // Check exact match first
    if (item.path === routePath) {
      console.log('✓ Exact match found:', item.path);
      return true;
    }
    
    // Check for dynamic routes (e.g., /teacher/classes/:classId)
    if (item.path.includes(':')) {
      const pathParts = item.path.split('/');
      const routeParts = routePath.split('/');
      
      if (pathParts.length === routeParts.length) {
        const isMatch = pathParts.every((part, index) => {
          return part.startsWith(':') || part === routeParts[index];
        });
        
        if (isMatch) {
          console.log(`✓ Dynamic route match: ${item.path} -> ${routePath}`);
          return true;
        }
      }
    }
    
    // Check for prefix match (e.g., /teacher/classes matches /teacher/classes/123)
    if (routePath.startsWith(item.path) && 
        (routePath === item.path || routePath[item.path.length] === '/')) {
      console.log(`✓ Prefix match: ${item.path} is a prefix of ${routePath}`);
      return true;
    }
    
    return false;
  });
  
  if (matchedRoute) {
    const hasAccess = matchedRoute.visibleRoles.includes(userRole);
    console.log('\nAccess Decision:', { 
      'Matched Route': matchedRoute.path,
      'Required Roles': matchedRoute.visibleRoles.join(', '),
      'User Role': userRole,
      'Access Granted': hasAccess ? '✅' : '❌'
    });
    return hasAccess;
  }
  
  console.log('\n❌ No matching route found for:', routePath);
  console.log('Available routes:');
  navigationConfig.forEach(route => {
    console.log(`- ${route.path} (${route.visibleRoles.join(', ')})`);
  });
  
  return false;
};
