# Backend Dockerfile - Node.js (Express)
FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --production

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
