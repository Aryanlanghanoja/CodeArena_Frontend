/**
 * Classes Service - Handles all class-related API operations
 * Integrates with the backend Classes API for role-based functionality
 */

const API_BASE_URL = '/api/classes';

class ClassesService {
  constructor() {
    this.token = localStorage.getItem('codeArenaToken');
  }

  // Get authentication headers
  getHeaders() {
    // Refresh token from localStorage in case it was updated
    this.token = localStorage.getItem('codeArenaToken');
    
    if (!this.token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Update token when it changes
  updateToken(newToken) {
    this.token = newToken;
    localStorage.setItem('codeArenaToken', newToken);
  }

  // Create a new class (Teacher only)
  async createClass(classData) {
    try {
      const headers = this.getHeaders();
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(classData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create class');
      }

      return result;
    } catch (error) {
      console.error('Service: Error creating class:', error);
      throw error;
    }
  }

  // List classes based on user role
  async listClasses() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch classes');
      }

      return result;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  // Get class details by join code
  async getClassDetails(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch class details');
      }

      return result;
    } catch (error) {
      console.error('Error fetching class details:', error);
      throw error;
    }
  }

  // Join a class (Student only)
  async joinClass(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/join`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ join_code: joinCode })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to join class');
      }

      return result;
    } catch (error) {
      console.error('Error joining class:', error);
      throw error;
    }
  }

  // List class members
  async listClassMembers(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/members`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch class members');
      }

      return result;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  // Promote a member to assistant
  async promoteMember(joinCode, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/members/${userId}/promote`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to promote member');
      }

      return result;
    } catch (error) {
      console.error('Error promoting member:', error);
      throw error;
    }
  }

  // Demote an assistant to student
  async demoteMember(joinCode, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/members/${userId}/demote`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to demote member');
      }

      return result;
    } catch (error) {
      console.error('Error demoting member:', error);
      throw error;
    }
  }

  // Remove a member from class
  async removeMember(joinCode, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/members/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove member');
      }

      return result;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Update class details
  async updateClass(joinCode, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update class');
      }

      return result;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // Delete a class
  async deleteClass(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete class');
      }

      return result;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Regenerate join code
  async regenerateJoinCode(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/regenerate-code`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to regenerate join code');
      }

      return result;
    } catch (error) {
      console.error('Error regenerating join code:', error);
      throw error;
    }
  }

  // Get class statistics
  async getClassStats(joinCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${joinCode}/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch class statistics');
      }

      return result;
    } catch (error) {
      console.error('Error fetching class statistics:', error);
      throw error;
    }
  }

  // Dashboard-specific methods

  // Get classes for admin dashboard (all classes)
  async getAdminDashboardClasses() {
    try {
      const result = await this.listClasses();
      return {
        total: result.data.total,
        classes: result.data.classes.slice(0, 5), // Show 5 most recent
        recentActivity: this.formatRecentActivity(result.data.classes)
      };
    } catch (error) {
      console.error('Error fetching admin dashboard classes:', error);
      return { total: 0, classes: [], recentActivity: [] };
    }
  }

  // Get classes for teacher dashboard (own classes)
  async getTeacherDashboardClasses() {
    try {
      const result = await this.listClasses();
      const teacherClasses = result.data.classes;
      
      // Calculate teacher-specific stats
      const stats = {
        totalClasses: result.data.total,
        totalStudents: teacherClasses.reduce((sum, classItem) => 
          sum + (classItem.student_count || 0), 0
        ),
        averageClassSize: teacherClasses.length > 0 
          ? Math.round(teacherClasses.reduce((sum, classItem) => 
              sum + (classItem.student_count || 0), 0) / teacherClasses.length)
          : 0
      };

      return {
        classes: teacherClasses,
        stats
      };
    } catch (error) {
      console.error('Error fetching teacher dashboard classes:', error);
      return { classes: [], stats: { totalClasses: 0, totalStudents: 0, averageClassSize: 0 } };
    }
  }

  // Get classes for student dashboard (enrolled classes)
  async getStudentDashboardClasses() {
    try {
      const result = await this.listClasses();
      const enrolledClasses = result.data.classes;
      
      // Calculate student-specific stats
      const stats = {
        totalClasses: result.data.total,
        totalStudents: enrolledClasses.reduce((sum, classItem) => 
          sum + (classItem.student_count || 0), 0
        )
      };

      return {
        classes: enrolledClasses,
        stats
      };
    } catch (error) {
      console.error('Error fetching student dashboard classes:', error);
      return { classes: [], stats: { totalClasses: 0, totalStudents: 0 } };
    }
  }

  // Format recent activity for admin dashboard
  formatRecentActivity(classes) {
    return classes.slice(0, 5).map(classItem => ({
      id: classItem.join_code,
      type: 'class_created',
      user: classItem.creator?.name || 'Unknown Teacher',
      class: classItem.class_name,
      time: this.formatTimeAgo(classItem.created_at),
      role: 'teacher'
    }));
  }

  // Format time ago for display
  formatTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }

  // Validate join code format
  validateJoinCode(joinCode) {
    return /^[A-Z0-9]{8}$/.test(joinCode);
  }

  // Generate a random join code (for testing purposes)
  generateRandomJoinCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Create and export a singleton instance
const classesService = new ClassesService();

export default classesService;
