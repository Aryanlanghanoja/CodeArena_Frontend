import api from './api';

class Judge0Service {
    constructor() {
        this.API_BASE_URL = '/api';
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
