import api from './api';

class Judge0Service {
    constructor() {
        // this.API_BASE_URL = '/api';
        this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    }

    /**
     * Get authentication headers
     */
    getHeaders() {
        const token = localStorage.getItem('codeArenaToken');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Practice run - execute code against visible testcases only
     * This uses the backend API which handles Judge0 integration
     */
    async practiceRun(data) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/practice/run`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to run code');
            }

            return result;
        } catch (error) {
            console.error('Error in practice run:', error);
            throw error;
        }
    }

    /**
     * Submit code for evaluation (all testcases - public + hidden)
     * This uses the backend API which handles Judge0 integration
     */
    async submitCode(data) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/practice/submit`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit code');
            }

            return result;
        } catch (error) {
            console.error('Error in code submission:', error);
            throw error;
        }
    }

    /**
     * Assignment run - execute code in assignment context (optionally scoped to visible tests)
     */
    async assignmentRun(data) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/assignments/run`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to run assignment code');
            }
            return result;
        } catch (error) {
            console.error('Error in assignment run:', error);
            throw error;
        }
    }

    /**
     * Assignment submit - submit code for grading in assignment context
     */
    async assignmentSubmit(data) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/assignments/submit`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit assignment code');
            }
            return result;
        } catch (error) {
            console.error('Error in assignment submission:', error);
            throw error;
        }
    }

    /**
     * Get assignment submissions list (optionally filter by question)
     */
    async assignmentGetSubmissions({ assignment_id, class_id, question_id }) {
        try {
            const params = new URLSearchParams();
            if (assignment_id) params.append('assignment_id', assignment_id);
            if (class_id) params.append('class_id', class_id);
            if (question_id) params.append('question_id', question_id);
            const response = await fetch(`${this.API_BASE_URL}/assignments/submissions?${params.toString()}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch assignment submissions');
            }
            return result;
        } catch (error) {
            console.error('Error fetching assignment submissions:', error);
            throw error;
        }
    }

    /**
     * Get details (including public testcase breakdown) for a specific assignment submission
     */
    async assignmentGetSubmissionDetails(submission_id) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/assignments/submissions/${submission_id}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch submission details');
            }
            return result;
        } catch (error) {
            console.error('Error fetching submission details:', error);
            throw error;
        }
    }

    /**
     * Get supported languages from Judge0
     */
    async getLanguages() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/judge0/languages`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch languages');
            }

            return result;
        } catch (error) {
            console.error('Error fetching languages:', error);
            throw error;
        }
    }

    /**
     * Check Judge0 service status
     */
    async getServiceStatus() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/judge0/status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to check service status');
            }

            return result;
        } catch (error) {
            console.error('Error checking service status:', error);
            throw error;
        }
    }

    /**
     * Get Judge0 workers status
     */
    async getWorkersStatus() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/judge0/workers`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to get workers status');
            }

            return result;
        } catch (error) {
            console.error('Error getting workers status:', error);
            throw error;
        }
    }

    /**
     * Direct execution for custom input (bypasses testcases)
     * This is a simplified version that can be used for custom input testing
     */
    async executeCode(sourceCode, languageId, stdin = '') {
        try {
            // For now, we'll use a mock response since we don't have direct Judge0 access
            // In a real implementation, you might want to add a direct execution endpoint
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        stdout: `Mock output for input: ${stdin}`,
                        stderr: '',
                        time: Math.random() * 1000,
                        memory: Math.random() * 10000,
                        status: { id: 3, description: 'Accepted' }
                    });
                }, 1000);
            });
        } catch (error) {
            console.error('Error executing code:', error);
            throw error;
        }
    }
}

export default new Judge0Service();
