# Use Node.js LTS as the base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json files first (for better layer caching)
COPY package*.json ./

# Copy the entire project for building
COPY frontend/ ./frontend/
COPY backend/ ./backend/
COPY config/ ./config/
COPY locales/ ./locales/

# Install dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Fix paths if needed
RUN find /app/run/frontend -name "*.js" -exec sed -i 's|/assets/|./assets/|g' {} \;




# Production stage
FROM node:20-alpine

# Version information
ARG APP_VERSION=dev
LABEL org.opencontainers.image.version=${APP_VERSION}

# Set working directory
WORKDIR /app

# Create directory for database
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV DB_PATH=/data/wine_inventory.db
ENV LOG_LEVEL=info

# Copy package.json files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application from build stage
COPY --from=build /app/backend ./backend
COPY --from=build /app/run/frontend ./run/frontend

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]

# Health check to ensure the application is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
