FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Set environment
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/index.js"]
