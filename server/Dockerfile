# Use Node.js official image (Slim version for better Prisma compatibility)
FROM node:18-slim

# Install OpenSSL (Required for Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 7000

# Command to run the application
CMD [ "npm", "start" ]
