# Metabank API

Fastify + Node.js + TypeScript + PostgreSQL + Prisma 기반의 **AI 처리 API 및 사용 추적 시스템**

## 개요

이 API는 4개의 클라이언트에게 AI 기반 기능을 제공하고, 사용 기록을 추적합니다.

**핵심 동작 방식:**
```
클라이언트 → API 호출 → AI 처리 → 결과 반환 + DB 저장 + 로그 기록
```

## 클라이언트

1. **키오스크** (Kiosk) - `/api/v1/kiosk`
2. **보고핏 앱** (BOGOFIT App) - `/api/v1/bogofit`
3. **쇼핑몰 웹** (Shopping Mall Web) - `/api/v1/shopping-mall`
4. **뷰티핏** (BeautyFit - Hair Fitting) - `/api/v1/beautyfit`

## AI 기능

- **Virtual Fitting** (가상 피팅) - 사용자 사진에 의류 합성
- **Makeup** (메이크업) - 얼굴에 메이크업 적용
- **Hair Fitting** (헤어 피팅) - 다양한 헤어스타일 시뮬레이션

---

## 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 DATABASE_URL 설정
```

### 2. 데이터베이스 설정

```bash
# Prisma 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 3. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

서버가 실행되면 `http://localhost:3000`에서 접속 가능합니다.

---

## API 엔드포인트

### 공통 헤더

모든 클라이언트 엔드포인트는 다음 헤더가 필요합니다:

```
X-Client-Type: KIOSK | BOGOFIT_APP | SHOPPING_MALL_WEB | BEAUTY_FIT
```

인증은 선택사항입니다 (JWT 토큰이 있으면 사용자 ID와 연결):

```
Authorization: Bearer <JWT_TOKEN>
```

---

### 1. 키오스크 (`/api/v1/kiosk`)

#### Virtual Fitting
```http
POST /api/v1/kiosk/virtual-fitting
Content-Type: application/json
X-Client-Type: KIOSK

{
  "poseImageUrl": "https://...",
  "items": ["upper_garment_url", "lower_garment_url"],
  "engine": "v2",
  "sessionId": "optional-session-id"
}

Response:
{
  "success": true,
  "resultId": "uuid",
  "resultImageUrl": "https://processed-image.jpg",
  "processedAt": "2025-12-24T16:00:00Z"
}
```

#### Makeup
```http
POST /api/v1/kiosk/makeup
X-Client-Type: KIOSK

{
  "originalImageUrl": "https://...",
  "style": "natural",
  "sessionId": "optional"
}
```

#### Hair Fitting
```http
POST /api/v1/kiosk/hair-fitting
X-Client-Type: KIOSK

{
  "originalImageUrl": "https://...",
  "hairStyle": "short_bob",
  "hairColor": "brown",
  "sessionId": "optional"
}
```

#### 결과 조회
```http
GET /api/v1/kiosk/results/:id
```

---

### 2. BOGOFIT 앱 (`/api/v1/bogofit`)

기본적으로 키오스크와 동일한 엔드포인트를 제공합니다.

추가 엔드포인트:

#### 사용자 결과 기록 조회
```http
GET /api/v1/bogofit/results
Authorization: Bearer <TOKEN>

Response:
{
  "virtualFitting": [...],
  "makeup": [...],
  "hairFitting": [...]
}
```

#### 사용 기록 조회
```http
GET /api/v1/bogofit/usage/history
Authorization: Bearer <TOKEN>

Response:
{
  "logs": [
    {
      "id": "uuid",
      "featureType": "VIRTUAL_FITTING",
      "metadata": {...},
      "createdAt": "..."
    }
  ]
}
```

---

### 3. 쇼핑몰 웹 (`/api/v1/shopping-mall`)

키오스크와 동일한 엔드포인트 제공:
- `POST /virtual-fitting`
- `POST /makeup`
- `POST /hair-fitting`
- `GET /results/:id`

---

### 4. BeautyFit (`/api/v1/beautyfit`)

키오스크와 동일한 엔드포인트 제공:
- `POST /virtual-fitting`
- `POST /makeup`
- `POST /hair-fitting` (주요 기능)
- `GET /results/:id`

---

## 인증 (선택사항)

회원가입/로그인 기능도 제공합니다. 인증을 사용하면 사용자별 결과 기록을 추적할 수 있습니다.

### 회원가입
```http
POST /api/v1/auth/register

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동"
  },
  "token": "JWT_TOKEN"
}
```

### 로그인
```http
POST /api/v1/auth/login

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## AI API 통합 가이드

현재 모든 AI 처리 부분은 placeholder로 되어 있습니다. 실제 AI 로직을 추가하려면:

### 1. 각 클라이언트 라우트 파일에서 `TODO` 주석 찾기

예: `src/routes/kiosk/kiosk.routes.ts`

```typescript
// TODO: AI API 호출 (여기에 실제 AI 처리 로직 추가)
// 현재 placeholder:
const aiResult = {
  resultImageUrl: 'https://placeholder.com/result.jpg',
  processedAt: new Date().toISOString(),
};

// 실제 구현 예시:
// const aiResult = await yourAIService.processVirtualFitting({
//   poseImage: body.poseImageUrl,
//   garmentImages: body.items,
//   engine: body.engine || 'v2'
// });
```

### 2. AI 서비스 파일 생성 (예시)

```typescript
// src/shared/services/ai.service.ts
export class AIService {
  async processVirtualFitting(params: {
    poseImage: string;
    garmentImages: string[];
    engine: string;
  }) {
    // 외부 AI API 호출 또는 자체 ML 모델 실행
    const response = await fetch('https://your-ai-api.com/virtual-fitting', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    
    return await response.json();
  }
  
  async processMakeup(params: { originalImage: string; style: string }) {
    // Makeup AI 처리
  }
  
  async processHairFitting(params: {
    originalImage: string;
    hairStyle: string;
    hairColor?: string;
  }) {
    // Hair fitting AI 처리
  }
}
```

### 3. 라우트에서 AI 서비스 사용

```typescript
import { AIService } from '../../shared/services/ai.service';

const aiService = new AIService();

fastify.post('/virtual-fitting', async (request, reply) => {
  const body = request.body as any;
  
  // AI 처리
  const aiResult = await aiService.processVirtualFitting({
    poseImage: body.poseImageUrl,
    garmentImages: body.items,
    engine: body.engine || 'v2',
  });
  
  // DB 저장 및 로그 기록 (기존 코드)
  // ...
});
```

---

## 데이터베이스 스키마

### 결과 저장 테이블

- **VirtualFittingResult**: Virtual Fitting 결과
  - `id`, `userId`, `clientType`, `poseImageUrl`, `resultImageUrl`, `engine`, `items`, `createdAt`

- **MakeupResult**: Makeup 결과
  - `id`, `userId`, `clientType`, `originalImageUrl`, `resultImageUrl`, `style`, `createdAt`

- **HairFittingResult**: Hair Fitting 결과
  - `id`, `userId`, `clientType`, `originalImageUrl`, `resultImageUrl`, `hairStyle`, `hairColor`, `createdAt`

### 사용 로그 테이블

- **UsageLog**: 기능 사용 기록
  - `id`, `userId`, `clientType`, `featureType`, `sessionId`, `metadata`, `ipAddress`, `userAgent`, `createdAt`

---

## 프로젝트 구조

```
src/
├── config/              # 환경 설정
│   ├── database.ts
│   └── env.ts
├── shared/              # 공유 유틸리티
│   ├── middleware/      # 미들웨어
│   ├── services/        # 공유 서비스
│   │   └── usage-log.service.ts
│   ├── types/           # TypeScript 타입
│   └── utils/           # 유틸 함수
├── routes/              # 라우트 (클라이언트별)
│   ├── auth/            # 인증 (선택사항)
│   ├── kiosk/           # AI 처리 + 결과 반환
│   ├── bogofit/         # AI 처리 + 결과 반환
│   ├── shopping-mall/   # AI 처리 + 결과 반환
│   └── beautyfit/       # AI 처리 + 결과 반환
├── app.ts               # Fastify 앱 초기화
└── index.ts             # 서버 진입점
```

---

## 개발 도구

```bash
# Prisma Studio (데이터베이스 GUI)
npx prisma studio

# 타입 검사
npx tsc --noEmit

# 마이그레이션 생성
npx prisma migrate dev --name <migration_name>
```

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| 런타임 | Node.js + TypeScript |
| 프레임워크 | Fastify 5.x |
| 데이터베이스 | PostgreSQL + Prisma ORM |
| 인증 | JWT (선택사항) |
| 검증 | Zod |
| 로깅 | Pino |

---

## 특징

✅ **AI 처리 제공**: 각 클라이언트에게 AI 기능 API 제공  
✅ **결과 저장**: 모든 AI 처리 결과를 DB에 저장  
✅ **사용 추적**: 상세한 사용 로그 및 통계  
✅ **클라이언트 구분**: 클라이언트별 독립적인 라우트  
✅ **유연한 인증**: 선택적 인증 지원 (게스트/회원 모두 가능)  
✅ **타입 안전성**: TypeScript + Prisma  
✅ **보안**: Helmet, CORS, Password Hashing  

---

## 라이선스

MIT
