FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create .env file if it doesn't exist
RUN touch .env

# Expose port
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "dev"] 