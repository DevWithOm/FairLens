FROM node:20-alpine

WORKDIR /app

# Copy root files
COPY package.json ./

# Install client dependencies and build
COPY client/ ./client/
RUN cd client && npm install && npm run build

# Install server dependencies
COPY server/ ./server/
RUN cd server && npm install

# Copy datasets
COPY Datasets/ ./Datasets/

# Expose port
EXPOSE 5000

# Set production mode
ENV NODE_ENV=production
ENV PORT=5000

# Start the server (serves built client in production)
CMD ["node", "server/index.js"]
