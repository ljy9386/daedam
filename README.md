# 대담 부동산투자법인 상담 시스템

MongoDB를 활용한 예약상담 시스템과 관리자 페이지를 포함한 완전한 웹 애플리케이션입니다.

## 🚀 주요 기능

### 사용자 기능
- **예약상담 폼**: 이름, 회사명, 전화번호, 유형, 투자금액대 입력
- **실시간 유효성 검사**: 전화번호 형식 및 필수 항목 검증
- **성공 팝업**: "접수 완료! 담당 컨설턴트가 24시간 이내 연락드립니다. 감사합니다."
- **MongoDB 저장**: 모든 상담 데이터가 안전하게 데이터베이스에 저장

### 관리자 기능
- **보안 로그인**: 아이디 `admin001`, 비밀번호 `admin002`
- **다크웹 스타일**: Matrix 테마의 관리자 인터페이스
- **실시간 대시보드**: 총 상담 건수, 대기 중, 완료, 오늘 상담 건수
- **상담 관리**: 상담 상태 변경 (완료/취소)
- **데이터 조회**: MongoDB에서 실시간 데이터 조회

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Styling**: Custom CSS with Matrix theme

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

### 3. 접속
- **메인 페이지**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin

## 🔐 관리자 접근

- **아이디**: admin001
- **비밀번호**: admin002

## 📊 데이터베이스 구조

### 컬렉션: consultations
```javascript
{
  _id: ObjectId,
  name: String,           // 이름
  company: String,        // 회사명
  phone: String,          // 전화번호 (010-1234-5678)
  businessType: String,   // 유형 (auction, public-sale, equity, etc.)
  investmentAmount: String, // 투자금액대 (under-100m, 100m-300m, etc.)
  status: String,         // 상태 (pending, completed, cancelled)
  createdAt: Date,        // 생성일시
  updatedAt: Date         // 수정일시
}
```

## 🔧 API 엔드포인트

### 상담 데이터 저장
```
POST /api/consultations
Content-Type: application/json

{
  "name": "홍길동",
  "company": "대담회사",
  "phone": "010-1234-5678",
  "businessType": "auction",
  "investmentAmount": "100m-300m"
}
```

### 상담 데이터 조회 (관리자용)
```
GET /api/consultations
```

### 상담 상태 업데이트 (관리자용)
```
PUT /api/consultations/:id
Content-Type: application/json

{
  "status": "completed"
}
```

### 통계 데이터 조회 (관리자용)
```
GET /api/consultations/stats
```

## 🎨 디자인 특징

### 메인 페이지
- 깔끔하고 전문적인 디자인
- 반응형 레이아웃
- 부드러운 스크롤 애니메이션
- 브랜드 컬러 (#2C3E50) 활용

### 관리자 페이지
- Matrix 스타일 다크웹 테마
- 네온 그린 컬러 (#00ff00)
- 터미널 느낌의 폰트 (Courier New)
- 글로우 효과와 애니메이션

## 🔒 보안 기능

- 세션 기반 인증
- 하드코딩된 관리자 크리덴셜
- 우클릭 및 F12 방지
- 입력 데이터 유효성 검사
- MongoDB 인젝션 방지

## 📱 반응형 지원

- 데스크톱, 태블릿, 모바일 최적화
- 터치 친화적 인터페이스
- 적응형 그리드 레이아웃

## 🚀 배포

### Heroku 배포
1. Heroku CLI 설치
2. `heroku create your-app-name`
3. MongoDB Atlas 연결 문자열 설정
4. `git push heroku main`

### Vercel 배포
1. Vercel CLI 설치
2. `vercel --prod`
3. 환경 변수 설정

## 📞 지원

문의사항이 있으시면 대담 부동산투자법인으로 연락주세요.
- 전화: 02-2114-8327
- 이메일: daedam410@naver.com

---

© 2024 주식회사 부동산투자법인 대담. All rights reserved.
