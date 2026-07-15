# Base node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Package installation
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start Vite dev server exposing hosts
CMD ["npm", "run", "dev", "--", "--host"]
