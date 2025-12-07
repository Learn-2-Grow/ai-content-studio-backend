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
- ✅ Redis Queue (BullMQ) for async job processing ⚠️ **CRITICAL REQUIREMENT**
- ✅ Job Status Polling API
- ✅ MongoDB for data persistence
- ✅ RESTful API design

### ⚠️ Critical Requirement: Queue System

**The queue system is the core of this assessment.** You MUST:

1. **NOT call AI directly from the backend API**
2. **Add jobs to Redis queue with 1-minute delay**
3. **Return immediately with jobId (202 Accepted)**
4. **Use a separate worker process to process jobs**
5. **Worker calls Gemini API after the delay**
6. **Frontend polls for status**

**This is mandatory, not optional!**

---

## 🚀 Quick Start Guide

### Step 1: Clone and Install
```bash
# Install dependencies
npm install
```

### Step 2: Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your:
# - MongoDB URI
# - JWT Secret
# - Redis connection details
# - Gemini API Key
```

### Step 3: Start Services
```bash
# Terminal 1: Start MongoDB (if local)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Terminal 2: Start Redis (if local)
# macOS: brew services start redis
# Linux: sudo systemctl start redis

# Verify Redis is running:
redis-cli ping
# Should return: PONG
```

### Step 4: Run Application
```bash
# Terminal 1: Start NestJS backend
npm run start:dev

# Terminal 2: Start worker (REQUIRED!)
npm run worker:dev
```

### Step 5: Test API
```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the token from login response for authenticated requests
```

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

> **📋 For detailed task-by-task checklist, see [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)**

### **Phase 1: Project Setup & Configuration** ✅

- [x] Initialize NestJS project
- [ ] Install required dependencies
- [ ] Configure environment variables
- [ ] Set up project structure

**Dependencies to Install:**
```bash
# MongoDB
npm install @nestjs/mongoose mongoose

# JWT Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @types/passport-jwt

# Queue System
npm install @nestjs/bull bull redis

# Password Hashing
npm install bcryptjs
npm install @types/bcryptjs

# AI Integration
npm install @google/generative-ai

# Utilities
npm install uuid
npm install @types/uuid
```

**Quick Install (All at once):**
```bash
npm install @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/bull bull redis bcryptjs @google/generative-ai uuid @types/bcryptjs @types/passport-jwt @types/uuid
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

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

### Required Variables:

```env
# Application
APP_PORT=3000
NODE_ENV=development

# MongoDB
# Local:
MONGODB_URI=mongodb://localhost:27017/ai-content-studio
# Or MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-content-studio

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Redis
# Local:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or Redis Cloud:
# REDIS_HOST=your-redis-host.redis.cloud.redislabs.com
# REDIS_PORT=12345
# REDIS_PASSWORD=your-redis-password

# Google Gemini API
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here
```

### Getting API Keys:

1. **MongoDB Atlas** (if using cloud):
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

2. **Redis Cloud** (if using cloud):
   - Sign up at https://redis.com/try-free/
   - Create a free database
   - Get connection details

3. **Google Gemini API**:
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy to `.env`

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

### Prerequisites Before Running

1. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   
   # Or use MongoDB Atlas (cloud)
   ```

2. **Start Redis:**
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   
   # Windows
   # Download Redis from https://redis.io/download
   
   # Or use Redis Cloud (cloud)
   ```

3. **Verify Services:**
   ```bash
   # Test MongoDB
   mongosh
   
   # Test Redis
   redis-cli ping
   # Should return: PONG
   ```

### Development Mode

```bash
# Terminal 1: Start NestJS backend
npm run start:dev

# Terminal 2: Start worker process (REQUIRED for queue processing)
npm run worker:dev

# Terminal 3: Start frontend (in frontend directory)
cd ../ai-content-studio-frontend
npm run dev
```

**⚠️ Important:** The worker process MUST be running for content generation to work. The backend only queues jobs; the worker processes them.

### Production Mode

```bash
# Build
npm run build

# Start backend (Terminal 1)
npm run start:prod

# Start worker (Terminal 2)
npm run worker:prod
```

### Adding Worker Scripts to package.json

If the worker scripts don't exist, add them:

```json
{
  "scripts": {
    "worker:dev": "ts-node src/workers/content-generation.worker.ts",
    "worker:prod": "node dist/workers/content-generation.worker.js"
  }
}
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

### Thread Endpoints

#### Create Thread
```http
POST /content/threads
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI Healthcare Blog"
}
```

**Response:**
```json
{
  "_id": "thread123",
  "userId": "user123",
  "title": "AI Healthcare Blog",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get All Threads
```http
GET /content/threads
Authorization: Bearer <token>
```

**Response:**
```json
{
  "threads": [
    {
      "_id": "thread123",
      "title": "AI Healthcare Blog",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Thread
```http
GET /content/threads/thread123
Authorization: Bearer <token>
```

#### Update Thread
```http
PUT /content/threads/thread123
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "archived"
}
```

#### Delete Thread
```http
DELETE /content/threads/thread123
Authorization: Bearer <token>
```

---

### Content Endpoints

#### Generate Content (Queue Job) - As per Requirements
```http
POST /generate-content
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Write about AI in healthcare diagnostics",
  "contentType": "blog_post",
  "threadId": "thread123"  // Optional: if provided, content added to existing thread
                            // If not provided, new thread will be auto-created
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "job_789",
  "threadId": "thread123",  // Thread ID (existing or newly created)
  "message": "Your content generation has been queued. It will process in 1 minute."
}
```

**Behavior:**
- **If `threadId` is provided**: Content will be added to that existing thread
- **If `threadId` is NOT provided**: System will automatically create a new thread with the `contentType` and add content to it

#### Get Job Status - As per Requirements
```http
GET /content/:jobId/status
Authorization: Bearer <token>
```

**Example:**
```http
GET /content/job_789/status
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
    "_id": "content001",
    "threadId": "thread123",
    "prompt": "Write about AI in healthcare diagnostics",
    "generatedContent": "AI is revolutionizing healthcare...",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Contents in Thread
```http
GET /content/threads/thread123/contents
Authorization: Bearer <token>
```

**Response:**
```json
{
  "contents": [
    {
      "_id": "content001",
      "threadId": "thread123",
      "prompt": "Write about AI in healthcare",
      "generatedContent": "AI is revolutionizing...",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Content
```http
GET /content/content001
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "content001",
  "threadId": "thread123",
  "prompt": "Write about AI in healthcare",
  "generatedContent": "AI is revolutionizing healthcare...",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:05Z"
}
```

#### Update Content
```http
PUT /content/content001
Authorization: Bearer <token>
Content-Type: application/json

{
  "generatedContent": "Updated content..."
}
```

#### Delete Content
```http
DELETE /content/content001
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

---

## 📊 Content Generation Module - Thread-Based Design

The content generation module uses a thread-based architecture where all contents belong to threads. This allows for organized content management and conversation context.

### **Database Schema**

**Tables Required:** 2 tables

#### Table 1: Threads Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  type: String (enum: ['blog_post', 'product_description', 'social_media_caption', 'article', 'other']),
  status: String (enum: ['active', 'archived', 'deleted']),
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**
- `_id`: Unique thread identifier
- `userId`: Owner of the thread (references User)
- `title`: Thread title
- `type`: Content type (enum: ['blog_post', 'product_description', 'social_media_caption', 'article', 'other'])
- `status`: Thread status (active/archived/deleted)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### Table 2: Contents Collection

```typescript
{
  _id: ObjectId,
  threadId: ObjectId (ref: Thread, required),
  prompt: String,
  generatedContent: String,
  status: String (enum: ['pending', 'processing', 'completed', 'failed']),
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**
- `_id`: Unique content identifier
- `threadId`: Required reference to thread (links content to thread)
- `prompt`: User input/prompt for AI generation
- `generatedContent`: AI-generated content
- `status`: Content generation status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

### **Structure Visualization**

```
Thread (userId: "user123", title: "AI Healthcare Blog", type: "blog_post", status: "active")
  ├── Content 1 (threadId: "thread123", prompt: "Write about AI")
  ├── Content 2 (threadId: "thread123", prompt: "Make it more technical")
  └── Content 3 (threadId: "thread123", prompt: "Add statistics")
```

---

### **Smart Thread Management**

**Auto-Thread Creation:**
- If `threadId` is **provided** in `/generate-content`: Content is added to that existing thread
- If `threadId` is **NOT provided**: System automatically creates a new thread with the `contentType` and adds content to it

**Benefits:**
- ✅ Simplified API: Users don't need to create threads manually
- ✅ Automatic organization: Threads created based on content type
- ✅ Flexible: Users can still explicitly manage threads if needed

---

### **Key Characteristics**

- ✅ **Thread-based**: All contents belong to a thread
- ✅ **User ownership**: User ownership tracked via `threads.userId`
- ✅ **Thread status**: Threads can be active, archived, or deleted
- ✅ **Content status**: Each content has its own generation status
- ✅ **Organized structure**: Threads group related contents together
- ✅ **Context management**: Contents in same thread share context

---

### **Database Schema Summary**

| Table | Key Fields | Purpose |
|-------|------------|---------|
| **threads** | userId, title, status | Container for organizing contents |
| **contents** | threadId, prompt, generatedContent, status | Individual content generations |

---

### **API Endpoints**

#### Thread Management
```
POST   /content/threads                    # Create thread manually (optional - threads auto-created)
GET    /content/threads                    # List user's threads
GET    /content/threads/:id               # Get thread details
PUT    /content/threads/:id               # Update thread (title, type, status)
DELETE /content/threads/:id               # Delete thread
```

#### Content Management (As per Requirements)
```
POST   /generate-content                  # Generate content (queues job, returns jobId) - REQUIRED
GET    /content/:jobId/status              # Get job status - REQUIRED
GET    /content/threads/:id/contents       # Get all contents in thread
GET    /content/:id                       # Get single content
PUT    /content/:id                       # Update content
DELETE /content/:id                       # Delete content
```

---

### **Example Data Flow**

#### Step 1: Generate Content (Auto-Create Thread)
```json
POST /generate-content
{
  "prompt": "Write about AI in healthcare diagnostics",
  "contentType": "blog_post"
  // threadId not provided - system will auto-create thread
}

// Response: Creates thread automatically + queues content
{
  "jobId": "job_789",
  "threadId": "thread123",  // Auto-created thread ID
  "message": "Your content generation has been queued..."
}

// Thread automatically created:
{
  "_id": "thread123",
  "userId": "user123",
  "title": "Blog Post Thread",  // Auto-generated or from prompt
  "type": "blog_post",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Step 2: Generate More Content in Same Thread
```json
POST /generate-content
{
  "threadId": "thread123",  // Use existing thread
  "prompt": "Make it more technical",
  "contentType": "blog_post"
}

// Response: Creates content record
{
  "_id": "content001",
  "threadId": "thread123",  // ← Required, links to thread
  "prompt": "Write about AI in healthcare diagnostics",
  "generatedContent": "",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Step 3: AI Processes Content
```json
// Queue processor picks up job
// → Calls AI service
// → Updates content record

{
  "_id": "content001",
  "threadId": "thread123",
  "prompt": "Write about AI in healthcare diagnostics",
  "generatedContent": "AI is revolutionizing healthcare diagnostics...",
  "status": "completed",
  "updatedAt": "2024-01-15T10:30:05Z"
}
```

#### Step 3: Generate Content in New Thread
```json
POST /generate-content
{
  "prompt": "Write a product description for AI software",
  "contentType": "product_description"
  // No threadId - creates new thread automatically
}

// Response: New thread created
{
  "jobId": "job_790",
  "threadId": "thread124",  // New thread auto-created
  "message": "Your content generation has been queued..."
}

// Response: Creates new content in same thread
// System can fetch previous contents in thread for context
{
  "_id": "content002",
  "threadId": "thread123",
  "prompt": "Make it more technical",
  "generatedContent": "",
  "status": "pending",
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### **Implementation Status**

- ✅ **Thread-based architecture**: Ready for implementation
- ✅ **Queue integration**: Content generation via queue system
- ✅ **Context management**: Contents in same thread share context

---

## 🔄 Queue Architecture

### Job Flow (As per Requirements)

1. **User submits content request** → POST `/generate-content`
2. **Backend queues job** → BullMQ with 1-minute delay (60000ms) - REQUIRED
3. **Backend returns immediately** → 202 Accepted with `jobId` - REQUIRED
4. **Worker picks job** → After 1 minute delay
5. **Worker calls Gemini API** → Generate content
6. **Worker saves to MongoDB** → Update status to 'completed'
7. **Frontend polls status** → GET `/content/:jobId/status` - REQUIRED

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
│   ├── auth/                          # Authentication Module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts        # JWT token validation
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts      # Route protection
│   │   └── dto/
│   │       ├── register.dto.ts       # Registration validation
│   │       └── login.dto.ts           # Login validation
│   │
│   ├── content/                       # Content CRUD Module
│   │   ├── content.module.ts
│   │   ├── content.controller.ts     # REST endpoints
│   │   ├── content.service.ts         # Business logic
│   │   └── dto/
│   │       ├── create-content.dto.ts  # Create validation
│   │       └── update-content.dto.ts   # Update validation
│   │
│   ├── database/                      # Database Configuration
│   │   └── database.module.ts         # MongoDB connection
│   │
│   ├── queue/                         # Queue Module
│   │   ├── queue.module.ts            # BullMQ configuration
│   │   └── queue.service.ts           # Queue operations
│   │
│   ├── gemini/                        # AI Integration
│   │   ├── gemini.module.ts
│   │   └── gemini.service.ts          # Gemini API calls
│   │
│   ├── models/                        # MongoDB Schemas
│   │   ├── user.schema.ts             # User model
│   │   └── content.schema.ts          # Content model
│   │
│   ├── workers/                       # Background Workers
│   │   └── content-generation.worker.ts  # Queue processor
│   │
│   ├── common/                        # Shared Utilities
│   │   ├── decorators/
│   │   │   └── user.decorator.ts      # @User() decorator
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Error handling
│   │   └── guards/
│   │
│   ├── app.module.ts                  # Root module
│   └── main.ts                        # Application entry point
│
├── dist/                              # Compiled JavaScript (generated)
├── test/                              # E2E tests
├── .env                               # Environment variables (NOT in git)
├── .env.example                       # Environment template
├── .gitignore
├── IMPLEMENTATION_CHECKLIST.md        # 📋 Detailed task checklist
├── package.json
├── tsconfig.json
└── README.md                          # This file
```

### **Key Files Explained:**

- **`main.ts`**: Application bootstrap, middleware setup
- **`app.module.ts`**: Root module importing all feature modules
- **`auth/`**: Handles user registration, login, JWT tokens
- **`content/`**: CRUD operations for generated content
- **`queue/`**: BullMQ configuration for Redis queue
- **`workers/`**: Separate process that processes queued jobs
- **`gemini/`**: Google Gemini API integration
- **`models/`**: MongoDB schemas (User, Content)

---

## 🎯 Next Steps

### **Immediate Actions:**

1. **Review the Implementation Checklist**
   - Open [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
   - This file contains detailed step-by-step tasks with checkboxes

2. **Start with Phase 1: Project Setup**
   - Install all dependencies listed above
   - Create `.env` file with required variables
   - Set up project folder structure

3. **Follow the Phases Sequentially**
   - Phase 1: Project Setup ✅ (In Progress)
   - Phase 2: Database Setup
   - Phase 3: Authentication Module
   - Phase 4: Content Module (CRUD)
   - Phase 5: Queue System (BullMQ) ⚠️ **CRITICAL**
   - Phase 6: Gemini AI Integration
   - Phase 7: Error Handling & Validation
   - Phase 8: Testing
   - Phase 9: Documentation
   - Phase 10: Deployment

### **Priority Order:**

1. **Must Complete First:**
   - Phase 1: Setup
   - Phase 2: Database
   - Phase 3: Authentication
   - Phase 4: Content CRUD
   - Phase 5: Queue System ⚠️ **This is the core requirement**
   - Phase 6: Gemini Integration

2. **Then Complete:**
   - Phase 7: Error Handling
   - Phase 8: Testing
   - Phase 9: Documentation

3. **Finally:**
   - Phase 10: Deployment

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using NestJS**
