FROM node:24-alpine
ENV NODE_ENV=production DB_PATH=/data/bimee.db PORT=3000
WORKDIR /app
COPY package.json server.js ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
