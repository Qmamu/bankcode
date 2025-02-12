# Use Node.js 18 as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build the project
RUN npm run build

# Generate the sitemap
RUN npx next-sitemap

# Copy the rest of the application code
COPY . .

# Expose ports
EXPOSE 3000

# Start the application
CMD ["npm", "start"]