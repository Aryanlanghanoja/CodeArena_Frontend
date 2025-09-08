import api from './api';

const learningPathService = {
  // Learning Path CRUD operations
  getAllLearningPaths: async () => {
    const response = await api.get('/learning-paths');
    return response.data;
  },

  getPublishedLearningPaths: async () => {
    const response = await api.get('/learning-paths/browse');
    return response.data;
  },

  getLearningPath: async (id) => {
    const response = await api.get(`/learning-paths/${id}`);
    return response.data;
  },

  createLearningPath: async (data) => {
    const response = await api.post('/learning-paths', data);
    return response.data;
  },

  updateLearningPath: async (id, data) => {
    const response = await api.put(`/learning-paths/${id}`, data);
    return response.data;
  },

  deleteLearningPath: async (id) => {
    const response = await api.delete(`/learning-paths/${id}`);
    return response.data;
  },

  joinLearningPath: async (id) => {
    const response = await api.post(`/learning-paths/${id}/join`);
    return response.data;
  },

  leaveLearningPath: async (id) => {
    const response = await api.post(`/learning-paths/${id}/leave`);
    return response.data;
  },

  getLearningPathStats: async (id) => {
    const response = await api.get(`/learning-paths/${id}/stats`);
    return response.data;
  },

  // Module operations
  getModules: async (pathId) => {
    const response = await api.get(`/learning-paths/${pathId}/modules`);
    return response.data;
  },

  getModule: async (pathId, moduleId) => {
    const response = await api.get(`/learning-paths/${pathId}/modules/${moduleId}`);
    return response.data;
  },

  createModule: async (pathId, data) => {
    const response = await api.post(`/learning-paths/${pathId}/modules`, data);
    return response.data;
  },

  updateModule: async (pathId, moduleId, data) => {
    const response = await api.put(`/learning-paths/${pathId}/modules/${moduleId}`, data);
    return response.data;
  },

  deleteModule: async (pathId, moduleId) => {
    const response = await api.delete(`/learning-paths/${pathId}/modules/${moduleId}`);
    return response.data;
  },

  addQuestionToModule: async (pathId, moduleId, questionId, orderIndex = null) => {
    const response = await api.post(`/learning-paths/${pathId}/modules/${moduleId}/questions`, {
      question_id: questionId,
      order_index: orderIndex
    });
    return response.data;
  },

  removeQuestionFromModule: async (pathId, moduleId, questionId) => {
    const response = await api.delete(`/learning-paths/${pathId}/modules/${moduleId}/questions/${questionId}`);
    return response.data;
  },

  reorderModules: async (pathId, moduleOrders) => {
    const response = await api.post(`/learning-paths/${pathId}/modules/reorder`, {
      module_orders: moduleOrders
    });
    return response.data;
  },

  // Resource operations
  getAllResources: async () => {
    const response = await api.get('/resources');
    return response.data;
  },

  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },

  updateResource: async (id, data) => {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },

  attachResourceToModule: async (resourceId, moduleId) => {
    const response = await api.post(`/resources/${resourceId}/modules/${moduleId}`);
    return response.data;
  },

  detachResourceFromModule: async (resourceId, moduleId) => {
    const response = await api.delete(`/resources/${resourceId}/modules/${moduleId}`);
    return response.data;
  },

  attachResourceToQuestion: async (resourceId, questionId) => {
    const response = await api.post(`/resources/${resourceId}/questions/${questionId}`);
    return response.data;
  },

  detachResourceFromQuestion: async (resourceId, questionId) => {
    const response = await api.delete(`/resources/${resourceId}/questions/${questionId}`);
    return response.data;
  },

  // Student Notes operations
  getStudentNotes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.module_id) params.append('module_id', filters.module_id);
    if (filters.question_id) params.append('question_id', filters.question_id);
    
    const response = await api.get(`/notes?${params.toString()}`);
    return response.data;
  },

  getNote: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  createOrUpdateNote: async (data) => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  updateNote: async (id, data) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  getModuleNote: async (moduleId) => {
    const response = await api.get(`/notes/modules/${moduleId}`);
    return response.data;
  },

  getQuestionNote: async (questionId) => {
    const response = await api.get(`/notes/questions/${questionId}`);
    return response.data;
  },

  // Progress operations
  getPathProgress: async (pathId) => {
    const response = await api.get(`/progress/paths/${pathId}`);
    return response.data;
  },

  updateQuestionProgress: async (pathId, moduleId, questionId, isCompleted) => {
    const response = await api.patch(`/progress/paths/${pathId}/modules/${moduleId}/questions/${questionId}`, {
      is_completed: isCompleted
    });
    return response.data;
  },

  markQuestionCompleted: async (pathId, moduleId, questionId) => {
    const response = await api.post(`/progress/paths/${pathId}/modules/${moduleId}/questions/${questionId}/complete`);
    return response.data;
  },

  getPathStats: async (pathId) => {
    const response = await api.get(`/progress/paths/${pathId}/stats`);
    return response.data;
  },

  getStudentOverallProgress: async () => {
    const response = await api.get('/progress/student/overall');
    return response.data;
  }
};

export default learningPathService;
