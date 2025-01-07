# Version stage
FROM alpine:3.18 AS version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN VERSION=$(/get_version.sh)

# Build stage
FROM node:18-alpine AS builder
ARG VERSION
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --silent
RUN npm install -g typescript@4.9.5

# Copy source files
COPY src ./src
COPY public ./public

# Create .env if it doesn't exist
RUN test -f .env || echo "REACT_APP_API_URL=/api/v1" > .env

# Build with production settings
ENV NODE_ENV=production
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
