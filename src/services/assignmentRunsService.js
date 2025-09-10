// Assignment Runs Service - abstracts run/submit logic for assignment solving

import judge0Service from './judge0Service';

class AssignmentRunsService {
  // Run code for a given question (detached from UI)
  async runSolution({ sourceCode, languageId, stdin = '', questionId, assignmentId, classId }) {
    // Prefer assignment-specific endpoint
    const response = await judge0Service.assignmentRun({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      question_id: questionId,
      assignment_id: assignmentId,
      class_id: classId,
    });
    return response;
  }

  // Submit code for grading against a question in an assignment
  async submitSolution({ sourceCode, languageId, questionId, assignmentId, classId }) {
    // Prefer assignment-specific endpoint
    const response = await judge0Service.assignmentSubmit({
      source_code: sourceCode,
      language_id: languageId,
      question_id: questionId,
      assignment_id: assignmentId,
      class_id: classId,
    });
    return response;
  }

  // List submissions for an assignment (optionally per question)
  async listSubmissions({ assignmentId, classId, questionId }) {
    const response = await judge0Service.assignmentGetSubmissions({
      assignment_id: assignmentId,
      class_id: classId,
      question_id: questionId,
    });
    return response;
  }

  // Get submission details for a specific submission id
  async getSubmissionDetails(submissionId) {
    const response = await judge0Service.assignmentGetSubmissionDetails(submissionId);
    return response;
  }
}

const assignmentRunsService = new AssignmentRunsService();
export default assignmentRunsService;




