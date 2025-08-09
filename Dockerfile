# Pulls base image 
FROM node:24-slim

# Goes to app directory
WORKDIR /app

# Copy package.json 
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

#build the application
RUN npm run dev

# Set port environment variable
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npx", "next", "start"]

