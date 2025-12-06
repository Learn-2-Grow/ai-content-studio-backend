# 🤖 AI Content Studio - Backend

> A MERN stack application with AI-powered content generation using NestJS, MongoDB, Redis Queue (BullMQ), and Google Gemini API.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Step-by-Step Implementation Plan](#-step-by-step-implementation-plan)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Queue Architecture](#-queue-architecture)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🎯 Project Overview

AI Content Studio is a full-stack application that allows users to generate AI-powered content (blog outlines, social media captions, articles, etc.) using Google Gemini API. The system uses a Redis-based queue (BullMQ) to handle content generation jobs asynchronously with a 1-minute delay, ensuring scalable and efficient processing.

### Key Features

- ✅ User Authentication (JWT-based)
- ✅ Content CRUD Operations
- ✅ AI Content Generation via Google Gemini
- ✅ Redis Queue (BullMQ) for async job processing
- ✅ Job Status Polling API
- ✅ MongoDB for data persistence
- ✅ RESTful API design

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose)
- **Queue**: Redis + BullMQ
- **Authentication**: JWT (Passport)
- **AI API**: Google Gemini API
- **Validation**: class-validator, class-transformer

### Frontend (Separate Repository)
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **State Management**: Zustand (or Redux)
- **Styling**: Tailwind CSS (recommended)

### Infrastructure
- **Queue**: Redis
- **Deployment**: Render/AWS (Backend), Vercel (Frontend)

---

## 🏗 Architecture

### System Flow

```
User → Frontend → NestJS API → Redis Queue (BullMQ)
                                    ↓
                              Worker Process (1 min delay)
                                    ↓
                              Google Gemini API
                                    ↓
                              MongoDB (Save Content)
                                    ↓
                              Frontend (Poll Status)
```

### Component Diagram

```
┌─────────────┐
│   Frontend  │ (Next.js)
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────────────────────────────┐
│      NestJS Backend API             │
│  ┌──────────┐  ┌──────────┐         │
│  │   Auth   │  │ Content  │         │
│  │  Module  │  │  Module  │         │
│  └──────────┘  └────┬─────┘         │
│                     │               │
│              ┌──────▼──────┐        │
│              │ Queue Module│        │
│              │  (BullMQ)   │        │
│              └──────┬──────┘        │
└─────────────────────┼───────────────┘
                      │
                      ↓
            ┌─────────────────┐
            │  Redis Queue    │
            └────────┬────────┘
                     │
                     ↓
            ┌─────────────────┐
            │  Worker Process │
            │  (Separate TS)  │
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Gemini  │  │ MongoDB │  │  Status │
   │   API   │  │         │  │  Update │
   └─────────┘  └─────────┘  └─────────┘
```

---

## 📝 Step-by-Step Implementation Plan

### **Phase 1: Project Setup & Configuration** ✅

- [x] Initialize NestJS project
- [ ] Install required dependencies
- [ ] Configure environment variables
- [ ] Set up project structure

**Dependencies to Install:**
```bash
npm install @nestjs/mongoose mongoose
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/bull bull redis
npm install bcryptjs
npm install @google/generative-ai
npm install uuid
npm install @types/bcryptjs @types/passport-jwt @types/uuid
```

---

### **Phase 2: Database Setup** 🔄

#### **Step 2.1: MongoDB Connection**
- [ ] Create `database` module
- [ ] Configure Mongoose connection
- [ ] Add connection string to `.env`

#### **Step 2.2: User Model**
- [ ] Create `users` schema with:
  - `name` (String, required)
  - `email` (String, required, unique)
  - `password` (String, required, hashed)
  - `createdAt` (Date, default: now)
  - `updatedAt` (Date, default: now)

#### **Step 2.3: Content Model**
- [ ] Create `contents` schema with:
  - `userId` (ObjectId, ref: User, required)
  - `type` (String, enum: ['blog_outline', 'caption', 'article', 'social_post'], required)
  - `prompt` (String, required)
  - `generatedText` (String)
  - `status` (String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending')
  - `jobId` (String, unique, required)
  - `createdAt` (Date, default: now)
  - `updatedAt` (Date, default: now)

---

### **Phase 3: Authentication Module** 🔄

#### **Step 3.1: Auth Module Setup**
- [ ] Create `auth` module, controller, service
- [ ] Install JWT strategy
- [ ] Create JWT guard

#### **Step 3.2: Register Endpoint**
- [ ] POST `/auth/register`
  - Validate email, password, name
  - Hash password with bcrypt
  - Save user to MongoDB
  - Return success message

#### **Step 3.3: Login Endpoint**
- [ ] POST `/auth/login`
  - Validate email, password
  - Check user exists
  - Verify password
  - Generate JWT token
  - Return `{ token: "..." }`

#### **Step 3.4: JWT Guard**
- [ ] Create `JwtAuthGuard`
- [ ] Protect routes with `@UseGuards(JwtAuthGuard)`

---

### **Phase 4: Content Module (CRUD)** 🔄

#### **Step 4.1: Content Module Setup**
- [ ] Create `content` module, controller, service
- [ ] Inject User model
- [ ] Inject Content model

#### **Step 4.2: Create Content (Queue Job)**
- [ ] POST `/content`
  - Validate prompt, type
  - Generate unique `jobId` (UUID)
  - Add job to BullMQ queue with 1-minute delay
  - Create content record with status: 'pending'
  - Return `{ jobId: "...", message: "..." }` with 202 status

#### **Step 4.3: Get Content**
- [ ] GET `/content/:id`
  - Verify user owns content
  - Return content data

#### **Step 4.4: Get All User Content**
- [ ] GET `/content`
  - Return all content for authenticated user
  - Support pagination (optional)

#### **Step 4.5: Update Content**
- [ ] PUT `/content/:id`
  - Verify ownership
  - Update content fields
  - Return updated content

#### **Step 4.6: Delete Content**
- [ ] DELETE `/content/:id`
  - Verify ownership
  - Delete from MongoDB
  - Return success message

---

### **Phase 5: Queue System (BullMQ)** 🔄

#### **Step 5.1: Redis & BullMQ Setup**
- [ ] Install Redis (local or cloud)
- [ ] Create `queue` module
- [ ] Configure BullMQ with Redis connection
- [ ] Create queue: `content-generation-queue`

#### **Step 5.2: Queue Producer (Backend)**
- [ ] Inject BullMQ queue in ContentService
- [ ] Add job with delay: 60000ms (1 minute)
- [ ] Job data: `{ prompt, type, userId, jobId }`

#### **Step 5.3: Queue Consumer (Worker)**
- [ ] Create separate `worker.ts` file (or worker module)
- [ ] Process queue jobs
- [ ] After delay, call Gemini API
- [ ] Save result to MongoDB
- [ ] Update content status: 'completed'

---

### **Phase 6: Gemini AI Integration** 🔄

#### **Step 6.1: Gemini Service**
- [ ] Create `gemini` service
- [ ] Configure Gemini API client
- [ ] Add API key to `.env`

#### **Step 6.2: Content Generation**
- [ ] Create method: `generateContent(prompt: string, type: string)`
- [ ] Build prompt based on content type
- [ ] Call Gemini API
- [ ] Return generated text

#### **Step 6.3: Worker Integration**
- [ ] Inject GeminiService in worker
- [ ] Call `generateContent()` in queue processor
- [ ] Handle errors (status: 'failed')

---

### **Phase 7: Job Status API** 🔄

#### **Step 7.1: Status Endpoint**
- [ ] GET `/content/job/:jobId/status`
  - Find content by jobId
  - Return `{ status: "pending|processing|completed|failed", content?: "..." }`

#### **Step 7.2: Frontend Polling**
- [ ] Frontend polls every 5 seconds
- [ ] Show status to user
- [ ] Display content when completed

---

### **Phase 8: Error Handling & Validation** 🔄

#### **Step 8.1: Global Exception Filter**
- [ ] Create custom exception filter
- [ ] Handle validation errors
- [ ] Handle MongoDB errors
- [ ] Return consistent error format

#### **Step 8.2: DTOs & Validation**
- [ ] Create DTOs for all endpoints
- [ ] Add class-validator decorators
- [ ] Validate request bodies

---

### **Phase 9: Testing** 🔄

#### **Step 9.1: Unit Tests**
- [ ] Test AuthService
- [ ] Test ContentService
- [ ] Test GeminiService
- [ ] Test Queue operations

#### **Step 9.2: E2E Tests**
- [ ] Test auth flow
- [ ] Test content CRUD
- [ ] Test queue flow

---

### **Phase 10: Documentation & Deployment** 🔄

#### **Step 10.1: API Documentation**
- [ ] Add Swagger/OpenAPI (optional)
- [ ] Document all endpoints
- [ ] Add request/response examples

#### **Step 10.2: Deployment**
- [ ] Set up environment variables on hosting
- [ ] Deploy backend to Render/AWS
- [ ] Deploy frontend to Vercel
- [ ] Configure Redis (cloud or local)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
APP_PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-content-studio
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-content-studio

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, leave empty if no password

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Backend Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment Variables section)

# 3. Start MongoDB (if local)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

# 4. Start Redis (if local)
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: Download and run Redis

# 5. Run migrations (if any)
# Not required for initial setup

# 6. Start the backend
npm run start:dev

# 7. Start the worker (in a separate terminal)
npm run worker:dev
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Start NestJS backend
npm run start:dev

# Terminal 2: Start worker process
npm run worker:dev

# Terminal 3: Start frontend (in frontend directory)
cd ../ai-content-studio-frontend
npm run dev
```

### Production Mode

```bash
# Build
npm run build

# Start backend
npm run start:prod

# Start worker
npm run worker:prod
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Aman",
  "email": "aman@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "u123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "aman@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Content Endpoints

#### Create Content (Queue Job)
```http
POST /content
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Write a blog outline about climate change",
  "type": "blog_outline"
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "job_789",
  "message": "Your content generation has been queued. It will process in 1 minute."
}
```

#### Get Job Status
```http
GET /content/job/job_789/status
Authorization: Bearer <token>
```

**Response (Pending):**
```json
{
  "status": "pending"
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "content": {
    "_id": "c01",
    "generatedText": "1. Introduction to Climate Change...",
    "type": "blog_outline",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get All Content
```http
GET /content
Authorization: Bearer <token>
```

**Response:**
```json
{
  "content": [
    {
      "_id": "c01",
      "type": "blog_outline",
      "prompt": "Write a blog outline about climate change",
      "generatedText": "1. Introduction...",
      "status": "completed",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Content
```http
GET /content/c01
Authorization: Bearer <token>
```

#### Update Content
```http
PUT /content/c01
Authorization: Bearer <token>
Content-Type: application/json

{
  "generatedText": "Updated content..."
}
```

#### Delete Content
```http
DELETE /content/c01
Authorization: Bearer <token>
```

---

## 🗄 Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Contents Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: ['blog_outline', 'caption', 'article', 'social_post']),
  prompt: String,
  generatedText: String,
  status: String (enum: ['pending', 'processing', 'completed', 'failed']),
  jobId: String (unique, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Queue Architecture

### Job Flow

1. **User submits content request** → POST `/content`
2. **Backend queues job** → BullMQ with 1-minute delay
3. **Backend returns immediately** → 202 Accepted with `jobId`
4. **Worker picks job** → After 1 minute
5. **Worker calls Gemini API** → Generate content
6. **Worker saves to MongoDB** → Update status to 'completed'
7. **Frontend polls status** → GET `/content/job/:jobId/status`

### Queue Configuration

```typescript
// Queue name: 'content-generation'
// Delay: 60000ms (1 minute)
// Concurrency: 1 (process one job at a time)
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🚢 Deployment

### Backend (Render/AWS)

1. Push code to GitHub
2. Connect repository to Render/AWS
3. Set environment variables
4. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables (API URL)
4. Deploy

### Redis (Cloud)

- Use Redis Cloud or AWS ElastiCache
- Update `REDIS_HOST` and `REDIS_PORT` in environment variables

---

## 📁 Project Structure

```
ai-content-studio-backend/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   ├── content/
│   │   ├── content.module.ts
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   └── dto/
│   │       ├── create-content.dto.ts
│   │       └── update-content.dto.ts
│   ├── database/
│   │   └── database.module.ts
│   ├── queue/
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   ├── gemini/
│   │   ├── gemini.module.ts
│   │   └── gemini.service.ts
│   ├── models/
│   │   ├── user.schema.ts
│   │   └── content.schema.ts
│   ├── workers/
│   │   └── content-generation.worker.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 🎯 Next Steps

1. ✅ Complete Phase 1: Project Setup
2. ⏭️ Start Phase 2: Database Setup
3. ⏭️ Continue with remaining phases

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using NestJS**
