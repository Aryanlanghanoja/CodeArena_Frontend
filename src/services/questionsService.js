import api from './api';

const questionsService = {
  // Get all questions with optional filters
  getQuestions: async (params = {}) => {
    console.log('questionsService.getQuestions called with params:', params);
    const response = await api.get('/questions', { params });
    console.log('questionsService.getQuestions response:', response.data);
    return response.data;
  },

  // Get a specific question by ID
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create a new question
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  // Update an existing question
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Get questions by difficulty
  getQuestionsByDifficulty: async (difficulty) => {
    const response = await api.get('/questions', { 
      params: { difficulty } 
    });
    return response.data;
  },

  // Get questions by tags
  getQuestionsByTags: async (tags) => {
    const response = await api.get('/questions', { 
      params: { tags } 
    });
    return response.data;
  },

  // Get questions by company tags
  getQuestionsByCompanyTags: async (companyTags) => {
    const response = await api.get('/questions', { 
      params: { company_tags: companyTags } 
    });
    return response.data;
  },

  // Search questions
  searchQuestions: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get visible questions (for students)
  getVisibleQuestions: async (filters = {}) => {
    const params = {
      is_visible: true,
      ...filters
    };
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get questions created by current user (for teachers)
  getMyQuestions: async (filters = {}) => {
    const response = await api.get('/questions', { params: filters });
    return response.data;
  },

  // Get all unique tags
  getAllTags: async () => {
    const response = await api.get('/questions');
    // Handle paginated response structure
    const questions = response.data?.data || response.data || [];
    const tags = new Set();
    const companyTags = new Set();
    
    if (Array.isArray(questions)) {
      questions.forEach(question => {
        if (question.tags) {
          question.tags.split(',').forEach(tag => {
            const trimmedTag = tag.trim();
            if (trimmedTag) {
              tags.add(trimmedTag);
            }
          });
        }
        if (question.company_tags) {
          question.company_tags.split(',').forEach(tag => {
            const trimmedTag = tag.trim();
            if (trimmedTag) {
              companyTags.add(trimmedTag);
            }
          });
        }
      });
    }
    
                return {
      tags: Array.from(tags).sort(),
      companyTags: Array.from(companyTags).sort()
    };
  },

  // Get all unique difficulties
  getAllDifficulties: async () => {
    const response = await api.get('/questions');
    // Handle paginated response structure
    const questions = response.data?.data || response.data || [];
    const difficulties = new Set();
    
    if (Array.isArray(questions)) {
      questions.forEach(question => {
        if (question.difficulty && question.difficulty.trim()) {
          difficulties.add(question.difficulty);
        }
      });
    }
    
    return Array.from(difficulties).sort();
  },

  // Teacher-specific methods
  getTeacherDashboardQuestions: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  // Admin-specific methods
  getAdminDashboardQuestions: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/questions');
    // Handle paginated response structure
    const questions = response.data?.data || response.data || [];
    
    const stats = {
      total: Array.isArray(questions) ? questions.length : 0,
      byDifficulty: {
        Easy: Array.isArray(questions) ? questions.filter(q => q.difficulty === 'Easy').length : 0,
        Medium: Array.isArray(questions) ? questions.filter(q => q.difficulty === 'Medium').length : 0,
        Hard: Array.isArray(questions) ? questions.filter(q => q.difficulty === 'Hard').length : 0
      },
      byVisibility: {
        visible: Array.isArray(questions) ? questions.filter(q => q.is_visible).length : 0,
        hidden: Array.isArray(questions) ? questions.filter(q => !q.is_visible).length : 0
      }
    };
    
    return { success: true, data: stats };
  },

  // Testcase management
  addTestcase: async (questionId, testcaseData) => {
    const response = await api.post(`/questions/${questionId}/testcases`, testcaseData);
    return response.data;
  },

  updateTestcase: async (questionId, testcaseId, testcaseData) => {
    const response = await api.put(`/questions/${questionId}/testcases/${testcaseId}`, testcaseData);
    return response.data;
  },

  deleteTestcase: async (questionId, testcaseId) => {
    const response = await api.delete(`/questions/${questionId}/testcases/${testcaseId}`);
    return response.data;
  },

  // Get past submissions for a question
  getPastSubmissions: async (questionId) => {
    const response = await api.get('/submissions', {
      params: { question_id: questionId }
    });
    return response.data;
  },

  // Get submission details with testcase results
  getSubmissionDetails: async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}/details`);
    return response.data;
  }
};

export default questionsService;