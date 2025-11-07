import api from './api';

const proctorService = {
  logEvent: async ({ type, page, details }) => {
    try {
      return await api.post('/proctor/log', { type, page, details });
    } catch (e) {
      // Swallow client errors to avoid impacting UX
      return { success: false };
    }
  }
};

export default proctorService;


