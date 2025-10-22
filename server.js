const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:wmfdksk123@minimalshop.p2lpoe3.mongodb.net/daedam_consultations?retryWrites=true&w=majority&appName=MinimalShop';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 미들웨어
app.use(cors({
    origin: [
        'https://daedam410.com',
        'https://www.daedam410.com',
        'http://localhost:3000', // 개발용
        'http://127.0.0.1:3000'  // 개발용
    ],
    credentials: true
}));
app.use(express.json());

// 상담 스키마 정의
const consultationSchema = new mongoose.Schema({
    name: { type: String, required: true },           // 이름
    company: { type: String, required: true },        // 회사명
    phone: { type: String, required: true },          // 전화번호
    businessType: { type: String, required: true },   // 유형
    investmentAmount: { type: String, required: true }, // 투자금액대
    createdAt: { type: Date, default: Date.now },     // 생성일시
    updatedAt: { type: Date, default: Date.now }      // 수정일시
});

const Consultation = mongoose.model('Consultation', consultationSchema);

// 상담 데이터 저장 API
app.post('/api/consultations', async (req, res) => {
    try {
        const { name, company, phone, businessType, investmentAmount } = req.body;
        
        // 필수 필드 검증
        if (!name || !company || !phone || !businessType || !investmentAmount) {
            return res.status(400).json({ 
                success: false, 
                message: '모든 필수 항목을 입력해주세요.' 
            });
        }

        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: '전화번호 형식이 올바르지 않습니다. (010-1234-5678)' 
            });
        }

        // 새 상담 데이터 생성
        const consultation = new Consultation({
            name,
            company,
            phone,
            businessType,
            investmentAmount
        });

        // 데이터베이스에 저장
        await consultation.save();

        res.json({ 
            success: true, 
            message: '상담 요청이 성공적으로 접수되었습니다.',
            data: consultation
        });

    } catch (error) {
        console.error('상담 데이터 저장 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
        });
    }
});

// 상담 데이터 조회 API (관리자용)
app.get('/api/consultations', async (req, res) => {
    try {
        const consultations = await Consultation.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json({ 
            success: true, 
            data: consultations 
        });

    } catch (error) {
        console.error('상담 데이터 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '데이터 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 상담 데이터 삭제 API (관리자용)
app.delete('/api/consultations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const consultation = await Consultation.findByIdAndDelete(id);

        if (!consultation) {
            return res.status(404).json({ 
                success: false, 
                message: '상담 데이터를 찾을 수 없습니다.' 
            });
        }

        res.json({ 
            success: true, 
            message: '상담 데이터가 성공적으로 삭제되었습니다.',
            data: consultation
        });

    } catch (error) {
        console.error('상담 데이터 삭제 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '삭제 중 오류가 발생했습니다.' 
        });
    }
});

// 서버 IP 확인 API (알리고 발송서버 IP 등록용)
app.get('/api/server-info', (req, res) => {
    try {
        const serverInfo = {
            serverIP: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
            forwardedIP: req.headers['x-forwarded-for'],
            realIP: req.headers['x-real-ip'],
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            headers: {
                'x-forwarded-for': req.headers['x-forwarded-for'],
                'x-real-ip': req.headers['x-real-ip'],
                'cf-connecting-ip': req.headers['cf-connecting-ip'],
                'x-client-ip': req.headers['x-client-ip']
            }
        };

        console.log('서버 IP 정보 요청:', serverInfo);
        
        res.json({ 
            success: true, 
            message: '서버 IP 정보입니다.',
            data: serverInfo
        });

    } catch (error) {
        console.error('서버 IP 확인 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: 'IP 확인 중 오류가 발생했습니다.' 
        });
    }
});

// Meshy 3D AI API 엔드포인트들
app.post('/api/meshy/text-to-3d', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                success: false, 
                message: '프롬프트를 입력해주세요.' 
            });
        }

        const response = await fetch('https://api.meshy.ai/v1/text-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        res.json({ 
            success: true, 
            message: '3D 모델 생성 요청이 성공했습니다.',
            data: result
        });

    } catch (error) {
        console.error('Meshy Text-to-3D 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: `3D 모델 생성 중 오류가 발생했습니다: ${error.message}` 
        });
    }
});

app.post('/api/meshy/image-to-3d', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ 
                success: false, 
                message: '이미지 URL을 입력해주세요.' 
            });
        }

        const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image_url: imageUrl })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        res.json({ 
            success: true, 
            message: '이미지로 3D 모델 생성 요청이 성공했습니다.',
            data: result
        });

    } catch (error) {
        console.error('Meshy Image-to-3D 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: `이미지로 3D 모델 생성 중 오류가 발생했습니다: ${error.message}` 
        });
    }
});

app.get('/api/meshy/task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const response = await fetch(`https://api.meshy.ai/v1/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        res.json({ 
            success: true, 
            message: '작업 상태를 확인했습니다.',
            data: result
        });

    } catch (error) {
        console.error('Meshy 작업 상태 확인 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: `작업 상태 확인 중 오류가 발생했습니다: ${error.message}` 
        });
    }
});

app.get('/api/meshy/download/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const response = await fetch(`https://api.meshy.ai/v1/tasks/${taskId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        res.json({ 
            success: true, 
            message: '다운로드 정보를 가져왔습니다.',
            data: result
        });

    } catch (error) {
        console.error('Meshy 다운로드 정보 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: `다운로드 정보 가져오기 중 오류가 발생했습니다: ${error.message}` 
        });
    }
});

app.get('/api/meshy/usage', async (req, res) => {
    try {
        const response = await fetch('https://api.meshy.ai/v1/usage', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer msy_8uXUWDNGMzgS7Tw5MVq962RasM6EpObWWOoV',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        res.json({ 
            success: true, 
            message: 'API 사용량 정보를 가져왔습니다.',
            data: result
        });

    } catch (error) {
        console.error('Meshy 사용량 확인 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: `사용량 확인 중 오류가 발생했습니다: ${error.message}` 
        });
    }
});


// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`API 서버: https://daedam.onrender.com`);
    console.log(`프론트엔드: https://daedam410.com`);
});
