FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Expose port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=db
ENV DB_USER=ctf_user
ENV DB_PASSWORD=ctf_password
ENV DB_DATABASE=ctf_challenge

# Wait for database before starting
CMD ["node", "server.js"]