# ═══════════════════════════════════════
# FairLens API — Cloud Run Dockerfile
# ═══════════════════════════════════════
FROM node:20-alpine

WORKDIR /app

# Copy server package files and install
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy datasets used by the ML engine
COPY Datasets/ ./Datasets/

# Cloud Run sets the PORT env variable automatically
ENV NODE_ENV=production

# Cloud Run requires listening on the PORT env variable (default 8080)
EXPOSE 8080

# Start the Express API server
CMD ["node", "server/index.js"]
