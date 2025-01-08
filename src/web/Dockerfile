# Version stage
FROM alpine:3.18 AS version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN /get_version.sh > /version

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Get version from previous stage
COPY --from=version /version /version
ARG VERSION=$(cat /version)

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source files
COPY . .

# Build the app
RUN test -f .env || echo "REACT_APP_API_URL=/api/v1" > .env
ENV NODE_ENV=production \
    REACT_APP_VERSION=${VERSION}
RUN npm run build

# Runtime stage
FROM nginx:1.25-alpine
ARG VERSION
LABEL version=$VERSION

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
