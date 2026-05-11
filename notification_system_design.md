# Campus Notification

## Stage 1

### Core Features

- Fetch notifications
- Mark notification as read
- Mark all notifications as read
- Real-time notifications
- Notification filtering
- Pagination

---

### Base URL

```txt
/api/v1
```

---

### Authentication Header

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

### Get Notifications

#### Endpoint

```http
GET /api/v1/notifications
```

#### Query Params

| Param | Type | Description |
|---|---|---|
| page | number | pagination page |
| limit | number | items per page |
| type | string | Event / Result / Placement |
| unreadOnly | boolean | unread filter |

#### Example Request

```http
GET /api/v1/notifications?page=1&limit=10&unreadOnly=true
```

#### Response

```json
{
  "success": true,
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "message": " shortlist released",
      "isRead": false,
      "createdAt": "2026-05-11T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### Mark Notification as Read

#### Endpoint

```http
PATCH /api/v1/notifications/:id/read
```

#### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All Notifications as Read

#### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

#### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Real-Time Notifications

#### WebSocket Endpoint

```txt
ws://localhost:3000/ws
```

#### Event Payload

```json
{
  "event": "notification:new",
  "data": {
    "id": "123",
    "type": "Placement",
    "message": "Amazon OA released"
  }
}
```

---

## Stage 2

### Recommended Database

```txt
PostgreSQL
```

### Why PostgreSQL?

- ACID compliance
- Reliable indexing
- Strong query support
- Handles relational notification data well
- Scales efficiently

---

### Notifications Table
```txt
Prisma PostgreSQL 
```


```sql
enum NotificationType {
  Event
  Result
  Placement
}

model Notification {
  id         String            @id @default(uuid()) @db.Uuid
  studentId  Int
  type       NotificationType
  message    String
  isRead     Boolean           @default(false)
  createdAt  DateTime          @default(now())

  @@index([studentId, isRead, createdAt(sort: Desc)])
  @@map("notifications")
}
```

### Important Indexes
```sql 
  @@index([studentId, isRead, createdAt(sort: Desc)])
  @@map("notifications")
```

### Fetch Unread Notifications
```txt
const notifications = await prisma.notification.findMany({
  where: {
    studentId: 1042,
    isRead: false,
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 20,
});
```
### Scaling Problems

As notification volume grows:

- slow queries
- high DB load
- increased storage
- expensive sorting

### Solution 
- indexing
- pagination
- Redis caching
- partitioning
- background workers