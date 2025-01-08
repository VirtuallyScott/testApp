# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --prefer-offline

# Copy source files
COPY . .

# Set environment variables and build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=/api/v1
ENV GENERATE_SOURCEMAP=false

# Build with increased memory and cache
RUN --mount=type=cache,target=/app/.cache \
    npm run build

# Runtime stage
FROM nginx:1.25-alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Set correct permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
