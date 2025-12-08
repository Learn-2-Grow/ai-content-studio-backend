FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
