/**
 * Questions Service - Singleton service for question bank API interactions
 * Handles all question-related API calls with proper authentication and error handling
 */

class QuestionsService {
    constructor() {
        this.token = localStorage.getItem('codeArenaToken');
        this.API_BASE_URL = '/api/questions';
    }

    /**
     * Update the authentication token
     */
    updateToken(token) {
        this.token = token;
        localStorage.setItem('codeArenaToken', token);
    }

    /**
     * Get headers for API requests
     */
    getHeaders() {
        this.token = localStorage.getItem('codeArenaToken');
        if (!this.token) {
            throw new Error('No authentication token found');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
        };
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * List questions with optional filters
     */
    async listQuestions(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
            if (filters.tags) queryParams.append('tags', filters.tags);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.page) queryParams.append('page', filters.page);

            const url = `${this.API_BASE_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error listing questions:', error);
            throw error;
        }
    }

    /**
     * Get a specific question by ID
     */
    async getQuestion(questionId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${questionId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error getting question:', error);
            throw error;
        }
    }

    /**
     * Create a new question
     */
    async createQuestion(questionData) {
        try {
            const response = await fetch(this.API_BASE_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(questionData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    }

    /**
     * Update an existing question
     */
    async updateQuestion(questionId, questionData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${questionId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(questionData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    }

    /**
     * Delete a question
     */
    async deleteQuestion(questionId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${questionId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }

    /**
     * Add a testcase to a question
     */
    async addTestcase(questionId, testcaseData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${questionId}/testcases`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(testcaseData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error adding testcase:', error);
            throw error;
        }
    }

    /**
     * Get question statistics (Admin only)
     */
    async getStats() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/stats`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error getting question stats:', error);
            throw error;
        }
    }

    /**
     * Get questions for admin dashboard
     */
    async getAdminDashboardQuestions() {
        try {
            const result = await this.listQuestions();
            if (result.success) {
                return {
                    success: true,
                    data: {
                        questions: result.data.data || [],
                        total: result.data.total || 0,
                        currentPage: result.data.current_page || 1,
                        lastPage: result.data.last_page || 1
                    }
                };
            }
            return result;
        } catch (error) {
            console.error('Error getting admin dashboard questions:', error);
            throw error;
        }
    }

    /**
     * Get questions for teacher dashboard
     */
    async getTeacherDashboardQuestions() {
        try {
            const result = await this.listQuestions();
            if (result.success) {
                return {
                    success: true,
                    data: {
                        questions: result.data.data || [],
                        total: result.data.total || 0,
                        currentPage: result.data.current_page || 1,
                        lastPage: result.data.last_page || 1
                    }
                };
            }
            return result;
        } catch (error) {
            console.error('Error getting teacher dashboard questions:', error);
            throw error;
        }
    }

    /**
     * Get questions for student practice
     */
    async getStudentPracticeQuestions(filters = {}) {
        try {
            const result = await this.listQuestions(filters);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        questions: result.data.data || [],
                        total: result.data.total || 0,
                        currentPage: result.data.current_page || 1,
                        lastPage: result.data.last_page || 1
                    }
                };
            }
            return result;
        } catch (error) {
            console.error('Error getting student practice questions:', error);
            throw error;
        }
    }

    /**
     * Search questions by text
     */
    async searchQuestions(searchTerm, filters = {}) {
        try {
            return await this.listQuestions({
                ...filters,
                search: searchTerm
            });
        } catch (error) {
            console.error('Error searching questions:', error);
            throw error;
        }
    }

    /**
     * Filter questions by difficulty
     */
    async filterByDifficulty(difficulty, filters = {}) {
        try {
            return await this.listQuestions({
                ...filters,
                difficulty: difficulty
            });
        } catch (error) {
            console.error('Error filtering questions by difficulty:', error);
            throw error;
        }
    }

    /**
     * Filter questions by tags
     */
    async filterByTags(tags, filters = {}) {
        try {
            return await this.listQuestions({
                ...filters,
                tags: Array.isArray(tags) ? tags.join(',') : tags
            });
        } catch (error) {
            console.error('Error filtering questions by tags:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const questionsService = new QuestionsService();
export default questionsService;
