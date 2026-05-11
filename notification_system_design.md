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



## Stage 3

### Goal

Optimize notification queries for large-scale systems handling millions of records.

### Main Problems

- Slow unread notification queries
- Expensive sorting operations
- Full table scans
- High database CPU usage
- Increased response time under heavy traffic

### Query Optimization Techniques

#### 1. Composite Indexing

Composite indexes improve filtering + sorting together.

```sql
@@index([studentId, isRead, createdAt(sort: Desc)], map: "idx_notifications_lookup")

  @@map("notifications")
```
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

This index helps:

- unread notification filtering
- student-specific queries
- sorting by newest notifications

---

#### 2. Avoid SELECT *

Bad:

```sql
const notifications = await prisma.notification.findMany();
```

Optimized:

```sql
const notifications = await prisma.notification.findMany({
  select: {
    id: true,
    type: true,
    message: true,
    createdAt: true,
  },
});

```

Why?

- reduces memory usage
- improves network transfer
- faster query execution

---

#### 3. Pagination Optimization

Instead of loading thousands of rows:

```http
GET /notifications?page=1&limit=20
```

Benefits:

- lower DB load
- lower API latency
- smaller response payload

---

#### 4. Cursor-Based Pagination

Better than OFFSET pagination for huge datasets.

```sql
SELECT *
FROM notifications
WHERE created_at < '2026-05-11T10:00:00Z'
ORDER BY created_at DESC
LIMIT 20;
```

Advantages:

- avoids large OFFSET scans
- better scalability
- stable performance

---

#### 5. Query Complexity

Without index:

```txt
O(n)
```

With index:

```txt
O(log n)
```

---

#### 6. Database Monitoring

Useful tools:

- EXPLAIN ANALYZE
- pg_stat_statements
- slow query logs

Example:

```sql
EXPLAIN ANALYZE
SELECT *
FROM notifications
WHERE student_id = 1042;
```

---

# Slow Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

---

# Why Slow?

Without indexes:

- full table scan
- expensive sorting
- millions of rows scanned

Complexity:

```txt
O(n)
```

---

# Better Index

```sql
CREATE INDEX idx_notifications_lookup
ON notifications(student_id, is_read, created_at DESC);
```

---

# Optimized Query

```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

---

# Why Not Index Every Column?

Adding indexes on every column:

- increases storage
- slows INSERT/UPDATE
- unnecessary overhead

Indexes should only be created for:

- filtering
- sorting
- joins

---

# Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Goal

Improve system performance and scalability for high concurrent traffic.

### Main Challenges

- frequent database reads
- millions of notifications
- websocket scalability
- repeated API calls
- high latency under load

---

### 1. Redis Caching

Store recently fetched notifications in Redis.

Flow:

```txt
Client
   ↓
Redis Cache
   ↓
PostgreSQL (fallback)
```

Benefits:

- faster response time
- reduced DB pressure
- low latency reads

Tradeoffs:

- cache invalidation complexity
- possible stale data

---

### Redis Cache Strategy

Key format:

```txt
notifications:user:1042
```

Cache expiry:

```txt
TTL = 60 seconds
```

Example Redis Logic:

```ts
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}
```

---

### 2. WebSocket Scaling

Problem:

Single WebSocket server cannot handle huge traffic.

Solution:

- horizontal scaling
- Redis Pub/Sub adapter

Architecture:

```txt
Client
   ↓
Load Balancer
   ↓
Multiple WebSocket Servers
   ↓
Redis Pub/Sub
```

Benefits:

- scalable realtime delivery
- synchronization between servers

---

### 3. Notification Fan-Out

Instead of sending notifications synchronously:

```txt
Producer → Queue → Workers → Users
```

This avoids blocking the API.

---

### 4. CDN for Assets

Notification images/files should use CDN.

Benefits:

- lower backend load
- faster global delivery

---

### 5. Rate Limiting

Prevent API abuse.

Example:

```txt
100 requests/minute/user
```

Implementation:

- Redis rate limiter
- token bucket algorithm

---

### 6. Horizontal Scaling

Run multiple backend instances:

```txt
Load Balancer
   ↓
Server 1
Server 2
Server 3
```

Benefits:

- higher throughput
- fault tolerance
- improved availability

---

# Problem

Every page load hits the DB.

With:

- 50,000 students
- millions of notifications

DB becomes overloaded.

---

# Solution 1 — Redis Cache

## Flow

```txt
User Request
    ↓
Redis Cache
    ↓
Database (fallback)
```

---

## Benefits

- faster reads
- reduced DB load
- lower latency

---

## Tradeoff

- stale cache possible
- extra infrastructure

---

# Solution 2 — Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=20
```

---

# Solution 3 — WebSockets

Push new notifications instantly.

Benefits:

- fewer polling requests
- realtime updates

---

# Solution 4 — DB Partitioning

Partition by:

- student_id
- created_at

Improves query performance.

---

## Stage 5

### Goal

Design a reliable large-scale bulk notification delivery system.

### Problems in Naive System

- sequential notification sending
- API blocking
- email provider bottleneck
- retry failures missing
- duplicate notification risk
- poor scalability

---

### Recommended Architecture

```txt
Admin Dashboard
       ↓
Notification API
       ↓
Kafka / RabbitMQ Queue
       ↓
Worker Services
   ↓        ↓         ↓
Email    Push      WebSocket
```

---

### Why Message Queues?

Queues provide:

- asynchronous processing
- retries
- durability
- buffering during spikes
- fault tolerance

---

### Kafka vs RabbitMQ

| Kafka | RabbitMQ |
|---|---|
| high throughput | easier routing |
| event streaming | task queues |
| scalable logs | simpler setup |

---

### Retry Mechanism

If email sending fails:

```txt
Retry after:
1 min → 5 min → 15 min
```

This is exponential backoff.

---

### Dead Letter Queue (DLQ)

After multiple failures:

```txt
Move message → DLQ
```

Used for:

- debugging
- manual retry
- failure analysis

---

### Idempotency

Prevent duplicate notifications.

Store:

```txt
notification_id + student_id
```

before sending.

Benefits:

- avoids duplicate emails
- safe retries

---

### Worker-Based Processing

Workers independently process jobs.

Benefits:

- scalable processing
- distributed workloads
- independent retries

---

### Batch Processing

Instead of sending one-by-one:

```txt
100 notifications per batch
```

Benefits:

- fewer DB calls
- reduced network overhead
- higher throughput

---

### Reliable Pseudocode

```python
function notify_all(student_ids, message):
    batch_id = generate_uuid()

    for student_id in student_ids:
        queue.publish({
            "batch_id": batch_id,
            "student_id": student_id,
            "message": message
        })
```

Worker:

```python
function worker(job):
    try:
        save_to_db(job)
        send_email(job)
        send_push(job)
        websocket_emit(job)

        mark_success(job)

    except Exception:
        retry(job)
```

---

# Problems in Given Pseudocode

- sequential processing
- very slow
- partial failure handling missing
- no retries
- email API bottleneck
- no queue system

---

# Better Architecture

```txt
HR Clicks Notify All
        ↓
API Server
        ↓
Message Queue (Kafka/RabbitMQ)
        ↓
Workers
   ↓        ↓
Email     Push Notification
```

---

# Why Queue?

Queues provide:

- retries
- durability
- scalability
- async processing

---

# Revised Pseudocode

```python
function notify_all(student_ids, message):
    batch_id = generate_uuid()

    for student_id in student_ids:
        queue.publish({
            "batch_id": batch_id,
            "student_id": student_id,
            "message": message
        })
```

---

# Worker

```python
function worker(job):
    try:
        save_to_db(job)
        send_email(job)
        push_to_app(job)

        mark_success(job)

    except Exception as e:
        retry(job)
```

---

# Why Save to DB Separately?

Email delivery can fail.

But notification record should still exist.

Therefore:

- DB persistence
- email sending
- push delivery

should be decoupled.

---

## Stage 6

### Goal

Build a priority inbox that ranks notifications intelligently.

Users should see:

- most important notifications first
- newest important alerts first
- top unread notifications quickly

---

### Priority Rules

```txt
Placement > Result > Event
```

Reason:

- placement alerts are most critical
- result notifications are medium priority
- general events are lower priority

---

### Priority Weights

| Type | Weight |
|---|---|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

---

### Priority Formula

Priority Score:

```txt
(weight × 1000) - age_in_minutes
```

Meaning:

- higher weight = higher rank
- newer notifications = higher rank

---

### Example

| Type | Age | Score |
|---|---|---|
| Placement | 10 min | 2990 |
| Event | 5 min | 995 |

Placement notification ranks higher.

---

### Efficient Top-10 Retrieval

Use:

```txt
Min Heap of Size 10
```

Complexity:

```txt
O(n log k)
```

Where:

- n = total notifications
- k = top results needed

Benefits:

- memory efficient
- scalable for huge datasets
- fast ranking

---

### Why Heap Instead of Full Sorting?

Sorting all notifications:

```txt
O(n log n)
```

Heap approach:

```txt
O(n log k)
```

Much faster when:

```txt
k << n
```

---

### Real-World Usage

Used in:

- Gmail priority inbox
- LinkedIn notifications
- Twitter feed ranking
- Instagram notifications

---

# Goal

Show top unread notifications based on:

- type priority
- recency

Priority:

```txt
Placement > Result > Event
```

---

# Priority Weights

| Type | Weight |
|---|---|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

---

# Priority Formula

Priority Score:

```txt
(weight * 1000) - age_in_minutes
```

---

# Efficient Approach

Use:

```txt
Min Heap of Size 10
```

Complexity:

```txt
O(n log k)
```

Where:

- n = notifications
- k = 10

---

# Stage 6 TypeScript Code

## types.ts

```ts
export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}
```

---

## scorer.ts

```ts
const weights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculateScore(
  type: keyof typeof weights,
  timestamp: string
) {
  const ageMinutes =
    (Date.now() - new Date(timestamp).getTime()) /
    (1000 * 60);

  return weights[type] * 1000 - ageMinutes;
}
```

---

## priorityQueue.ts

```ts
import { calculateScore } from "./scorer";
import type { Notification } from "./types";

export function getTop10(
  notifications: Notification[]
) {
  return notifications
    .sort((a, b) => {
      return (
        calculateScore(
          b.Type,
          b.Timestamp
        ) -
        calculateScore(
          a.Type,
          a.Timestamp
        )
      );
    })
    .slice(0, 10);
}
```

---

## index.ts

```ts
import axios from "axios";

import { getTop10 } from "./priorityQueue";

async function main() {
  const response = await axios.get(
    "http://4.224.186.213/evaluation-service/notifications",
    {
      headers: {
        Authorization:
          "Bearer YOUR_TOKEN",
      },
    }
  );

  const notifications =
    response.data.notifications;

  const top10 =
    getTop10(notifications);

  console.log("Top Notifications:\n");

  console.table(top10);
}

main();
```

---

# Notification Backend Code Structure

```txt
notification_app_be/
│
├── package.json
├── tsconfig.json
├── .env
│
├── src/
│   ├── index.ts
│   ├── routes/
│   │   └── notification.routes.ts
│   ├── controllers/
│   │   └── notification.controller.ts
│   ├── services/
│   │   └── notification.service.ts
│   ├── websocket/
│   │   └── socket.ts
│   ├── priority/
│   │   ├── scorer.ts
│   │   └── priorityQueue.ts
│   └── types/
│       └── notification.ts
```

---

# package.json

```json
{
  "name": "notification_app_be",
  "type": "module",
  "scripts": {
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "axios": "^1.8.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^5.0.0",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.0"
  }
}
```

---

# src/types/notification.ts

```ts
export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}
```

---

# src/utils/logger.ts

```ts
export function log(message: string) {
  console.log(`[LOG] ${message}`);
}
```

---

# src/priority/scorer.ts

```ts
const weights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculateScore(
  type: keyof typeof weights,
  timestamp: string
) {
  const ageMinutes =
    (Date.now() - new Date(timestamp).getTime()) /
    (1000 * 60);

  return weights[type] * 1000 - ageMinutes;
}
```

---

# src/priority/priorityQueue.ts

```ts
import { calculateScore } from "./scorer.js";

import type { Notification } from "../types/notification.js";

export function getTop10(
  notifications: Notification[]
) {
  return notifications
    .sort((a, b) => {
      return (
        calculateScore(
          b.Type,
          b.Timestamp
        ) -
        calculateScore(
          a.Type,
          a.Timestamp
        )
      );
    })
    .slice(0, 10);
}
```

---

# src/services/notification.service.ts

```ts
import axios from "axios";

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const TOKEN = "YOUR_TOKEN";

export async function fetchNotifications() {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.data.notifications;
}
```

---

# src/controllers/notification.controller.ts

```ts
import type {
  Request,
  Response,
} from "express";

import { fetchNotifications } from "../services/notification.service.js";

import { getTop10 } from "../priority/priorityQueue.js";

export async function getNotifications(
  _: Request,
  res: Response
) {
  try {
    const notifications =
      await fetchNotifications();

    const top10 =
      getTop10(notifications);

    res.json({
      success: true,
      notifications: top10,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

---

# src/routes/notification.routes.ts

```ts
import { Router } from "express";

import { getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.get(
  "/notifications",
  getNotifications
);

export default router;
```

---

# src/websocket/socket.ts

```ts
import { Server } from "socket.io";

export function initializeSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log(
      `Client connected: ${socket.id}`
    );

    socket.on("disconnect", () => {
      console.log(
        `Disconnected: ${socket.id}`
      );
    });
  });
}
```

---

# src/index.ts

```ts
import express from "express";
import cors from "cors";
import http from "http";

import { Server } from "socket.io";

import notificationRoutes from "./routes/notification.routes.js";

import { initializeSocket } from "./websocket/socket.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", notificationRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initializeSocket(io);

server.listen(3000, () => {
  console.log(
    "Notification service running on port 3000"
  );
});
```

---

# Final Architecture

```txt
Frontend
    ↓
API Gateway
    ↓
Notification Service
    ↓
Redis Cache
    ↓
PostgreSQL
    ↓
Kafka/RabbitMQ
    ↓
Workers
    ↓
Email / Push / WebSocket
```

