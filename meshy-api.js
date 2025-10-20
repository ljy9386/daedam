/**
 * Meshy 3D AI API 연동 모듈
 * API Key: msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV
 */

class MeshyAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.meshy.ai/v1';
    }

    /**
     * 텍스트로 3D 모델 생성
     * @param {string} prompt - 3D 모델 생성 프롬프트
     * @param {object} options - 추가 옵션
     * @returns {Promise<object>} 생성 결과
     */
    async textTo3D(prompt, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/text-to-3d`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Text-to-3D 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 이미지로 3D 모델 생성
     * @param {string} imageUrl - 입력 이미지 URL
     * @param {object} options - 추가 옵션
     * @returns {Promise<object>} 생성 결과
     */
    async imageTo3D(imageUrl, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/image-to-3d`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Image-to-3D 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 작업 상태 확인
     * @param {string} taskId - 작업 ID
     * @returns {Promise<object>} 작업 상태
     */
    async getTaskStatus(taskId) {
        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('작업 상태 확인 오류:', error);
            throw error;
        }
    }

    /**
     * 생성된 3D 모델 다운로드
     * @param {string} taskId - 작업 ID
     * @returns {Promise<object>} 다운로드 정보
     */
    async downloadModel(taskId) {
        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('모델 다운로드 오류:', error);
            throw error;
        }
    }

    /**
     * API 사용량 및 크레딧 확인
     * @returns {Promise<object>} 사용량 정보
     */
    async getUsage() {
        try {
            const response = await fetch(`${this.baseURL}/usage`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('사용량 확인 오류:', error);
            throw error;
        }
    }
}

// Meshy API 인스턴스 생성
const meshyAPI = new MeshyAPI('msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV');

// 사용 예시 함수들
async function generate3DFromText(prompt) {
    try {
        console.log(`3D 모델 생성 시작: "${prompt}"`);
        const result = await meshyAPI.textTo3D(prompt);
        console.log('생성 결과:', result);
        return result;
    } catch (error) {
        console.error('3D 모델 생성 실패:', error);
        return { error: error.message };
    }
}

async function generate3DFromImage(imageUrl) {
    try {
        console.log(`이미지로 3D 모델 생성 시작: "${imageUrl}"`);
        const result = await meshyAPI.imageTo3D(imageUrl);
        console.log('생성 결과:', result);
        return result;
    } catch (error) {
        console.error('이미지로 3D 모델 생성 실패:', error);
        return { error: error.message };
    }
}

async function checkTaskStatus(taskId) {
    try {
        console.log(`작업 상태 확인: ${taskId}`);
        const result = await meshyAPI.getTaskStatus(taskId);
        console.log('작업 상태:', result);
        return result;
    } catch (error) {
        console.error('작업 상태 확인 실패:', error);
        return { error: error.message };
    }
}

async function downloadGeneratedModel(taskId) {
    try {
        console.log(`모델 다운로드: ${taskId}`);
        const result = await meshyAPI.downloadModel(taskId);
        console.log('다운로드 정보:', result);
        return result;
    } catch (error) {
        console.error('모델 다운로드 실패:', error);
        return { error: error.message };
    }
}

async function checkAPIUsage() {
    try {
        console.log('API 사용량 확인 중...');
        const result = await meshyAPI.getUsage();
        console.log('사용량 정보:', result);
        return result;
    } catch (error) {
        console.error('사용량 확인 실패:', error);
        return { error: error.message };
    }
}

// 모듈 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MeshyAPI,
        meshyAPI,
        generate3DFromText,
        generate3DFromImage,
        checkTaskStatus,
        downloadGeneratedModel,
        checkAPIUsage
    };
}

// 브라우저 환경에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
    window.MeshyAPI = MeshyAPI;
    window.meshyAPI = meshyAPI;
    window.generate3DFromText = generate3DFromText;
    window.generate3DFromImage = generate3DFromImage;
    window.checkTaskStatus = checkTaskStatus;
    window.downloadGeneratedModel = downloadGeneratedModel;
    window.checkAPIUsage = checkAPIUsage;
}
