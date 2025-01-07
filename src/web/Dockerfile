# Version stage
FROM alpine AS version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN VERSION=$(/get_version.sh)

# Build stage
FROM node:18-alpine AS builder
ARG VERSION
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --quiet

# Copy source files
COPY src ./src
COPY public ./public
COPY tsconfig.json ./

# Create .env if it doesn't exist
RUN test -f .env || echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env

# Build
ENV NODE_ENV=production
RUN npm run build

# Runtime stage
FROM nginx:alpine
ARG VERSION
LABEL version=$VERSION

# Copy only the built files from builder
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set correct permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
