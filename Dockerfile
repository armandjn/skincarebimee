# syntax=docker/dockerfile:1
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Skincare Bimee website" \
      org.opencontainers.image.description="Static multi-page site served by nginx (API runs in the api service)"

# Replace default site config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/site.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf

# Static site (see .dockerignore for what is excluded)
COPY --chown=nginx:nginx . /usr/share/nginx/html

# Not needed at runtime: Cloudflare-specific files, API source and build tooling
RUN rm -rf /usr/share/nginx/html/functions /usr/share/nginx/html/tools /usr/share/nginx/html/docker /usr/share/nginx/html/api \
           /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/docker-compose.yml /usr/share/nginx/html/.env.example \
           /usr/share/nginx/html/schema.sql /usr/share/nginx/html/_redirects /usr/share/nginx/html/vercel.json

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1
