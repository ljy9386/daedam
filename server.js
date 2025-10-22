const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:wmfdksk123@minimalshop.p2lpoe3.mongodb.net/daedam_consultations?retryWrites=true&w=majority&appName=MinimalShop';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB 연결 성공');
    startServer();
})
.catch(err => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
});

// 미들웨어
app.use(cors({
    origin: [
        'http://daedam410.com',
        'http://www.daedam410.com',
        'https://daedam410.com',
        'https://www.daedam410.com',
        'http://localhost:3000', // 개발용
        'http://127.0.0.1:3000'  // 개발용
    ],
    credentials: true
}));
app.use(express.json());

// Preflight 요청 허용 (CORS 사전 요청 처리)
app.options('*', cors());

// 정적 파일 제공 (선택적) - 'public' 폴더가 있을 때만 활성화
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
}

// 파비콘 요청 무시 (콘솔 404 소음 제거)
app.get('/favicon.ico', (_, res) => res.status(204).end());

// 모든 요청 로깅 (모든 라우트 정의 전에 위치)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

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

// 서버 IP 확인 API
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

// 테스트 라우트
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'Test route working!', port: PORT });
});

// 서버 시작 함수
function startServer() {
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`API 서버: https://daedam.onrender.com`);
        console.log(`프론트엔드: http://daedam410.com`);
        console.log('모든 라우트가 등록되었습니다.');
    });
}