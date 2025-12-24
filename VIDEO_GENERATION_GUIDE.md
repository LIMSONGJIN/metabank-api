# Metabank API - Video Generation 기능 추가 설명

## Video Generation 플로우

Video Generation은 **Virtual Fitting 결과를 기반**으로 동작합니다.

### 2단계 프로세스

```
1. Virtual Fitting 실행
   POST /virtual-fitting
   → resultId 받음

2. Video 생성 (선택사항)
   POST /video-generation { virtualFittingResultId: "resultId" }
   → videoUrl 받음
```

### 왜 2단계인가?

- ✅ Virtual Fitting만 사용할 수도 있음
- ✅ 결과가 마음에 들 때만 Video 생성
- ✅ 이미 있는 Virtual Fitting 결과로도 Video 생성 가능
- ✅ 유연한 사용성

## API 사용 예시

### Step 1: Virtual Fitting 실행

```bash
curl -X POST http://localhost:3000/api/v1/kiosk/virtual-fitting \
  -H "Content-Type: application/json" \
  -H "X-Client-Type: KIOSK" \
  -d '{
    "poseImageUrl": "https://example.com/pose.jpg",
    "items": ["https://example.com/shirt.jpg"],
    "engine": "v2"
  }'
```

**응답:**
```json
{
  "success": true,
  "resultId": "vf-result-123",
  "resultImageUrl": "https://placeholder.com/result.jpg",
  "processedAt": "2025-12-24T07:30:00Z"
}
```

### Step 2: Video Generation (선택사항)

```bash
curl -X POST http://localhost:3000/api/v1/kiosk/video-generation \
  -H "Content-Type: application/json" \
  -H "X-Client-Type: KIOSK" \
  -d '{
    "virtualFittingResultId": "vf-result-123",
    "duration": 5,
    "style": "fade"
  }'
```

**응답:**
```json
{
  "success": true,
  "videoId": "video-456",
  "videoUrl": "https://placeholder.com/video.mp4",
  "thumbnailUrl": "https://placeholder.com/thumbnail.jpg",
  "status": "COMPLETED"
}
```

## 데이터베이스 구조

### VideoGenerationResult 테이블

```prisma
model VideoGenerationResult {
  id                      String
  userId                  String?
  clientType              ClientType
  
  // Virtual Fitting 결과 참조
  virtualFittingResultId  String
  virtualFittingResult    VirtualFittingResult (relation)
  
  // Video 출력
  videoUrl                String?
  thumbnailUrl            String?
  
  // 설정
  duration                Int?
  style                   String?
  status                  VideoStatus (PENDING|PROCESSING|COMPLETED|FAILED)
  
  createdAt               DateTime
  updatedAt               DateTime
}
```

### 관계 (Relationship)

- **One-to-Many**: 하나의 VirtualFittingResult → 여러 Video 생성 가능
- **Cascade Delete**: VirtualFittingResult 삭제 시 관련 Video도 삭제

## 클라이언트 구현 가이드

### 클라이언트 UI 플로우

```
1. 사용자가 Virtual Fitting 요청
2. API 호출 → resultId 받음
3. 결과 이미지 표시

4. (Optional) "비디오로 만들기" 버튼 표시
5. 사용자가 클릭하면
6. Video Generation API 호출 (virtualFittingResultId 전달)
7. Video 다운로드 또는 공유
```

### React/React Native 예시

```typescript
// Step 1: Virtual Fitting
const handleVirtualFitting = async () => {
  const response = await fetch('/api/v1/kiosk/virtual-fitting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'KIOSK',
    },
    body: JSON.stringify({
      poseImageUrl: userImage,
      items: selectedGarments,
      engine: 'v2',
    }),
  });
  
  const result = await response.json();
  setResultId(result.resultId);
  setResultImage(result.resultImageUrl);
};

// Step 2: Video Generation (optional)
const handleGenerateVideo = async () => {
  const response = await fetch('/api/v1/kiosk/video-generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'KIOSK',
    },
    body: JSON.stringify({
      virtualFittingResultId: resultId,
      duration: 5,
      style: 'fade',
    }),
  });
  
  const videoResult = await response.json();
  setVideoUrl(videoResult.videoUrl);
};
```

## AI 통합 가이드

### Video Generation AI 처리

`src/routes/kiosk/kiosk.routes.ts` 파일의 `TODO` 부분:

```typescript
// TODO: AI Video Generation API 호출
// const videoResult = await yourAIService.generateVideo({
//   resultImageUrl: vfResult.resultImageUrl,
//   poseImageUrl: vfResult.poseImageUrl,
//   duration: body.duration || 5,
//   style: body.style || 'default'
// });
```

### 실제 구현 예시

```typescript
// src/shared/services/ai.service.ts
export class AIService {
  async generateVideo(params: {
    resultImageUrl: string;
    poseImageUrl: string;
    duration: number;
    style: string;
  }) {
    // 외부 Video Generation API 호출
    const response = await fetch('YOUR_VIDEO_AI_API', {
      method: 'POST',
      body: JSON.stringify({
        images: [params.poseImageUrl, params.resultImageUrl],
        duration: params.duration,
        transition: params.style,
      }),
    });
    
    const result = await response.json();
    
    return {
      videoUrl: result.video_url,
      thumbnailUrl: result.thumbnail_url,
    };
  }
}
```

## 통계 및 사용 로그

Video Generation도 UsageLog에 자동 기록됩니다:

```typescript
{
  featureType: "VIDEO_GENERATION",
  metadata: {
    resultId: "video-456",
    virtualFittingResultId: "vf-result-123",
    duration: 5,
    style: "fade"
  }
}
```

## 다음 마이그레이션

```bash
# Prisma 스키마 변경 후 마이그레이션
npx prisma migrate dev --name add_video_generation

# Prisma Client 재생성
npx prisma generate
```
