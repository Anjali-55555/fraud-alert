# Base node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Package installation
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose API port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
