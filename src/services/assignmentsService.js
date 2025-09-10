/**
 * Assignments Service - Handles all assignment-related API operations
 */

import api from './api';

class AssignmentsService {
  constructor() {
    // No need to manually handle tokens as api instance handles it
  }

  // Create a new assignment
  async createAssignment(joinCode, assignmentData) {
    try {
      const response = await api.post(`/classes/${joinCode}/assignments`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Service: Error creating assignment:', error);
      throw error;
    }
  }

  // Get assignments for a class
  async getClassAssignments(joinCode) {
    try {
      const response = await api.get(`/classes/${joinCode}/assignments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  // Get assignment details
  async getAssignmentDetails(assignmentId) {
    try {
      const response = await api.get(`/classes/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      throw error;
    }
  }

  // Update assignment
  async updateAssignment(assignmentId, updateData) {
    try {
      const response = await api.put(`/classes/assignments/${assignmentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  // Delete assignment
  async deleteAssignment(assignmentId) {
    try {
      const response = await api.delete(`/classes/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Get available questions for assignment creation
  async getAvailableQuestions() {
    try {
      const response = await api.get('/questions');
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  // Format assignment data for display
  formatAssignmentData(assignment) {
    return {
      id: assignment.assignment_id,
      title: assignment.title,
      description: assignment.description,
      questionIds: assignment.question_ids,
      questions: assignment.questions || [],
      dueDate: assignment.due_date,
      totalPoints: assignment.total_points,
      status: assignment.status,
      createdAt: assignment.created_at,
      createdBy: assignment.creator,
      isOverdue: assignment.due_date ? new Date(assignment.due_date) < new Date() : false,
      submissionCount: assignment.submission_count || 0
    };
  }

  // Calculate assignment statistics
  calculateAssignmentStats(assignments) {
    const total = assignments.length;
    const published = assignments.filter(a => a.status === 'published').length;
    const draft = assignments.filter(a => a.status === 'draft').length;
    const closed = assignments.filter(a => a.status === 'closed').length;
    const overdue = assignments.filter(a => {
      return a.due_date && new Date(a.due_date) < new Date() && a.status === 'published';
    }).length;

    return {
      total,
      published,
      draft,
      closed,
      overdue
    };
  }
}

// Create and export a singleton instance
const assignmentsService = new AssignmentsService();

export default assignmentsService;
