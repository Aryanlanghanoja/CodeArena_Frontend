# Role-Based Navigation System

This document describes the role-based navigation and dashboard system implemented in CodeArena Frontend.

## Overview

The application implements a comprehensive role-based access control (RBAC) system with three main user roles:
- **Admin**: Platform administrators with full system access
- **Teacher**: Educators who manage classes, create exams, and monitor student progress
- **Student**: Learners who take exams, practice problems, and track their progress

## Architecture

### 1. Navigation Configuration (`src/config/navigation.js`)

The navigation system is centrally configured with role-based visibility:

```javascript
export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'HomeIcon',
    visibleRoles: ['admin', 'teacher', 'student'],
    description: 'Overview and statistics'
  },
  // ... more navigation items
];
```

**Key Features:**
- Each navigation item specifies which roles can access it
- Icons are mapped to SVG components
- Helper functions for role-based filtering and route access checking

### 2. Role-Specific Dashboards

#### Admin Dashboard (`src/components/dashboards/AdminDashboard.jsx`)
**Features:**
- System health monitoring
- User management overview
- Platform growth analytics
- Recent activity tracking
- Quick access to admin functions

**Key Metrics:**
- Total users, classes, and exams
- System health indicators
- User distribution by role
- Platform growth trends

#### Teacher Dashboard (`src/components/dashboards/TeacherDashboard.jsx`)
**Features:**
- Class management
- Student performance tracking
- Exam creation and monitoring
- Recent submissions review
- Performance analytics

**Key Metrics:**
- Total classes and students
- Average student scores
- Active exams
- Score distribution charts

#### Student Dashboard (`src/components/dashboards/StudentDashboard.jsx`)
**Features:**
- Learning progress tracking
- Enrolled classes overview
- Upcoming exams
- Practice problem progress
- Skill development tracking

**Key Metrics:**
- Average exam scores
- Problems solved
- Study streak
- Skill progress by topic

### 3. Route Protection

#### ProtectedRoute Component (`src/components/ProtectedRoute.jsx`)
- Ensures authentication before accessing routes
- Validates role-based access permissions
- Redirects unauthorized users to appropriate dashboards

#### RoleBasedRoute Component (`src/components/RoleBasedRoute.jsx`)
- Simplified route protection with role arrays
- Automatic redirection based on user role
- Integration with navigation configuration

## Navigation Structure

### Admin Navigation
- **Dashboard**: System overview and health
- **Manage Users**: User management and role assignment
- **All Classes**: View and manage all classes
- **All Exams**: Monitor all exams across platform
- **System Health**: System monitoring and health checks
- **Platform Settings**: Global platform configuration
- **Contests**: Manage coding contests
- **Leaderboard**: Global rankings
- **Profile**: Personal profile management

### Teacher Navigation
- **Dashboard**: Teaching overview and class management
- **My Classes**: Manage classes and students
- **Question Bank**: Create and manage questions
- **My Exams**: Create and manage exams
- **Learning Paths**: Create structured learning content
- **Leaderboards**: View student performance and rankings
- **Contests**: Participate in coding contests
- **Profile**: Personal profile management

### Student Navigation
- **Dashboard**: Learning progress and upcoming activities
- **My Classes**: View enrolled classes
- **My Exams**: Take exams and view results
- **Practice Problems**: Solve coding problems
- **Learning Paths**: Follow structured learning paths
- **My Progress**: Track learning progress
- **Contests**: Participate in coding contests
- **Profile**: Personal profile management

## Implementation Details

### 1. Icon System (`src/components/ui/icons.jsx`)
Centralized icon management with SVG components:
```javascript
export const iconMap = {
  HomeIcon,
  UsersIcon,
  ClassIcon,
  ExamIcon,
  // ... more icons
};
```

### 2. Dashboard Layout (`src/components/DashboardLayout.jsx`)
Updated to use role-based navigation:
```javascript
// Get role-based navigation items
const menuItems = getNavigationForRole(user?.role || 'student');
```

### 3. Main Dashboard (`src/components/DashboardPage.jsx`)
Role-based dashboard rendering:
```javascript
const renderDashboard = () => {
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};
```

## Usage Examples

### Setting up a Protected Route
```javascript
import RoleBasedRoute from './components/RoleBasedRoute';

<Route 
  path="/admin/users" 
  element={
    <RoleBasedRoute allowedRoles={['admin']}>
      <AdminUsersPage />
    </RoleBasedRoute>
  } 
/>
```

### Adding New Navigation Items
```javascript
// In src/config/navigation.js
{
  id: 'new-feature',
  label: 'New Feature',
  path: '/new-feature',
  icon: 'NewIcon',
  visibleRoles: ['admin', 'teacher'],
  description: 'Description of the new feature'
}
```

### Creating Role-Specific Components
```javascript
// Check user role in components
const { user } = useAuth();

if (user.role === 'admin') {
  // Admin-specific functionality
} else if (user.role === 'teacher') {
  // Teacher-specific functionality
}
```

## Security Features

1. **Authentication Required**: All protected routes require valid authentication
2. **Role Validation**: Routes check user roles against allowed permissions
3. **Navigation Filtering**: Sidebar only shows accessible navigation items
4. **Automatic Redirects**: Unauthorized access redirects to appropriate dashboard
5. **Route Protection**: Server-side validation should complement client-side checks

## Future Enhancements

1. **Permission Granularity**: More fine-grained permissions within roles
2. **Dynamic Navigation**: Navigation items based on user permissions
3. **Audit Logging**: Track user access and actions
4. **Role Hierarchy**: Support for role inheritance
5. **Custom Roles**: Allow admins to create custom roles

## Best Practices

1. **Always validate on server-side**: Client-side protection is for UX only
2. **Use role-based components**: Create separate components for different roles
3. **Implement proper error handling**: Handle unauthorized access gracefully
4. **Keep navigation config updated**: Maintain accurate role permissions
5. **Test all role combinations**: Ensure proper access control

## Troubleshooting

### Common Issues

1. **Navigation not showing**: Check if user role is in `visibleRoles` array
2. **Route access denied**: Verify route is included in navigation config
3. **Dashboard not loading**: Ensure user object has valid role property
4. **Icons not displaying**: Check icon mapping in `iconMap` object

### Debug Steps

1. Check user authentication status
2. Verify user role in AuthContext
3. Review navigation configuration
4. Check route protection components
5. Validate icon mappings
