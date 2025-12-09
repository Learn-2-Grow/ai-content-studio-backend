# AI Content Studio - Backend

## Project Description

AI Content Studio is a backend API that helps users create content using AI. Users can generate blog posts, articles, product descriptions, and social media captions. The system uses AI providers like Google Gemini and OpenRouter to create content. It uses queues to handle content generation in the background and sends updates to users in real-time.

## Project Features

- User authentication with JWT tokens (access & refresh tokens)
- Create and manage content threads
- Generate AI content using Gemini or OpenRouter
- Real-time updates using Server-Sent Events (SSE)
- Background job processing with Bull queue
- Store data in MongoDB
- RESTful API with versioning
- Organized codebase structure with shared common utilities

## Prerequisites

Before running this project, make sure you have:

- Node.js (version 20 or higher)
- MongoDB (running locally or connection string)
- Redis (for Bull queue)
- Docker and Docker Compose (optional, for containerized setup)

## How to Run

### Using Docker (Recommended)

1. Create a `.env` file in the root directory with your environment variables
2. Run the development setup:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

3. For production:
```bash
docker-compose up -d --build
```

### Using Node.js

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values (see `.env.example` for all required variables)

4. Start MongoDB and Redis services

5. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Usage

### AI Providers

- **Google Gemini**: Used for content generation. Set `GEMINI_API_KEY` in your `.env` file
- **OpenRouter**: Alternative AI provider. Set `OPENROUTER_API_KEY` in your `.env` file. You can choose which provider to use when generating content

### Content Generation

When you request content generation:
1. The request is added to a Bull queue with Redis
2. The API returns immediately with a job ID
3. A worker processes the job in the background
4. Updates are sent to the client using Server-Sent Events (SSE)

### Server-Sent Events (SSE)

SSE is used to send one-way events from server to client. Clients can connect to `/api/v1/sse/stream?userId=USER_ID` to receive real-time updates about content generation progress.

### MongoDB

MongoDB stores all application data:
- User accounts
- Content threads
- Generated content
- User settings

### Bull Queue with Redis

Bull queue uses Redis to manage background jobs:
- Content generation jobs are queued
- Jobs are processed asynchronously
- Job status can be checked anytime
- Redis must be running for the queue to work


## 🏗 Architecture

### System Flow

```
User Request
    ↓
Frontend (Next.js)
    ↓
NestJS API (Adds job to queue)
    ↓
Redis Queue (BullMQ) - Job queued with delay
    ↓
Worker Process (Processes after delay)
    ↓
AI Provider (Gemini/OpenRouter)
    ↓
MongoDB (Save generated content)
    ↓
SSE Stream (Real-time update to Frontend)
```

### Component Diagram

```
                    ┌─────────────────────┐
                    │   Frontend Client   │
                    │    (Next.js/Web)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              HTTP/REST              SSE Stream
                    │                     │
                    ↓                     ↓
        ┌───────────────────────────────────────────┐
        │        NestJS Backend API                 │
        │  ┌─────────────────────────────────────┐  │
        │  │         API Modules                  │  │
        │  │  ┌──────────┐  ┌──────────┐         │  │
        │  │  │   Auth   │  │  Thread  │         │  │
        │  │  │  Module  │  │  Module  │         │  │
        │  │  └──────────┘  └──────────┘         │  │
        │  │  ┌──────────┐  ┌──────────┐         │  │
        │  │  │ Content  │  │   User   │         │  │
        │  │  │  Module  │  │  Module  │         │  │
        │  │  └────┬─────┘  └──────────┘         │  │
        │  │       │                             │  │
        │  │  ┌────▼──────────┐                  │  │
        │  │  │ Queue Module  │                  │  │
        │  │  │   (BullMQ)    │                  │  │
        │  │  └────┬──────────┘                  │  │
        │  │       │                             │  │
        │  │  ┌────▼──────────┐                  │  │
        │  │  │  SSE Module   │                  │  │
        │  │  │ (Real-time)   │                  │  │
        │  │  └───────────────┘                  │  │
        │  └─────────────────────────────────────┘  │
        └───────────────┬───────────────────────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │    Redis (Bull Queue) │
            │   - Job Storage        │
            │   - Queue Management  │
            └───────────┬───────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │   Queue Processor     │
            │   (Background Worker) │
            │   - Processes jobs    │
            │   - 1 min delay       │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Gemini     │ │  OpenRouter  │ │   MongoDB    │
│     API      │ │     API      │ │   Database   │
│              │ │              │ │              │
│ - Generate   │ │ - Generate   │ │ - Users      │
│   Content    │ │   Content    │ │ - Threads    │
└──────────────┘ └──────────────┘ │ - Content   │
                                  └──────────────┘
```

### Sequence Diagram

![](public/sequence%20diagram.svg)

*Diagram file: [public/sequence-diagram.mmd](public/sequence-diagram.mmd)*



## API Modules

All API endpoints are prefixed with `/api/v1`

### Root Endpoint

#### Health Check
- **Endpoint**: `GET /api/v1/`
- **Description**: Check if API is running
- **Example Request**:
```bash
curl http://localhost:3000/api/v1/
```
- **Example Response**:
```
Hello World!
```

### Authentication Module

#### Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Description**: Create a new user account
- **Example Request**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```
- **Example Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Login and get authentication tokens
- **Example Request**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
- **Example Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Refresh Token
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Description**: Refresh access token using refresh token
- **Example Request**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```
- **Example Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Module

#### Get Current User
- **Endpoint**: `GET /api/v1/users/me`
- **Description**: Get logged-in user information
- **Auth**: Required (JWT token in Authorization header)
- **Example Request**:
```bash
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Example Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "userType": "user"
}
```

### Thread Module

#### Get All Threads
- **Endpoint**: `GET /api/v1/threads`
- **Description**: Get list of user's threads with pagination
- **Auth**: Required
- **Query Parameters**: 
  - `currentPage` (optional, default: 1)
  - `pageSize` (optional, default: 10)
  - `status` (optional: "active", "archived", "deleted")
  - `type` (optional: "blog_post", "article", "product_description", "social_media_caption", "other")
  - `search` (optional: search in title)
- **Example Request**:
```bash
curl "http://localhost:3000/api/v1/threads?currentPage=1&pageSize=10&status=active&type=blog_post" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Example Response**:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "My Blog Post",
      "type": "blog_post",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "currentPage": 1,
  "pageSize": 10
}
```

#### Get Thread Summary
- **Endpoint**: `GET /api/v1/threads/summary`
- **Description**: Get summary statistics of user's threads
- **Auth**: Required
- **Example Request**:
```bash
curl http://localhost:3000/api/v1/threads/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Example Response**:
```json
{
  "totalThreads": 5,
  "threadsByType": {
    "blog_post": 2,
    "article": 2,
    "product_description": 1
  },
  "statusCounts": {
    "active": 4,
    "archived": 1
  },
  "threadIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

#### Get Single Thread
- **Endpoint**: `GET /api/v1/threads/:id`
- **Description**: Get details of a specific thread with all its content
- **Auth**: Required
- **Example Request**:
```bash
curl http://localhost:3000/api/v1/threads/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Example Response**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "title": "My Blog Post",
  "type": "blog_post",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "contents": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "threadId": "507f1f77bcf86cd799439012",
      "prompt": "Write about AI",
      "generatedContent": "Artificial Intelligence is...",
      "status": "completed",
      "provider": "gemini",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "lastContent": {
    "_id": "507f1f77bcf86cd799439014",
    "generatedContent": "Artificial Intelligence is...",
    "status": "completed"
  }
}
```

### Content Module

#### Generate Content
- **Endpoint**: `POST /api/v1/content/generate`
- **Description**: Generate AI content and add to queue. Returns immediately with job info.
- **Auth**: Required
- **Example Request**:
```bash
curl -X POST http://localhost:3000/api/v1/content/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about artificial intelligence and its impact on society",
    "contentType": "blog_post",
    "threadId": "507f1f77bcf86cd799439012",
    "provider": "gemini"
  }'
```
- **Example Response**:
```json
{
  "jobId": "job_123456789",
  "status": "queued",
  "message": "Content generation job added to queue",
  "contentId": "507f1f77bcf86cd799439015"
}
```
- **Note**: Content is generated in background. Connect to SSE endpoint to receive real-time updates.

#### Get Content
- **Endpoint**: `GET /api/v1/content/:id`
- **Description**: Get generated content by ID
- **Auth**: Required
- **Example Request**:
```bash
curl http://localhost:3000/api/v1/content/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Example Response**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "threadId": "507f1f77bcf86cd799439012",
  "prompt": "Write about artificial intelligence and its impact on society",
  "generatedContent": "Artificial Intelligence (AI) has revolutionized...",
  "status": "completed",
  "provider": "gemini",
  "createdAt": "2024-01-15T10:40:00.000Z",
  "updatedAt": "2024-01-15T10:45:00.000Z",
  "statusUpdatedAt": "2024-01-15T10:45:00.000Z"
}
```

### SSE Module

#### Stream Events
- **Endpoint**: `GET /api/v1/sse/stream?userId=USER_ID`
- **Description**: Connect to Server-Sent Events stream for real-time updates about content generation
- **Auth**: Not required (but should be added in future)
- **Example Request** (using JavaScript EventSource):
```javascript
const eventSource = new EventSource('http://localhost:3000/api/v1/sse/stream?userId=507f1f77bcf86cd799439011');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received update:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```
- **Example Event Data**:
```json
{
  "type": "content_status_update",
  "contentId": "507f1f77bcf86cd799439015",
  "status": "processing",
  "message": "Generating content..."
}
```
- **Example Event Data (Completed)**:
```json
{
  "type": "content_completed",
  "contentId": "507f1f77bcf86cd799439015",
  "status": "completed",
  "generatedContent": "Artificial Intelligence (AI) has revolutionized..."
}
```
- **Note**: This is a one-way stream from server to client. Keep the connection open to receive updates.

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   ├── enums/
│   ├── filters/
│   ├── guards/
│   ├── helpers/
│   ├── interfaces/
│   ├── strategies/
│   └── validators/
├── modules/
│   ├── ai/
│   ├── auth/
│   ├── content/
│   ├── database/
│   ├── queue/
│   ├── sse/
│   ├── thread/
│   └── user/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

## Content Types

Supported content types:
- `blog_post` - Blog posts and articles
- `product_description` - Product descriptions
- `social_media_caption` - Social media posts
- `article` - General articles
- `other` - Other types of content

## AI Providers

- `gemini` - Google Gemini AI
- `openrouter` - OpenRouter AI service
