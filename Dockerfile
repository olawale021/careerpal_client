# Use Node.js LTS (Long Term Support) as base image with platform specification
FROM --platform=linux/amd64 node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Start the application with explicit health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]