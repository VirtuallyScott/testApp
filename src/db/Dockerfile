# Version stage
FROM alpine as version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN VERSION=$(/get_version.sh)

FROM postgres:15-alpine
ARG VERSION
LABEL version=$VERSION

COPY ./init.sql /docker-entrypoint-initdb.d/
