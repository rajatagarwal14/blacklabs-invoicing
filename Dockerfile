FROM node:20-alpine AS builder
WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# VITE_API_URL is no longer required for Docker (nginx proxies /api/* internally).
# It is kept as an optional build arg for non-Docker / custom deployments only.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# White-label identity and managed mode are compiled into the bundle by Vite,
# so they are build-time arguments rather than runtime environment variables.
# Per-client images differ only in these values.
ARG VITE_MANAGED_MODE=true
ARG VITE_BRAND_NAME
ARG VITE_BRAND_COMPANY
ARG VITE_BRAND_WEBSITE_URL
ARG VITE_BRAND_SUPPORT_URL
ARG VITE_BRAND_DOCS_URL
ARG VITE_BRAND_PRIVACY_URL
ARG VITE_BRAND_TERMS_URL
ARG VITE_BRAND_LICENSES_URL
ARG VITE_BRAND_CREDIT_UPSTREAM
ENV VITE_MANAGED_MODE=$VITE_MANAGED_MODE \
    VITE_BRAND_NAME=$VITE_BRAND_NAME \
    VITE_BRAND_COMPANY=$VITE_BRAND_COMPANY \
    VITE_BRAND_WEBSITE_URL=$VITE_BRAND_WEBSITE_URL \
    VITE_BRAND_SUPPORT_URL=$VITE_BRAND_SUPPORT_URL \
    VITE_BRAND_DOCS_URL=$VITE_BRAND_DOCS_URL \
    VITE_BRAND_PRIVACY_URL=$VITE_BRAND_PRIVACY_URL \
    VITE_BRAND_TERMS_URL=$VITE_BRAND_TERMS_URL \
    VITE_BRAND_LICENSES_URL=$VITE_BRAND_LICENSES_URL \
    VITE_BRAND_CREDIT_UPSTREAM=$VITE_BRAND_CREDIT_UPSTREAM

RUN npm run build:react
RUN npm run build:webserver

FROM node:20-alpine AS runner
WORKDIR /app

# nginx serves the static frontend and proxies /api/* to the backend;
# gettext provides envsubst to template the nginx config at startup;
# sqlite is needed by deploy/backup.sh, which uses `sqlite3 .backup` to take a
# consistent copy of a live database rather than copying the file underneath a
# writer.
RUN apk add --no-cache nginx gettext sqlite

COPY --from=builder /app/dist-fe /app/dist-fe
COPY --from=builder /app/dist-be /app/dist-be
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3000 3001

COPY scripts/docker-start.sh /app/scripts/docker-start.sh
COPY scripts/nginx.conf.template /app/scripts/nginx.conf.template
RUN sed -i 's/\r$//' /app/scripts/docker-start.sh \
    && chmod +x /app/scripts/docker-start.sh

VOLUME ["/data"]

CMD ["/app/scripts/docker-start.sh"]
