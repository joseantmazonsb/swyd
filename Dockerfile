# Use Node.js LTS version as base image
FROM node:20 AS builder
# Set working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code to the working directory
COPY . .
# Build the Remix application for production
RUN npm run build

# Use a lightweight Node.js image as the final base image
FROM node:20
# Set working directory inside the container
WORKDIR /app
# Copy built artifacts from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
RUN npm i @remix-run/serve
RUN apt update && apt install wakeonlan iputils-ping -y
# Expose the port your Remix application runs on
ENV PORT 23254
EXPOSE 23254

# Start the Remix production server when the container starts
CMD ["npx", "remix-serve", "./build/server/index.js"]
