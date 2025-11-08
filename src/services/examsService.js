import api from './api';

class ExamsService {
  constructor() {}

  async submitSolution({ examId, questionId, sourceCode, languageId }) {
    const payload = { question_id: questionId, code: sourceCode, language_id: languageId };
    const response = await api.post(`/exams/${examId}/submit`, payload);
    return response.data;
  }

  // List exams for teacher (stub until backend endpoint exists)
  async listExams() {
    const response = await api.get('/exams');
    return response.data;
  }

  // Create exam (stub until backend endpoint exists)
  async createExam(payload) {
    const response = await api.post('/exams', payload);
    return response.data;
  }

  async updateExam(examId, payload) {
    try {
      if (String(examId).startsWith('local-')) {
        // Update local draft
        const all = this.getLocalDrafts();
        const idx = all.findIndex(e => e.id === examId);
        if (idx >= 0) {
          all[idx] = { ...all[idx], ...payload };
          try { localStorage.setItem('local_exam_drafts', JSON.stringify(all)); } catch {}
          return { success: true, data: all[idx] };
        }
        return { success: false, message: 'Local draft not found' };
      }
      const response = await api.put(`/exams/${examId}`, payload);
      return response.data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteExam(examId) {
    try {
      if (String(examId).startsWith('local-')) {
        const removed = this.deleteLocalDraft(examId);
        return { success: removed };
      }
      const response = await api.delete(`/exams/${examId}`);
      return response.data;
    } catch (e) {
      const removed = this.deleteLocalDraft(examId);
      if (removed) return { success: true };
      return { success: false, message: e.message };
    }
  }

  // Local drafts helpers
  getLocalDrafts() {
    try {
      const raw = localStorage.getItem('local_exam_drafts');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  saveLocalDraft(payload) {
    const draft = {
      id: `local-${Date.now()}`,
      title: payload.title,
      class: { id: payload.class_ids?.[0], name: 'Multiple Classes', code: '-' },
      startDate: payload.start_date,
      endDate: payload.end_date,
      startTime: payload.start_time,
      endTime: payload.end_time,
      duration: payload.duration_minutes,
      totalMarks: payload.total_marks,
      questions: (payload.question_ids || []).length,
      status: payload.status || 'draft',
      instructions: payload.instructions || '',
      allowedLanguages: payload.allowed_languages || [],
      totalStudents: 0,
      submittedStudents: 0,
      averageScore: null,
      questionsList: payload.question_ids || [],
      isLocalDraft: true,
    };
    const all = this.getLocalDrafts();
    all.unshift(draft);
    try { localStorage.setItem('local_exam_drafts', JSON.stringify(all)); } catch {}
    return draft;
  }

  deleteLocalDraft(examId) {
    const all = this.getLocalDrafts();
    const next = all.filter(e => e.id !== examId);
    if (next.length !== all.length) {
      try { localStorage.setItem('local_exam_drafts', JSON.stringify(next)); } catch {}
      return true;
    }
    return false;
  }

  // Fetch exam details for students to take exam
  async getExamDetails(examId) {
    try {
      const response = await api.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam details:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  // Get exam submissions for teachers
  async getExamSubmissions(examId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.question_id) queryParams.append('question_id', params.question_id);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.roll_number) queryParams.append('roll_number', params.roll_number);
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const url = `/exams/${examId}/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam submissions:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  // Exam session management
  async startExamSession(examId, deviceInfo = null) {
    try {
      const payload = deviceInfo ? { device_info: deviceInfo } : {};
      const response = await api.post(`/exams/${examId}/session/start`, payload);
      return response.data;
    } catch (error) {
      console.error('Error starting exam session:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async pauseExamSession(examId) {
    try {
      const response = await api.post(`/exams/${examId}/session/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing exam session:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async getExamSessionStatus(examId) {
    try {
      const response = await api.get(`/exams/${examId}/session/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam session status:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async updateExamSessionActivity(examId) {
    try {
      const response = await api.post(`/exams/${examId}/session/heartbeat`);
      return response.data;
    } catch (error) {
      console.error('Error updating exam session activity:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
}

export default new ExamsService();


