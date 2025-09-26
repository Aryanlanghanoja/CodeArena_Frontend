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
    try {
      const response = await api.get('/exams');
      const result = response.data;
      const localDrafts = this.getLocalDrafts();
      const data = Array.isArray(result?.data) ? result.data : [];
      return { success: true, data: [...localDrafts, ...data] };
    } catch (e) {
      return { success: true, data: this.getLocalDrafts() };
    }
  }

  // Create exam (stub until backend endpoint exists)
  async createExam(payload) {
    try {
      const response = await api.post('/exams', payload);
      return response.data;
    } catch (e) {
      // Fallback to local draft to avoid losing user work
      const draft = this.saveLocalDraft(payload);
      return { success: true, data: draft, message: 'Saved locally (API not available)' };
    }
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

  // Optional: placeholder to fetch exam details when backend is ready
  async getExamDetails(examId) {
    // No dedicated endpoint found yet; return null so callers can fallback to mock data
    return { success: false, message: 'Not implemented' };
  }
}

export default new ExamsService();


