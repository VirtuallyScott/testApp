# Version stage
FROM alpine as version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN VERSION=$(/get_version.sh)

FROM redis:7-alpine
ARG VERSION
LABEL version=$VERSION

COPY redis.conf /usr/local/etc/redis/redis.conf
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
