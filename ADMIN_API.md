# Admin API Documentation

## 개요

관리자 전용 API로, 전체 시스템을 모니터링하고 관리할 수 있습니다.

**Base URL**: `/api/v1/admin`

**인증**: 모든 엔드포인트는 `ADMIN` 역할이 필요합니다.

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 관리자 계정 생성

### 방법 1: 수동으로 DB에서 role 변경

```sql
-- 기존 사용자를 관리자로 승격
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';
```

### 방법 2: Prisma Studio 사용

```bash
npx prisma studio

# User 테이블에서 role을 'ADMIN'으로 변경
```

---

## API Endpoints

### 1. Statistics (통계)

#### GET /admin/stats
전체 시스템 통계 조회

**응답:**
```json
{
  "users": {
    "total": 1523
  },
  "results": {
    "virtualFitting": 5420,
    "makeup": 2341,
    "hairFitting": 1823,
    "videos": 1234,
    "total": 10818
  },
  "usage": {
    "totalLogs": 15234,
    "byClient": [
      { "clientType": "KIOSK", "_count": 5000 },
      { "clientType": "BOGOFIT_APP", "_count": 8000 },
      { "clientType": "SHOPPING_MALL_WEB", "_count": 2000 },
      { "clientType": "BEAUTY_FIT", "_count": 234 }
    ],
    "byFeature": [
      { "featureType": "VIRTUAL_FITTING", "_count": 5420 },
      { "featureType": "MAKEUP", "_count": 2341 },
      { "featureType": "HAIR_FITTING", "_count": 1823 },
      { "featureType": "VIDEO_GENERATION", "_count": 1234 }
    ]
  }
}
```

#### GET /admin/stats/range
특정 기간 통계 조회

**Query Parameters:**
- `startDate`: ISO 날짜 (optional)
- `endDate`: ISO 날짜 (optional)

**예시:**
```
GET /admin/stats/range?startDate=2025-01-01&endDate=2025-01-31
```

---

### 2. Usage Logs (사용 기록)

#### GET /admin/usage-logs
모든 사용 로그 조회 (페이지네이션)

**Query Parameters:**
- `page`: 페이지 번호 (default: 1)
- `limit`: 페이지당 항목 수 (default: 50)
- `clientType`: 클라이언트 필터 (optional)
- `featureType`: 기능 필터 (optional)

**예시:**
```
GET /admin/usage-logs?page=1&limit=50&clientType=KIOSK
```

**응답:**
```json
{
  "logs": [
    {
      "id": "log-123",
      "userId": "user-456",
      "user": {
        "id": "user-456",
        "email": "user@example.com",
        "name": "홍길동"
      },
      "clientType": "KIOSK",
      "featureType": "VIRTUAL_FITTING",
      "metadata": { ... },
      "createdAt": "2025-12-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15234,
    "totalPages": 305
  }
}
```

---

### 3. User Management (사용자 관리)

#### GET /admin/users
모든 사용자 조회

**Query Parameters:**
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**응답:**
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER",
      "provider": "LOCAL",
      "createdAt": "2025-12-01T00:00:00Z",
      "_count": {
        "usageLogs": 42
      }
    }
  ],
  "pagination": { ... }
}
```

#### GET /admin/users/:id
특정 사용자 상세 정보

**응답:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "홍길동",
  "role": "USER",
  "provider": "LOCAL",
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2025-12-20T00:00:00Z",
  "usageLogs": [
    // 최근 20개 로그
  ]
}
```

#### PATCH /admin/users/:id/role
사용자 역할 변경

**Body:**
```json
{
  "role": "ADMIN"
}
```

**응답:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "role": "ADMIN"
}
```

---

### 4. Results Management (결과 관리)

#### GET /admin/results/virtual-fitting
모든 Virtual Fitting 결과 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `clientType`: 클라이언트 필터 (optional)

#### GET /admin/results/makeup
모든 Makeup 결과 조회

#### GET /admin/results/hair-fitting
모든 Hair Fitting 결과 조회

#### GET /admin/results/videos
모든 Video 결과 조회

**Query Parameters:**
- `status`: 비디오 상태 필터 (PENDING, PROCESSING, COMPLETED, FAILED)

#### DELETE /admin/results/:type/:id
결과 삭제

**Parameters:**
- `type`: `virtual-fitting`, `makeup`, `hair-fitting`, `video`
- `id`: 결과 ID

**예시:**
```
DELETE /admin/results/virtual-fitting/abc-123
```

---

## 사용 예시

### 관리자 로그인

```bash
# 1. 일반 로그인 (role이 ADMIN이어야 함)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 응답에서 token 받음
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 통계 조회

```bash
curl -X GET http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 사용자 목록 조회

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 사용자 권한 변경

```bash
curl -X PATCH http://localhost:3000/api/v1/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

---

## 보안

- ✅ 모든 admin 엔드포인트는 인증 필수
- ✅ JWT 토큰에 role 정보 포함
- ✅ Admin 미들웨어가 ADMIN 역할 검증
- ✅ 일반 사용자는 403 Forbidden 응답

---

## 프론트엔드 통합 (React 예시)

```typescript
// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetch('/api/v1/admin/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {stats && (
        <>
          <div>Total Users: {stats.users.total}</div>
          <div>Total Results: {stats.results.total}</div>
          <div>Total Logs: {stats.usage.totalLogs}</div>
        </>
      )}
    </div>
  );
};
```

---

## 다음 단계

1. **DB 마이그레이션**:
   ```bash
   npx prisma migrate dev --name add_user_role
   npx prisma generate
   ```

2. **첫 관리자 계정 생성**:
   ```bash
   # Prisma Studio 사용
   npx prisma studio
   ```

3. **관리자 대시보드 구축**: React/Next.js 등으로 프론트엔드 구축
