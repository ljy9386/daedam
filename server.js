const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 - 카페24 호스팅 도메인 허용
app.use(cors({
    origin: [
        'http://daedam410.com',
        'http://www.daedam410.com',
        'https://daedam410.com',
        'https://www.daedam410.com',
        'http://localhost:3000', // 개발용
        'http://127.0.0.1:3000'  // 개발용
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight 요청 처리
app.options('*', cors());

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB 연결
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB 연결 성공');
    } catch (error) {
        console.error('❌ MongoDB 연결 실패:', error);
        process.exit(1);
    }
};

// 상담 스키마 정의
const consultationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    company: { 
        type: String, 
        required: true,
        trim: true 
    },
    phone: { 
        type: String, 
        required: true,
        match: /^010-\d{4}-\d{4}$/
    },
    businessType: { 
        type: String, 
        required: true,
        enum: ['부동산 경매', '부동산 공매', '지분 투자', '임야 개발', '투자 상담', '기타']
    },
    investmentAmount: { 
        type: String, 
        required: true,
        enum: ['1억 미만', '1~3억', '3~5억', '5억 이상']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

const Consultation = mongoose.model('Consultation', consultationSchema);

// ==================== API 라우트 ====================

// 1. 상담 요청 저장 (POST)
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
            name: name.trim(),
            company: company.trim(),
            phone,
            businessType,
            investmentAmount
        });

        // 데이터베이스에 저장
        const savedConsultation = await consultation.save();

        console.log('✅ 새 상담 요청 저장:', savedConsultation._id);

        res.status(201).json({ 
            success: true, 
            message: '상담 요청이 성공적으로 접수되었습니다.',
            data: {
                id: savedConsultation._id,
                name: savedConsultation.name,
                company: savedConsultation.company,
                createdAt: savedConsultation.createdAt
            }
        });

    } catch (error) {
        console.error('❌ 상담 데이터 저장 오류:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: '입력 데이터가 올바르지 않습니다.',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
        });
    }
});

// 2. 상담 목록 조회 (GET) - 관리자용
app.get('/api/consultations', async (req, res) => {
    try {
        const consultations = await Consultation.find()
            .sort({ createdAt: -1 })
            .select('-__v')
            .lean();

        res.json({ 
            success: true, 
            count: consultations.length,
            data: consultations 
        });

    } catch (error) {
        console.error('❌ 상담 데이터 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '데이터 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 3. 상담 삭제 (DELETE) - 관리자용
app.delete('/api/consultations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ObjectId 유효성 검사
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: '올바르지 않은 ID 형식입니다.' 
            });
        }

        const consultation = await Consultation.findByIdAndDelete(id);

        if (!consultation) {
            return res.status(404).json({ 
                success: false, 
                message: '상담 데이터를 찾을 수 없습니다.' 
            });
        }

        console.log('🗑️ 상담 데이터 삭제:', id);

        res.json({ 
            success: true, 
            message: '상담 데이터가 성공적으로 삭제되었습니다.',
            data: { id: consultation._id }
        });

    } catch (error) {
        console.error('❌ 상담 데이터 삭제 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '삭제 중 오류가 발생했습니다.' 
        });
    }
});

// 4. 서버 상태 확인
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 5. 테스트 라우트
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Daedam API Server is working!', 
        timestamp: new Date().toISOString(),
        port: PORT 
    });
});

// 6. 루트 라우트
app.get('/', (req, res) => {
    res.json({ 
        message: 'Daedam Backend API',
        version: '2.0.0',
        endpoints: [
            'POST /api/consultations - 상담 요청 저장',
            'GET /api/consultations - 상담 목록 조회',
            'DELETE /api/consultations/:id - 상담 삭제',
            'GET /api/health - 서버 상태 확인',
            'GET /test - 테스트'
        ]
    });
});

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`
    });
});

// 에러 핸들러
app.use((error, req, res, next) => {
    console.error('❌ 서버 에러:', error);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
    });
});

// 서버 시작
const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`📡 API 서버: https://daedam.onrender.com`);
        console.log(`🌐 프론트엔드: http://daedam410.com`);
        console.log(`⚡ 환경: ${process.env.NODE_ENV || 'development'}`);
    });
};

// 서버 시작
startServer().catch(error => {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM 신호 수신, 서버 종료 중...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT 신호 수신, 서버 종료 중...');
    await mongoose.connection.close();
    process.exit(0);
});